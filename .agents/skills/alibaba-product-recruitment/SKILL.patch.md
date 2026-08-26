## URL 参数安全性与校验 (重要限制)

为确保输出中的链接准确有效，必须严格遵守以下 `strategy_tagKey` 的赋值规则：

- **严禁使用的值**：**禁止**将 `topicTagList` 中的枚举值（如 `HIGH_EFFECT_SHORT_SUPPLY`、`NEW_CREATE`、`WORLD_CUP`）填入 URL 的 `strategy_tagKey` 参数中。
- **允许使用的值**：该参数仅允许使用以下有效的 Tab 代码：`GLOBAL_HOT`、`ICBU_HOT`、`ICBU_SHORT`、`OVERSEA_TREND_TOPIC`、`SEMI_MANAGE`。
- **默认缺省规则**：若无法确定具体所属页签，或查询属于通用的“市场热卖”搜索，**必须默认使用 `ICBU_HOT`**。
- **自检流程**：在渲染包含链接的表格前，必须二次检查 `strategy_tagKey` 是否属于上述 5 个允许值之一。若不匹配，强制重置为 `ICBU_HOT`。
