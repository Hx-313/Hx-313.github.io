# Step 5 Answer Template

```python
import sys, os, json
sys.path.insert(0, '/jungle-scout-deep-dive-analyzer/scripts')
from models import SubQuestionAnswer, SubQuestionAnswerList
from pipeline import save_subquestion_answers

answers = SubQuestionAnswerList(answers=[
    SubQuestionAnswer(
        question_id="1",
        answer_text="...",  # comprehensive with ≥3 specific numbers from CSV data
        data_points=[...],  # ≥3 entries for table/mixed format
        confidence_level="high",
        analysis_reasoning="...",  # step-by-step calculations
        conclusion="...",  # One sentence with THE key number
        citations=["keywords_market.csv", "indicator_framework"],
        presentation_format="mixed",
        chart_suggestion="",
        recommended_asins=[],  # Include when analysis identifies specific products
    ),
    # ... repeat for all 8 questions with EQUAL depth
])
save_subquestion_answers(answers, base_dir="/round-{N}")
```
