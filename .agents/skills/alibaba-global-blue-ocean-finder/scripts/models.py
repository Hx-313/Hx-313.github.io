"""
Data models for the blue-ocean-finder skill.

Defines the core data structures for the pipeline:
BlueOceanOpportunity/OpportunityList (Step 3), OpportunityAnswer/OpportunityAnswerList (Step 4),
SkillError (error handling), and language detection utilities for bilingual support.
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field
from typing import Any


def detect_language(text: str) -> str:
    """Detect whether the input text is primarily Chinese or English.

    Uses a simple heuristic: if the text contains any CJK Unified Ideograph
    characters (Unicode range U+4E00–U+9FFF), it is classified as Chinese.

    Args:
        text: The input text to classify.

    Returns:
        ``"zh"`` for Chinese, ``"en"`` for English.
    """
    if re.search(r'[\u4e00-\u9fff]', text):
        return 'zh'
    return 'en'


# ---------------------------------------------------------------------------
# Blue Ocean Scoring Model
# ---------------------------------------------------------------------------

def compute_blue_ocean_score(
    demand: float,
    competition: float,
    growth: float,
    fit: float = 3.0,
) -> float:
    """Compute the composite Blue Ocean Score.

    Formula: (D × 0.35) + ((6 - C) × 0.30) + (G × 0.25) + (F × 0.10)

    Args:
        demand: Demand intensity (1-5)
        competition: Competition density (1-5, lower is better)
        growth: Growth slope (1-5)
        fit: Capability fit (1-5, default 3.0 for non-Scene-D)

    Returns:
        Composite score (1.0 - 5.0)
    """
    return (demand * 0.35) + ((6 - competition) * 0.30) + (growth * 0.25) + (fit * 0.10)


def score_to_emoji(score: float) -> str:
    """Convert Blue Ocean Score to recommendation emoji."""
    if score >= 4.0:
        return '🟢'
    if score >= 3.0:
        return '🟡'
    return '🔴'


# ---------------------------------------------------------------------------
# Scene Detection
# ---------------------------------------------------------------------------

_SCENE_KEYWORDS: dict[str, dict[str, list[str]]] = {
    'A': {
        'zh': ['站外热销', 'Amazon热卖', 'Temu热卖', '国际站供给小', '供需错配', '站外爆款'],
        'en': ['cross-platform gap', 'amazon hot', 'temu hot', 'supply gap', 'demand-supply mismatch'],
    },
    'B': {
        'zh': ['蓝海', '国际站蓝海', '竞争度不大', '低竞争高销量', '竞争度低', '站内蓝海'],
        'en': ['blue ocean', 'alibaba blue ocean', 'low competition', 'high sales low competition'],
    },
    'C': {
        'zh': ['地区需求潜力', '全球市场', '进入优先级', '哪个国家市场', '地区市场'],
        'en': ['regional demand', 'global market', 'market priority', 'which country', 'regional potential'],
    },
    'D': {
        'zh': ['我的工厂', '我的优势是', '能力匹配', '适合我做的', '工厂能力'],
        'en': ['my factory', 'my advantage', 'capability match', 'suitable for me', 'factory capability'],
    },
    'E': {
        'zh': ['黑马款', '增速最快', '潜力新品', '90天', '趋势拐点', '黑马'],
        'en': ['dark horse', 'fastest growing', 'emerging product', '90 day', 'trend inflection'],
    },
}


def detect_scenes(query: str, language: str) -> list[str]:
    """Detect which scenes (A-E) are triggered by the user query.

    Args:
        query: User query string.
        language: Detected language code ("zh" or "en").

    Returns:
        List of triggered scene IDs (e.g., ["A", "C"]).
    """
    query_lower = query.lower()
    triggered: list[str] = []
    for scene_id, kw_map in _SCENE_KEYWORDS.items():
        keywords = kw_map.get(language, kw_map.get('en', []))
        for kw in keywords:
            if kw.lower() in query_lower:
                triggered.append(scene_id)
                break
    return triggered if triggered else ['A']  # default to Scene A


# ---------------------------------------------------------------------------
# Sub-Question / Opportunity Models
# ---------------------------------------------------------------------------

@dataclass
class BlueOceanOpportunity:
    """A blue ocean opportunity identified during analysis.

    Attributes:
        opportunity_id: Unique identifier, e.g. "1", "2", "3"
        opportunity_name: Short name for the opportunity (e.g., "Smart LCD Portable Blender")
        question_text: The analytical question driving this opportunity
        target_scene: Scene ID (A/B/C/D/E)
        demand_score: Demand intensity (1-5)
        competition_score: Competition density (1-5, lower is better)
        growth_score: Growth slope (1-5)
        fit_score: Capability fit (1-5, default 3.0)
        blue_ocean_score: Computed composite score
        source_tools: Which tools/data sources inform this opportunity
    """

    opportunity_id: str
    opportunity_name: str
    question_text: str
    target_scene: str
    demand_score: float = 3.0
    competition_score: float = 3.0
    growth_score: float = 3.0
    fit_score: float = 3.0
    blue_ocean_score: float = 0.0
    source_tools: list[str] = field(default_factory=list)


@dataclass
class OpportunityList:
    """Collection of blue ocean opportunities with metadata.

    Attributes:
        scenes: Detected scene IDs (e.g., ["A", "C"])
        user_query: Original user query string
        category: Product category
        opportunities: List of identified opportunities
        language: Detected language code ("zh" or "en")
    """

    scenes: list[str]
    user_query: str
    category: str
    opportunities: list[BlueOceanOpportunity] = field(default_factory=list)
    language: str = field(default='en')

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False, indent=2)

    @classmethod
    def from_json(cls, json_str: str) -> OpportunityList:
        data = json.loads(json_str)
        opps = [BlueOceanOpportunity(**o) for o in data.get('opportunities', [])]
        return cls(
            scenes=data['scenes'],
            user_query=data['user_query'],
            category=data.get('category', ''),
            opportunities=opps,
            language=data.get('language', 'en'),
        )


@dataclass
class OpportunityAnswer:
    """Structured answer for a blue ocean opportunity.

    Attributes:
        opportunity_id: Matches BlueOceanOpportunity.opportunity_id
        answer_text: Human-readable analysis narrative (≥150 words)
        data_points: List of key-value quantitative data
        confidence_level: "high", "medium", or "low"
        analysis_reasoning: Step-by-step reasoning (≥100 words)
        conclusion: One-line conclusion with key number
        citations: Data source references (tool names / URLs)
        presentation_format: "table", "text", "chart", or "mixed"
        chart_suggestion: Optional chart description
        recommended_products: Products identified by this analysis.
            Each entry: {"name": "...", "source": "amazon/alibaba/web", "reason": "..."}
        demand_score: Final demand intensity (1-5)
        competition_score: Final competition density (1-5)
        growth_score: Final growth slope (1-5)
        fit_score: Final capability fit (1-5)
        blue_ocean_score: Final computed composite score
    """

    opportunity_id: str
    answer_text: str
    data_points: list[dict[str, str]]
    confidence_level: str
    analysis_reasoning: str
    conclusion: str
    citations: list[str] = field(default_factory=list)
    presentation_format: str = field(default='table')
    chart_suggestion: str = field(default='')
    recommended_products: list[dict[str, str]] = field(default_factory=list)
    demand_score: float = 3.0
    competition_score: float = 3.0
    growth_score: float = 3.0
    fit_score: float = 3.0
    blue_ocean_score: float = 0.0


@dataclass
class OpportunityAnswerList:
    """Collection of opportunity answers."""

    answers: list[OpportunityAnswer] = field(default_factory=list)

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False, indent=2)

    @classmethod
    def from_json(cls, json_str: str) -> OpportunityAnswerList:
        data = json.loads(json_str)
        answers = [OpportunityAnswer(**a) for a in data.get('answers', [])]
        return cls(answers=answers)


@dataclass
class SkillError:
    """Structured error response for skill pipeline failures.

    Attributes:
        step_name: Which step failed
        error_type: Error category
        error_description: Human-readable error description
        recoverable: Whether the pipeline can continue past this error
    """

    step_name: str
    error_type: str
    error_description: str
    recoverable: bool
