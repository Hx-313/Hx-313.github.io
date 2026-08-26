# 发布成功 · 结果卡片 JSON 协议

`apply_governance`（MCP 调用）成功后，在回复中附带以下 JSON，供工作台渲染发布结果卡片。若宿主环境无此 UI，可仅保留文字摘要。

## JSON 结构

```json
{
  "components": {
    "fileReference": {
      "list": [
        {
          "fileName": "商品治理批量发布结果",
          "fileType": "csv",
          "displayType": "商品优化",
          "fileUrl": "<本地 CSV 中间产物的文件路径>"
        }
      ]
    }
  }
}
```

## 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `fileName` | 是 | 固定为 `商品治理批量发布结果` |
| `fileType` | 是 | 固定为 `csv` |
| `displayType` | 是 | 固定为 `商品优化` |
| `fileUrl` | 是 | 本地 CSV 中间产物的文件路径，禁止使用占位假链接 |

## 注意事项

- `fileUrl` 使用本地 CSV 中间产物的文件路径
- 发布失败或用户未确认发布时，不要输出此 JSON
