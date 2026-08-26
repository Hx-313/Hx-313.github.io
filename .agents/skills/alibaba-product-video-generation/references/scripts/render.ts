// Skill 脚本 — 零依赖，输出遵循纯 stdout 协议
// 协议: stdout 最后一行 JSON { success, data, slot?: { skillId, renderer, payload } }
// 参考文档： https://aliyuque.antfin.com/mengping.zmp/mbys3a/eqcbxuf1e41yxzvb#Ls0f2
const input = JSON.parse(process.argv[2] ?? "{}");

const result = {
  success: true,
  data: "",
  slot: {
    skillId: "创意工坊视频生成",
    renderer: "index",
    payload: input,
  },
  styles: {
    height: 62,
  },
};

process.stdout.write(JSON.stringify(result) + "\n");
