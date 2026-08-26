from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path


SCRIPTS = Path(__file__).parents[1] / "templates" / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))
SPEC = importlib.util.spec_from_file_location("evaluate_growth_triggers", SCRIPTS / "evaluate_growth_triggers.py")
assert SPEC and SPEC.loader
triggers = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(triggers)


class SocialTriggerTests(unittest.TestCase):
    def snapshot(self, *, last_product="2026-07-19T00:00:00Z", known=None, actions=None):
        return {
            "state": {
                "schema_version": 1,
                "shop_domain": "example.myshopify.com",
                "last_product_scan_at": last_product,
                "known_eligible_product_ids": known or [],
            },
            "actions": actions or {},
        }

    def payload(self, products=None):
        return {
            "scan_started_at": "2026-07-20T01:00:00Z",
            "shop": {"domain": "example.myshopify.com"},
            "products": {"evaluation_status": "ok", "items": products or []},
            "social_accounts": {
                "instagram": {"connection_status": "connected", "connected_account_id": "ig_1"},
                "x": {"connection_status": "not_connected", "connected_account_id": None},
            },
        }

    def product(self, product_id="gid://shopify/Product/1"):
        return {
            "id": product_id,
            "status": "ACTIVE",
            "published_at": "2026-07-20T00:00:00Z",
            "updated_at": "2026-07-20T00:00:00Z",
            "online_store_url": "https://example.com/products/one",
            "media_count": 1,
            "publicly_accessible": True,
        }

    def test_first_run_builds_baseline_without_recommendation(self):
        result = triggers.evaluate(self.payload([self.product()]), self.snapshot(last_product=None))
        self.assertEqual(result["triggers"]["new_product"]["reason_code"], "PRODUCT_BASELINE_INITIALIZED")
        self.assertFalse(result["triggers"]["campaign_recommendation"]["matched"])
        self.assertEqual(result["proposed_state_changes"]["add_known_product_ids"], ["gid://shopify/Product/1"])

    def test_new_product_creates_optional_campaign_request(self):
        result = triggers.evaluate(self.payload([self.product()]), self.snapshot())
        campaign = result["triggers"]["campaign_recommendation"]
        self.assertTrue(result["triggers"]["new_product"]["matched"])
        self.assertTrue(campaign["matched"])
        self.assertEqual(campaign["reason_code"], "SEVEN_DAY_CAMPAIGN_RECOMMENDATION_READY")
        self.assertEqual(campaign["candidates"][0]["candidate_kind"], "seven_day_campaign_recommendation")
        self.assertEqual(campaign["candidates"][0]["activation_mode"], "optional_draft")
        self.assertNotIn("action_key", campaign["candidates"][0])

    def test_each_product_gets_one_stable_request(self):
        products = [self.product(f"gid://shopify/Product/{index}") for index in range(1, 5)]
        first = triggers.evaluate(self.payload(products), self.snapshot())
        second = triggers.evaluate(self.payload(products), self.snapshot())
        candidates = first["triggers"]["campaign_recommendation"]["candidates"]
        self.assertEqual(len(candidates), 4)
        self.assertEqual(candidates, second["triggers"]["campaign_recommendation"]["candidates"])

    def test_missing_instagram_keeps_draft_only_recommendation(self):
        payload = self.payload([self.product()])
        payload["social_accounts"]["instagram"] = {
            "connection_status": "not_connected",
            "connected_account_id": None,
        }
        campaign = triggers.evaluate(payload, self.snapshot())["triggers"]["campaign_recommendation"]
        self.assertTrue(campaign["matched"])
        self.assertEqual(campaign["reason_code"], "SEVEN_DAY_CAMPAIGN_RECOMMENDATION_DRAFT_ONLY")
        self.assertEqual(campaign["candidates"][0]["instagram"]["status"], "not_connected")

    def test_known_product_does_not_trigger_after_republish(self):
        product = self.product()
        result = triggers.evaluate(self.payload([product]), self.snapshot(known=[product["id"]]))
        self.assertFalse(result["triggers"]["new_product"]["matched"])
        self.assertFalse(result["triggers"]["campaign_recommendation"]["matched"])

    def test_unknown_product_status_is_unknown(self):
        product = self.product()
        product["status"] = "FUTURE_STATUS"
        result = triggers.evaluate(self.payload([product]), self.snapshot())
        self.assertIsNone(result["triggers"]["new_product"]["matched"])
        self.assertEqual(result["status"], "partial")
        self.assertNotIn("last_product_scan_at", result["proposed_state_changes"])

    def test_incomplete_public_check_does_not_advance_cursor(self):
        product = self.product()
        product["publicly_accessible"] = False
        result = triggers.evaluate(self.payload([product]), self.snapshot(last_product=None))
        self.assertEqual(result["triggers"]["new_product"]["reason_code"], "PUBLIC_CHECK_INCOMPLETE")
        self.assertNotIn("last_product_scan_at", result["proposed_state_changes"])

    def test_shop_domain_mismatch_is_rejected(self):
        payload = self.payload([])
        payload["shop"]["domain"] = "other.myshopify.com"
        with self.assertRaisesRegex(triggers.EvaluationError, "does not match"):
            triggers.evaluate(payload, self.snapshot())


if __name__ == "__main__":
    unittest.main()
