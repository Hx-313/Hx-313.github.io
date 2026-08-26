# Step 4 Sub-questions Script

```python
import sys
sys.path.insert(0, '/jungle-scout-deep-dive-analyzer/scripts')
from models import SubQuestion, SubQuestionList, detect_language
from pipeline import save_subquestions

subquestions = SubQuestionList(
    question_type="Market Opportunity",
    user_query=user_query,
    language=detect_language(user_query),
    questions=[
        SubQuestion(
            question_id="1",
            question_text="Main keyword volume is only 442, but 50 related keywords exist. Calculate the aggregate search volume of the top 20 related keywords from keywords_market.csv. If the aggregate exceeds 5,000, the market has sufficient long-tail demand despite the low main keyword. Also identify the top 3 keywords by volume-to-competition ratio.",
            target_dimension="market_size_demand",
            expected_answer_format="table + aggregate_calculation",
            source_indicators=["search_volume", "related_keyword_count"],
        ),
        # ... 7 more questions, each with specific data premises and cross-references
    ],
)
save_subquestions(subquestions, base_dir="/round-{N}")
```
