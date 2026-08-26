"""
Data models for the hot-product-insight skill.

Defines the core data structures for the pipeline:
HotProduct/HotProductList (Step 3), ProductInsight/ProductInsightList (Step 4),
SkillError (error handling), and language detection / scene routing utilities.
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field
from typing import Any


def detect_language(text: str) -> str:
    """Detect whether the input text is primarily Chinese or English.

    CJK Unified Ideograph (U+4E00–U+9FFF) → zh, otherwise → en.
    Call ONCE in Step 1, pass globally.
    """
    if re.search(r'[\u4e00-\u9fff]', text):
        return 'zh'
    return 'en'


# ---------------------------------------------------------------------------
# Scene Detection
# ---------------------------------------------------------------------------

_SCENE_KEYWORDS: dict[str, dict[str, list[str]]] = {
    'A': {
        'zh': ['国际站热卖', '国际站爆款', 'Alibaba热卖', '国际站热销', '询盘增长'],
        'en': ['alibaba hot', 'alibaba.com best seller', 'alibaba trending', 'inquiry growth'],
    },
    'B': {
        'zh': [
            '热卖', '爆品', '爆款', '销量排名', '热销', '畅销', 'Amazon热销', 'Temu热销',
            'TikTok热销', '跨平台', '销量前列',
        ],
        'en': [
            'hot product', 'best seller', 'top selling', 'trending product',
            'amazon hot', 'temu hot', 'tiktok hot', 'cross-platform', 'sales ranking',
        ],
    },
    'C': {
        'zh': ['美国', '东南亚', '欧洲', '中东', '日本', '地区畅销', '当地热销', '哪个国家'],
        'en': ['united states', 'southeast asia', 'europe', 'middle east', 'japan', 'regional', 'local market'],
    },
    'D': {
        'zh': ['价格区间', '询盘最高', '访问最高', '价格带', '价格在'],
        'en': ['price range', 'highest inquiry', 'most visited', 'price band', 'price between'],
    },
}


def detect_scenes(query: str, language: str) -> list[str]:
    """Detect which scenes (A-D) are triggered by the user query.

    Returns list of triggered scene IDs. Defaults to ['B'] (cross-platform)
    if no keywords match.
    """
    query_lower = query.lower()
    triggered: list[str] = []
    for scene_id, kw_map in _SCENE_KEYWORDS.items():
        keywords = kw_map.get(language, kw_map.get('en', []))
        for kw in keywords:
            if kw.lower() in query_lower:
                triggered.append(scene_id)
                break
    return triggered if triggered else ['B']


# ---------------------------------------------------------------------------
# Competition Level
# ---------------------------------------------------------------------------

def competition_emoji(level: str) -> str:
    """Convert competition level to emoji.

    Args:
        level: "blue_ocean", "red_ocean", or "saturated"
    """
    return {'blue_ocean': '🟢', 'red_ocean': '🟡', 'saturated': '🔴'}.get(level, '🟡')


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

@dataclass
class HotProduct:
    """A hot-selling product identified during market scanning (Step 3).

    Attributes:
        product_id: Unique identifier, e.g. "1", "2"
        product_name: Fine-grained SKU name
        platform: Source platform (Alibaba.com / Amazon / Temu / TikTok Shop)
        target_scene: Scene ID (A/B/C/D)
        core_selling_point: Key feature / material / certification
        pain_points: Consumer pain points from reviews
        competition_level: "blue_ocean" / "red_ocean" / "saturated"
        fob_price_range: Suggested FOB price range
        retail_price_range: Reference retail price range
        estimated_margin: Estimated net margin percentage
        source_tools: Which tools provided the data
    """

    product_id: str
    product_name: str
    platform: str
    target_scene: str
    core_selling_point: str = ''
    pain_points: str = ''
    competition_level: str = 'red_ocean'
    fob_price_range: str = ''
    retail_price_range: str = ''
    estimated_margin: str = ''
    source_tools: list[str] = field(default_factory=list)


@dataclass
class HotProductList:
    """Collection of hot products with metadata."""

    scenes: list[str]
    user_query: str
    category: str
    products: list[HotProduct] = field(default_factory=list)
    language: str = field(default='en')

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False, indent=2)

    @classmethod
    def from_json(cls, json_str: str) -> HotProductList:
        data = json.loads(json_str)
        products = [HotProduct(**p) for p in data.get('products', [])]
        return cls(
            scenes=data['scenes'],
            user_query=data['user_query'],
            category=data.get('category', ''),
            products=products,
            language=data.get('language', 'en'),
        )


@dataclass
class ProductInsight:
    """Structured deep-dive insight for a hot product (Step 4).

    Attributes:
        product_id: Matches HotProduct.product_id
        answer_text: Narrative analysis (≥150 words, ≥3 specific numbers)
        data_points: Key quantitative data points
        confidence_level: "high" / "medium" / "low"
        hot_selling_drivers: Categorized drivers (social_media / pain_point / seasonal / supply_chain)
        buyer_profile: Regional buyer characteristics
        differentiation_suggestions: Actionable OEM/ODM differentiation paths
        conclusion: One-line conclusion with key number
        citations: Data source references
        presentation_format: "table" / "text" / "chart" / "mixed"
        competition_level: Final assessment: "blue_ocean" / "red_ocean" / "saturated"
        recommended_products: Products identified by analysis.
            Each entry: {"name": "...", "source": "amazon/alibaba/web", "reason": "..."}
    """

    product_id: str
    answer_text: str
    data_points: list[dict[str, str]]
    confidence_level: str
    hot_selling_drivers: dict[str, str] = field(default_factory=dict)
    buyer_profile: dict[str, str] = field(default_factory=dict)
    differentiation_suggestions: list[str] = field(default_factory=list)
    conclusion: str = ''
    citations: list[str] = field(default_factory=list)
    presentation_format: str = field(default='mixed')
    competition_level: str = 'red_ocean'
    recommended_products: list[dict[str, str]] = field(default_factory=list)


@dataclass
class ProductInsightList:
    """Collection of product insights."""

    insights: list[ProductInsight] = field(default_factory=list)

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False, indent=2)

    @classmethod
    def from_json(cls, json_str: str) -> ProductInsightList:
        data = json.loads(json_str)
        insights = [ProductInsight(**i) for i in data.get('insights', [])]
        return cls(insights=insights)


@dataclass
class SkillError:
    """Structured error response for skill pipeline failures."""

    step_name: str
    error_type: str
    error_description: str
    recoverable: bool
