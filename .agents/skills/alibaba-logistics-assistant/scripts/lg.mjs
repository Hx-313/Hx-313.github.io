#!/usr/bin/env node
/**
 * lg.mjs — alibaba-logistics-assistant 物流工具入口（v4 · 瘦客户端）
 *
 * 架构：主 agent → lg.mjs → accio-mcp-cli → dispatcher 41278 → logistics_start/poll/cancel(41529/30/31)
 *   - **进度 / 最终结果文本已下沉到 logistics_poll 路由(41530)**，lg.mjs 只转发服务端算好的字段。
 *     改文案 / 事件解析逻辑 = 改路由，**不再发 aiclaw**。
 *     progress = appbuilder 每次工具调用注入的 purpose(LLM 单行步骤说明)；41530 从 session.log 的
 *     tool_call_start(工具执行**前**写)/tool_call 读其顶层 purpose → 页面把 progress 当「当前步骤」实时展示。
 *     (41530 端固定枚举文案 / 心跳兜底已移除，purpose 比固定文案更实时、更贴合 agent 实际在做什么。)
 *   - lg.mjs 仅保留客户端独占/兜底职责：
 *     ① 读 ACCIO_TRACE_CONTEXT.conversationId 维护 cid → sparko_sid 续话（Accio 运行时独占）
 *     ② cursor / startedAt / hbEmitted / lang 跨 turn 状态，poll 时传给路由
 *     ③ 客户端总超时熔断（>5min 自动 cancel），防服务端卡死时主 agent 无限 poll 烧 token
 *
 * 三件套：start "<原话>" / poll <task_id> / cancel <task_id> [reason]
 * stdout：start  {ok,task_id,session_id,lang,status,progress,reused}
 *         poll   {status:"running"|"done"|"failed"|"cancelled", progress?, result?, error?}
 *         cancel {ok,cancelled}
 *   progress="" 时主 agent 保持 assistant content="" 静默
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const MCP_CLI = process.env.LG_MCP_CLI || 'accio-mcp-cli';
const STATE_DIR = process.env.LG_STATE_DIR || os.tmpdir();
const MAX_TOTAL_MS = Number(process.env.LG_MAX_TOTAL_MS) || 300_000;  // 5 min

// 初始 "思考中" 文案（仅这 2 个稳定串留客户端；其余动态进度文案都在 41530 路由）
const THINKING = { zh: '思考中…', en: 'Thinking…' };

function emit(obj) { process.stdout.write(JSON.stringify(obj) + '\n'); }
function die(msg, code = 2) { process.stderr.write(`[lg] ${msg}\n`); process.exit(code); }
function getCid() {
  try { return JSON.parse(process.env.ACCIO_TRACE_CONTEXT || '{}').conversationId || ''; } catch { return ''; }
}
function detectLang(text) { return /[　-鿿＀-￯]/.test(text || '') ? 'zh' : 'en'; }

function callMcp(apiName, params) {
  return new Promise((resolve, reject) => {
    let stdout = '', stderr = '';
    // accio-mcp-cli call ali_logistics_util --json '{apiName, params}'（params 已序列化为字符串）
    const payload = JSON.stringify({ apiName, params: JSON.stringify(params) });
    const isWin = process.platform === 'win32';
    const args = ['call', 'ali_logistics_util', '--json', payload];
    // On Windows, shell: true with array args can mess up JSON quoting.
    // Try shell: false first, or handle the .cmd suffix.
    let exe = MCP_CLI;
    if (isWin && !exe.toLowerCase().endsWith('.cmd') && !exe.toLowerCase().endsWith('.exe')) {
      exe += '.cmd';
    }
    const cli = spawn(exe, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: false });
    cli.stdout.on('data', (d) => { stdout += d.toString(); });
    cli.stderr.on('data', (d) => { stderr += d.toString(); });
    cli.on('error', (e) => reject(new Error(`spawn ${MCP_CLI} 失败: ${e.message}`)));
    cli.on('close', (code) => {
      if (code !== 0) return reject(new Error(`${MCP_CLI} exit ${code}: ${(stderr || stdout).slice(0, 200)}`));
      try { resolve(JSON.parse(stdout)); }
      catch (e) { reject(new Error(`${MCP_CLI} output 非 JSON: ${stdout.slice(0, 200)}`)); }
    });
  });
}

// state 文件：/tmp/lg-cid-<cid>.json {active_sparko_sid} 跨 turn 续话；/tmp/lg-sid-<sid>.json {cursor,lang,startedAt,hbEmitted}
function cidFile(cid) { return path.join(STATE_DIR, `lg-cid-${cid}.json`); }
function sidFile(sid) { return path.join(STATE_DIR, `lg-sid-${sid}.json`); }
function loadJSON(p, dft) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return dft; } }
function saveJSON(p, obj) { try { fs.writeFileSync(p, JSON.stringify(obj)); } catch {} }
function rmIfExists(p) { try { fs.unlinkSync(p); } catch {} }

async function cmdStart(taskInput) {
  if (!taskInput) die('start 需要 task_input（用户原话）');
  const cid = getCid();
  const lang = detectLang(taskInput);

  // 续话：读 cid 文件拿上一轮 sparko_sid
  let activeSid = null;
  if (cid) activeSid = loadJSON(cidFile(cid), {}).active_sparko_sid || null;

  const params = { task_input: taskInput };
  if (activeSid) params.session_id = activeSid;

  let r;
  try { r = await callMcp('logistics_start', params); }
  catch (e) { return emit({ ok: false, error: `start 失败: ${e.message}` }); }
  if (r.code === -1) return emit({ ok: false, error: r.message || 'start failed (-1)' });

  const data = r.data || {};
  const sparkoSid = data.session_id;
  if (!sparkoSid) {
    process.stderr.write(`[lg][debug] logistics_start raw response: ${JSON.stringify(r)}\n`);
    return emit({ ok: false, error: 'start 未返回 session_id', _debug_raw: r });
  }

  if (cid) saveJSON(cidFile(cid), { active_sparko_sid: sparkoSid, lastTurnAt: Date.now() });

  const existed = loadJSON(sidFile(sparkoSid), null);
  saveJSON(sidFile(sparkoSid), {
    cursor: existed && Number.isFinite(existed.cursor) ? existed.cursor : 0,
    lang, startedAt: Date.now(), hbEmitted: false,
  });

  emit({ ok: true, task_id: sparkoSid, session_id: sparkoSid, lang, status: 'running', progress: THINKING[lang], reused: !!data.reused });
}

async function cmdPoll(taskId) {
  if (!taskId) die('poll 需要 task_id');
  const sid = taskId;
  const st = loadJSON(sidFile(sid), { cursor: 0, lang: 'zh', startedAt: 0, hbEmitted: false });
  const lang = st.lang || 'zh';
  const cursor = Number.isFinite(st.cursor) ? st.cursor : 0;
  const elapsed = st.startedAt ? Date.now() - st.startedAt : 0;

  // 客户端总超时熔断（>5min 自动 cancel）
  if (st.startedAt && elapsed > MAX_TOTAL_MS) {
    try { await callMcp('logistics_cancel', { session_id: sid, reason: 'client_timeout' }); } catch (_) {}
    rmIfExists(sidFile(sid));
    const cid = getCid(); if (cid) rmIfExists(cidFile(cid));
    return emit({ status: 'failed', error: `客户端总超时 ${Math.round(MAX_TOTAL_MS / 1000)}s，已自动取消` });
  }

  let r;
  // lang / elapsed_ms / hb_emitted 传给路由：进度文案、心跳、最终文本都由 41530 服务端算好
  try { r = await callMcp('logistics_poll', { session_id: sid, cursor, lang, elapsed_ms: elapsed, hb_emitted: !!st.hbEmitted }); }
  catch (e) { return emit({ status: 'running', progress: '', error_hint: e.message }); }
  if (r.code === -1) return emit({ status: 'failed', error: r.message || 'poll failed (-1)' });

  const data = r.data || {};
  // 持久化服务端给的 cursor + hb_emitted（跨 turn 续话 / 下一次 poll 用）
  saveJSON(sidFile(sid), {
    ...st,
    cursor: Number.isFinite(data.next_cursor) ? data.next_cursor : cursor,
    hbEmitted: (data.hb_emitted != null) ? data.hb_emitted : st.hbEmitted,
  });

  // 直接转发服务端算好的字段（文案逻辑全在 41530 路由）
  if (data.status === 'done') return emit({ status: 'done', result: data.result || '', duration_ms: st.startedAt ? Date.now() - st.startedAt : undefined });
  if (data.status === 'cancelled') return emit({ status: 'cancelled' });
  if (data.status === 'failed') return emit({ status: 'failed', error: data.error || 'failed' });
  return emit({ status: 'running', progress: data.progress || '' });
}

async function cmdCancel(taskId, reasonParts) {
  if (!taskId) die('cancel 需要 task_id');
  const sid = taskId;
  const reason = (reasonParts || []).join(' ').trim() || 'user cancel';
  try {
    const r = await callMcp('logistics_cancel', { session_id: sid, reason });
    rmIfExists(sidFile(sid));
    const cid = getCid(); if (cid) rmIfExists(cidFile(cid));
    emit({ ok: true, cancelled: !!(r.data && r.data.cancelled), task_id: sid });
  } catch (e) {
    emit({ ok: false, error: e.message, task_id: sid });
  }
}

const [, , subcmd, ...rest] = process.argv;
if (!subcmd) die('用法: lg.mjs <start|poll|cancel> [args...]');
const handler = {
  start:  () => cmdStart(rest.join(' ').trim()),
  poll:   () => cmdPoll(rest[0]),
  cancel: () => cmdCancel(rest[0], rest.slice(1)),
}[subcmd];
if (!handler) die(`未知 subcommand: ${subcmd}（仅支持 start / poll / cancel）`);
handler().catch((e) => die(`未捕获异常: ${e.stack || e.message}`, 1));
