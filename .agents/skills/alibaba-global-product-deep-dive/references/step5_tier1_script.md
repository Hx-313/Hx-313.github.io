# Step 5c Tier 1 Script

**Step 1** — `write_file` to create the runner script:
```python
# File: /round-{N}/data/run_tier1.py
import sys
sys.path.insert(0, '/jungle-scout-deep-dive-analyzer/scripts')
from pipeline import generate_ranked_recommendations

ranked = generate_ranked_recommendations(base_dir="/round-{N}")
print(f"Analysis-driven recommendations: {len(ranked)} products")
for r in ranked[:10]:
    print(f"  {r['asin']} — {r['dimension_count']} dimensions — {r['title'][:60]}")
```

**Step 2** — `bash_command` to execute:
```bash
python /round-{N}/data/run_tier1.py
```
