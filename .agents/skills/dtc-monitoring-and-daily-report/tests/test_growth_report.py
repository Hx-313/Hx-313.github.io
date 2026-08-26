from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


SCRIPTS = Path(__file__).resolve().parents[1] / "templates" / "scripts"


def _load(name: str):
    spec = importlib.util.spec_from_file_location(name, SCRIPTS / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


render_report = _load("render_report")
daily_report = _load("daily_report")


class GrowthReportTests(unittest.TestCase):
    def test_growth_copy_covers_every_report_locale(self):
        self.assertEqual(set(render_report.STRINGS), set(render_report._GROWTH_COPY))

    def test_growth_section_contains_reason_codes_without_payloads(self):
        result = {
            "status": "ok",
            "triggers": {
                "new_product": {
                    "evaluation_status": "ok",
                    "matched": True,
                    "reason_code": "NEW_ELIGIBLE_PRODUCTS",
                    "source_ids": ["gid://shopify/Product/1"],
                },
                "campaign_recommendation": {
                    "evaluation_status": "error",
                    "matched": None,
                    "reason_code": "SOCIAL_ACCOUNT_INPUT_INVALID",
                    "source_ids": ["gid://shopify/Product/1"],
                },
            },
            "actions": [{"action_key": "act_123", "action_type": "social_publish", "status": "pending"}],
        }
        rendered = render_report._render_growth(result, "zh")
        self.assertIn("增长运营动作", rendered)
        self.assertIn("NEW_ELIGIBLE_PRODUCTS", rendered)
        self.assertIn("7 天 Campaign 推荐", rendered)
        self.assertIn("无法判断", rendered)
        self.assertIn("act_123", rendered)
        self.assertNotIn("body_html", rendered)

    def test_growth_file_loader_drops_raw_and_generated_content(self):
        raw = {
            "status": "ok",
            "triggers": {
                "campaign_recommendation": {
                    "evaluation_status": "ok",
                    "matched": True,
                    "reason_code": "SEVEN_DAY_CAMPAIGN_RECOMMENDATION_READY",
                    "source_ids": ["gid://shopify/Product/1"],
                    "raw_connector_response": {"token": "private-token"},
                    "candidates": [{"generated_caption": "private generated copy"}],
                }
            },
            "actions": [
                {
                    "action_key": "act_123",
                    "action_type": "social_publish",
                    "status": "pending",
                    "payload": {"text": "private generated copy"},
                }
            ],
            "campaign_recommendations": [
                {
                    "recommendation_id": "camprec_0123456789abcdef",
                    "decision": "recommended",
                    "publish_readiness": "blocked",
                    "product": {
                        "product_id": "gid://shopify/Product/1",
                        "title": "Everyday Carry Bag",
                        "public_url": "https://example.com/products/bag",
                    },
                    "reason_codes": ["NEW_PRODUCT_SEVEN_DAY_CAMPAIGN_FIT"],
                    "blockers": [
                        {"code": "INSTAGRAM_NOT_CONNECTED", "resolution": "private setup detail"}
                    ],
                    "warnings": [],
                    "recommended_plan": {
                        "horizon_days": 7,
                        "recommended_channel": "instagram",
                        "recommended_post_count": 3,
                        "estimated_review_minutes": 10,
                        "content_slots": [{"generated_caption": "private generated copy"}],
                    },
                    "user_options": ["start_draft", "customize", "skip"],
                    "expires_at": "2026-08-12T00:00:00Z",
                    "raw_connector_response": {"token": "private-token"},
                }
            ],
        }
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "growth.json"
            path.write_text(json.dumps(raw), encoding="utf-8")
            clean = daily_report._load_growth_result(path)
        self.assertEqual(
            clean["triggers"]["campaign_recommendation"]["source_ids"],
            ["gid://shopify/Product/1"],
        )
        self.assertNotIn("private", json.dumps(clean))
        self.assertEqual(set(clean["actions"][0]), {"action_key", "action_type", "status"})
        campaign = clean["campaign_recommendations"][0]
        self.assertEqual(campaign["blocker_codes"], ["INSTAGRAM_NOT_CONNECTED"])
        self.assertNotIn("content_slots", campaign["recommended_plan"])

    def test_growth_file_loader_maps_legacy_social_candidate_to_campaign_recommendation(self):
        raw = {
            "status": "ok",
            "triggers": {
                "social_candidate": {
                    "evaluation_status": "ok",
                    "matched": True,
                    "reason_code": "LEGACY_SOCIAL_TRIGGER",
                    "source_ids": ["gid://shopify/Product/1"],
                }
            },
        }
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "growth.json"
            path.write_text(json.dumps(raw), encoding="utf-8")
            clean = daily_report._load_growth_result(path)
        self.assertNotIn("social_candidate", clean["triggers"])
        self.assertEqual(
            clean["triggers"]["campaign_recommendation"]["reason_code"],
            "LEGACY_SOCIAL_TRIGGER",
        )

    def test_growth_report_renders_optional_campaign_as_draft_only(self):
        growth = {
            "triggers": {},
            "actions": [],
            "campaign_recommendations": [
                {
                    "recommendation_id": "camprec_0123456789abcdef",
                    "decision": "recommended",
                    "publish_readiness": "ready",
                    "product": {
                        "product_id": "gid://shopify/Product/1",
                        "title": "Everyday Carry Bag",
                    },
                    "reason_codes": ["NEW_PRODUCT_SEVEN_DAY_CAMPAIGN_FIT"],
                    "blocker_codes": [],
                    "recommended_plan": {
                        "horizon_days": 7,
                        "recommended_channel": "instagram",
                        "recommended_post_count": 3,
                        "estimated_review_minutes": 10,
                    },
                    "user_options": ["start_draft", "customize", "skip"],
                }
            ],
        }
        rendered = render_report._render_growth(growth, "zh")
        self.assertIn("可选的 7 天 Campaign", rendered)
        self.assertIn("Everyday Carry Bag", rendered)
        self.assertIn("7d/3 posts/instagram", rendered)
        self.assertIn("启动只会创建草稿", rendered)
        self.assertIn("`start_draft`", rendered)


if __name__ == "__main__":
    unittest.main()
