# Step 5a Data Extraction Script

```python
import sys, os, json
sys.path.insert(0, '/jungle-scout-deep-dive-analyzer/scripts')
from answer_with_js_data import set_data_dir, extract_relevant_data
from pipeline import load_subquestions

base_dir = '/round-{N}'
set_data_dir(os.path.join(base_dir, 'data'))

with open(os.path.join(base_dir, 'data/indicator_framework.json')) as f:
    indicators = json.load(f)

subquestions = load_subquestions(base_dir)

print("=== INDICATOR FRAMEWORK ===")
print(json.dumps(indicators, indent=2, default=str))

for q in subquestions.questions:
    data = extract_relevant_data(q)
    print(f"\n=== Q{q.question_id}: {q.target_dimension} ===")
    print(f"Question: {q.question_text}")
    print(f"Data keys: {list(data.keys())}")
    for csv_name, csv_data in data.items():
        if isinstance(csv_data, dict):
            for k, v in csv_data.items():
                if k.startswith('top_') or k == 'all_brands' or k == 'trend_data':
                    print(f"  {csv_name}.{k}: [{len(v)} rows]")
                else:
                    print(f"  {csv_name}.{k}: {v}")
```
