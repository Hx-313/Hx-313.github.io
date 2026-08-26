from __future__ import annotations

import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "templates" / "scripts" / "patrol_store.py"
SPEC = importlib.util.spec_from_file_location("patrol_store", SCRIPT)
assert SPEC and SPEC.loader
patrol_store = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(patrol_store)


class PatrolStoreTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / ".shopify-patrol"
        patrol_store.initialise(self.root, "example.myshopify.com")

    def tearDown(self) -> None:
        self.temp.cleanup()

    def _json_file(self, name: str, value: dict) -> str:
        path = Path(self.temp.name) / name
        path.write_text(json.dumps(value), encoding="utf-8")
        return str(path)

    def _social_payload(self, text: str = "New product") -> dict:
        return {
            "platform": "instagram",
            "connected_account_id": "ig_123",
            "text": text,
            "media_urls": ["https://cdn.shopify.com/product.jpg"],
            "product_url": "https://example.com/products/example",
            "product_ids": ["gid://shopify/Product/2", "gid://shopify/Product/1"],
            "cta_mode": "link_in_bio",
        }

    def _attach_pass(self, key: str, current_hash: str) -> None:
        shown = patrol_store.action_show(self.root, key, include_payload=True)
        self.assertEqual(shown["action"]["payload_hash"], current_hash)
        preflight_input = {
            "payload": shown["payload"],
            "resolved_connected_account_id": shown["payload"]["connected_account_id"],
            "claims_complete": True,
            "claim_checks": [],
            "media_check": {"result": "pass", "reason_codes": []},
            "platform_check": {"result": "pass", "reason_codes": []},
        }
        patrol_store.action_run_preflight(self.root, key, self._json_file("preflight-input.json", preflight_input))

    def test_initialise_is_idempotent_and_shop_bound(self) -> None:
        changed, _ = patrol_store.initialise(self.root, "example.myshopify.com")
        self.assertFalse(changed)
        with self.assertRaisesRegex(patrol_store.StoreError, "another shop"):
            patrol_store.initialise(self.root, "other.myshopify.com")

    def test_canonical_hash_normalises_set_arrays_but_keeps_media_order(self) -> None:
        first = self._social_payload()
        second = self._social_payload()
        second["product_ids"] = list(reversed(first["product_ids"]))
        self.assertEqual(patrol_store.payload_hash(first), patrol_store.payload_hash(second))
        second["media_urls"] = ["https://cdn/2.jpg", "https://cdn/1.jpg"]
        third = dict(second)
        third["media_urls"] = list(reversed(second["media_urls"]))
        self.assertNotEqual(patrol_store.payload_hash(second), patrol_store.payload_hash(third))

    def test_patrol_commit_is_idempotent(self) -> None:
        request = {
            "state_changes": {
                "last_product_scan_at": "2026-07-20T01:00:00Z",
                "add_known_product_ids": ["gid://shopify/Product/1"],
            },
            "new_actions": [
                {
                    "dedupe_key": "new_product_social:instagram:gid://shopify/Product/1",
                    "action_type": "social_publish",
                    "payload": self._social_payload(),
                }
            ],
        }
        input_path = self._json_file("patrol.json", request)
        changed, first = patrol_store.patrol_commit(self.root, input_path)
        self.assertTrue(changed)
        self.assertEqual(len(first["created_action_keys"]), 1)
        changed, second = patrol_store.patrol_commit(self.root, input_path)
        self.assertFalse(changed)
        self.assertEqual(second["reused_action_keys"], first["created_action_keys"])
        snapshot = patrol_store.load_snapshot(self.root)
        self.assertEqual(snapshot["state"]["known_eligible_product_ids"], ["gid://shopify/Product/1"])
        self.assertEqual(len(snapshot["actions"]), 1)

    def test_confirmation_hash_and_state_machine(self) -> None:
        payload_path = self._json_file("social.json", self._social_payload("New product #HomeGym"))
        _, created = patrol_store.action_create(self.root, "social_publish", "req-1", payload_path)
        key = created["action_key"]
        with self.assertRaisesRegex(patrol_store.StoreError, "does not match"):
            patrol_store.action_begin(self.root, key, "sha256:" + "0" * 64, "ig_123")
        current_hash = created["action"]["payload_hash"]
        with self.assertRaisesRegex(patrol_store.StoreError, "preflight"):
            patrol_store.action_begin(self.root, key, current_hash, "ig_123")
        self._attach_pass(key, current_hash)
        _, begun = patrol_store.action_begin(self.root, key, current_hash, "ig_123")
        self.assertEqual(begun["execution_payload"]["text"], "New product #HomeGym")
        self.assertNotIn("%23", begun["execution_payload"]["text"])
        self.assertFalse(begun["transformations_allowed"])
        actions_before_snapshot = (self.root / "actions.json").read_bytes()
        snapshot = patrol_store.load_snapshot(self.root)
        self.assertEqual(snapshot["actions"][key]["status"], "processing")
        self.assertEqual(snapshot["actions"][key]["execution"]["execution_id"], begun["execution_id"])
        self.assertEqual(patrol_store.action_show(self.root, key)["action"]["status"], "processing")
        self.assertEqual((self.root / "actions.json").read_bytes(), actions_before_snapshot)
        with self.assertRaisesRegex(patrol_store.StoreError, "does not own"):
            patrol_store.action_finish(self.root, key, "succeeded", "exec_" + "f" * 32)
        patrol_store.action_finish(self.root, key, "succeeded", begun["execution_id"])
        changed, result = patrol_store.action_finalize(self.root, key)
        self.assertTrue(changed)
        self.assertTrue(result["finalized"])
        self.assertFalse((self.root / "action-payloads" / f"{key}.json").exists())

    def test_edit_invalidates_prior_hash_and_returns_to_pending(self) -> None:
        path = self._json_file("social.json", self._social_payload())
        _, created = patrol_store.action_create(self.root, "social_publish", "req-2", path)
        key = created["action_key"]
        original_hash = created["action"]["payload_hash"]
        self._attach_pass(key, original_hash)
        edited_path = self._json_file("social-edited.json", self._social_payload("Edited"))
        changed, edited = patrol_store.action_replace_payload(self.root, key, edited_path)
        self.assertTrue(changed)
        self.assertEqual(edited["action"]["status"], "pending")
        self.assertNotEqual(edited["action"]["payload_hash"], original_hash)
        self.assertEqual(edited["action"]["preflight"]["policy_result"], "unreviewed")

    def test_recovery_marks_processing_failed_and_removes_orphan(self) -> None:
        path = self._json_file("social.json", self._social_payload())
        _, created = patrol_store.action_create(self.root, "social_publish", "req-3", path)
        key = created["action_key"]
        self._attach_pass(key, created["action"]["payload_hash"])
        started_at = datetime(2026, 8, 10, 1, 0, tzinfo=timezone.utc)
        patrol_store.action_begin(
            self.root,
            key,
            created["action"]["payload_hash"],
            "ig_123",
            now=started_at,
            execution_id="exec_" + "a" * 32,
        )
        orphan = self.root / "action-payloads" / ("act_" + "f" * 32 + ".json")
        orphan.write_text("{}", encoding="utf-8")
        changed, recovery = patrol_store.recover(self.root, now=started_at + timedelta(minutes=10))
        self.assertTrue(changed)
        self.assertFalse(orphan.exists())
        self.assertFalse(any("recovered_to_failed" in note for note in recovery["notes"]))
        self.assertEqual(patrol_store.action_show(self.root, key)["action"]["status"], "processing")
        with self.assertRaisesRegex(patrol_store.StoreError, "lease expired"):
            patrol_store.action_finish(
                self.root,
                key,
                "succeeded",
                "exec_" + "a" * 32,
                now=started_at + timedelta(minutes=16),
            )
        changed, recovery = patrol_store.recover(self.root, now=started_at + timedelta(minutes=16))
        self.assertTrue(changed)
        self.assertTrue(any(note.startswith("expired_processing_recovered_to_failed") for note in recovery["notes"]))
        self.assertEqual(patrol_store.action_show(self.root, key)["action"]["status"], "failed")

    def test_heartbeat_renews_only_the_owning_execution_lease(self) -> None:
        path = self._json_file("heartbeat.json", self._social_payload())
        _, created = patrol_store.action_create(self.root, "social_publish", "req-heartbeat", path)
        key = created["action_key"]
        current_hash = created["action"]["payload_hash"]
        self._attach_pass(key, current_hash)
        started_at = datetime(2026, 8, 10, 1, 0, tzinfo=timezone.utc)
        _, begun = patrol_store.action_begin(
            self.root,
            key,
            current_hash,
            "ig_123",
            now=started_at,
            execution_id="exec_" + "b" * 32,
        )
        with self.assertRaisesRegex(patrol_store.StoreError, "does not own"):
            patrol_store.action_heartbeat(
                self.root,
                key,
                "exec_" + "c" * 32,
                now=started_at + timedelta(minutes=14),
            )
        _, heartbeat = patrol_store.action_heartbeat(
            self.root,
            key,
            begun["execution_id"],
            now=started_at + timedelta(minutes=14),
        )
        self.assertEqual(heartbeat["lease_expires_at"], "2026-08-10T01:29:00Z")
        changed, _ = patrol_store.recover(self.root, now=started_at + timedelta(minutes=16))
        self.assertFalse(changed)
        patrol_store.action_finish(
            self.root,
            key,
            "succeeded",
            begun["execution_id"],
            now=started_at + timedelta(minutes=16),
        )

    def test_permissions_are_private(self) -> None:
        snapshot = patrol_store.load_snapshot(self.root)
        self.assertIn("state", snapshot)
        self.assertEqual(os.stat(self.root).st_mode & 0o777, 0o700)
        self.assertEqual(os.stat(self.root / "state.json").st_mode & 0o777, 0o600)

    def test_unknown_payload_fields_are_rejected(self) -> None:
        payload = self._social_payload()
        payload["remote_id"] = "not-allowed"
        with self.assertRaisesRegex(patrol_store.StoreError, "unsupported fields"):
            patrol_store._validate_payload("social_publish", payload)

    def test_action_payload_types_and_identifiers_are_rejected(self) -> None:
        invalid_social = self._social_payload()
        invalid_social["product_ids"] = ["not-a-product-gid"]
        with self.assertRaisesRegex(patrol_store.StoreError, "Product GIDs"):
            patrol_store._validate_payload("social_publish", invalid_social)
        with self.assertRaisesRegex(patrol_store.StoreError, "unsupported action_type"):
            patrol_store._validate_payload("blog_publish", {})
        with self.assertRaisesRegex(patrol_store.StoreError, "unsupported action_type"):
            patrol_store._validate_payload("email_send", {})

    def test_instagram_payload_rejects_encoded_hashtags_and_placeholder_account(self) -> None:
        encoded = self._social_payload("New product %23broken")
        with self.assertRaisesRegex(patrol_store.StoreError, "never %23"):
            patrol_store._validate_payload("social_publish", encoded)
        placeholder = self._social_payload()
        placeholder["connected_account_id"] = "me"
        with self.assertRaisesRegex(patrol_store.StoreError, "stable connector-returned"):
            patrol_store._validate_payload("social_publish", placeholder)
        query_media = self._social_payload()
        query_media["media_urls"] = ["https://cdn.shopify.com/product.jpg?v=123"]
        with self.assertRaisesRegex(patrol_store.StoreError, "query string"):
            patrol_store._validate_payload("social_publish", query_media)

    def test_failed_action_needs_explicit_retry_and_new_confirmation(self) -> None:
        path = self._json_file("retry.json", self._social_payload())
        _, created = patrol_store.action_create(self.root, "social_publish", "req-retry", path)
        key = created["action_key"]
        current_hash = created["action"]["payload_hash"]
        self._attach_pass(key, current_hash)
        _, begun = patrol_store.action_begin(self.root, key, current_hash, "ig_123")
        patrol_store.action_finish(self.root, key, "failed", begun["execution_id"])
        with self.assertRaisesRegex(patrol_store.StoreError, "explicit retry"):
            patrol_store.action_begin(self.root, key, current_hash, "ig_123")
        with self.assertRaisesRegex(patrol_store.StoreError, "explicit retry"):
            self._attach_pass(key, current_hash)
        _, retried = patrol_store.action_retry(self.root, key)
        self.assertTrue(retried["requires_exact_confirmation"])
        patrol_store.action_begin(self.root, key, current_hash, "ig_123")

    def test_begin_blocks_account_switch_after_confirmation(self) -> None:
        path = self._json_file("account.json", self._social_payload())
        _, created = patrol_store.action_create(self.root, "social_publish", "req-account", path)
        key = created["action_key"]
        current_hash = created["action"]["payload_hash"]
        self._attach_pass(key, current_hash)
        with self.assertRaisesRegex(patrol_store.StoreError, "connector account"):
            patrol_store.action_begin(self.root, key, current_hash, "ig_other")
        self.assertEqual(patrol_store.action_show(self.root, key)["action"]["status"], "pending")

    def test_ledger_runs_preflight_and_blocks_session_regression(self) -> None:
        payload = self._social_payload("占地仅需 1.3㎡。限时优惠进行中。#HomeGym")
        path = self._json_file("risky.json", payload)
        _, created = patrol_store.action_create(self.root, "social_publish", "req-risky", path)
        key = created["action_key"]
        preflight_input = {
            "payload": payload,
            "resolved_connected_account_id": "ig_123",
            "claims_complete": True,
            "claim_checks": [],
            "media_check": {"result": "pass", "reason_codes": []},
            "platform_check": {"result": "pass", "reason_codes": []},
        }
        _, evaluated = patrol_store.action_run_preflight(
            self.root, key, self._json_file("risky-preflight.json", preflight_input)
        )
        self.assertEqual(evaluated["action"]["preflight"]["policy_result"], "block")
        with self.assertRaisesRegex(patrol_store.StoreError, "no releasable"):
            patrol_store.action_begin(self.root, key, created["action"]["payload_hash"], "ig_123")

        fake_result = {
            "policy_version": "social-publish-v1",
            "policy_result": "pass",
            "payload_hash": created["action"]["payload_hash"],
            "reason_codes": ["POLICY_PASS"],
            "explanations": ["Invented pass"],
        }
        with self.assertRaisesRegex(patrol_store.StoreError, "preflight input fields"):
            patrol_store.action_run_preflight(self.root, key, self._json_file("fake-result.json", fake_result))

    def test_request_token_cannot_be_reused_for_different_payload(self) -> None:
        original = self._json_file("original.json", self._social_payload("Original"))
        patrol_store.action_create(self.root, "social_publish", "same-token", original)
        changed = self._json_file("changed.json", self._social_payload("Changed"))
        with self.assertRaisesRegex(patrol_store.StoreError, "different payload"):
            patrol_store.action_create(self.root, "social_publish", "same-token", changed)

    def test_campaign_slots_are_durable_but_never_reported_as_scheduled(self) -> None:
        campaign_input = {
            "recommendation_id": "camprec_123",
            "product_id": "gid://shopify/Product/1",
            "channel": "instagram",
            "horizon_days": 7,
            "created_at": "2026-08-10T01:00:00Z",
            "slots": [
                {
                    "slot_id": "slot_day_1",
                    "day": 1,
                    "content_pillar": "use_case",
                    "scheduled_for": "2026-08-10T09:00:00Z",
                }
            ],
        }
        _, created_campaign = patrol_store.campaign_create(
            self.root, self._json_file("campaign.json", campaign_input)
        )
        campaign_id = created_campaign["campaign_id"]
        payload = self._social_payload()
        payload.update(
            {
                "campaign_id": campaign_id,
                "slot_id": "slot_day_1",
                "scheduled_for": "2026-08-10T09:00:00Z",
            }
        )
        _, created_action = patrol_store.action_create(
            self.root, "social_publish", "campaign-slot-1", self._json_file("slot.json", payload)
        )
        action_key = created_action["action_key"]
        with self.assertRaisesRegex(patrol_store.StoreError, "not bound"):
            self._attach_pass(action_key, created_action["action"]["payload_hash"])
        self.assertEqual(
            patrol_store.action_show(self.root, action_key)["action"]["preflight"]["policy_result"],
            "unreviewed",
        )
        _, attached = patrol_store.campaign_attach_action(
            self.root, campaign_id, "slot_day_1", action_key
        )
        self.assertEqual(attached["slot"]["status"], "action_created")
        self.assertEqual(attached["campaign"]["status"], "materialized")
        self.assertNotEqual(attached["slot"]["status"], "scheduled")
        current_hash = created_action["action"]["payload_hash"]
        self._attach_pass(action_key, current_hash)
        _, begun = patrol_store.action_begin(self.root, action_key, current_hash, "ig_123")
        self.assertEqual(
            patrol_store.campaign_show(self.root, campaign_id)["campaign"]["slots"][0]["status"],
            "publishing",
        )
        patrol_store.action_finish(self.root, action_key, "failed", begun["execution_id"])
        self.assertEqual(
            patrol_store.campaign_show(self.root, campaign_id)["campaign"]["slots"][0]["status"],
            "failed",
        )
        patrol_store.action_retry(self.root, action_key)
        _, begun = patrol_store.action_begin(self.root, action_key, current_hash, "ig_123")
        patrol_store.action_finish(self.root, action_key, "succeeded", begun["execution_id"])
        final_campaign = patrol_store.campaign_show(self.root, campaign_id)["campaign"]
        self.assertEqual(final_campaign["slots"][0]["status"], "published")
        self.assertEqual(final_campaign["status"], "completed")

    def test_concurrent_create_uses_one_stable_action(self) -> None:
        payload_path = self._json_file("concurrent.json", self._social_payload())
        command = [
            sys.executable,
            str(SCRIPT),
            "--root",
            str(self.root),
            "action",
            "create",
            "--action-type",
            "social_publish",
            "--request-token",
            "same-request",
            "--payload-file",
            payload_path,
        ]
        processes = [subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True) for _ in range(2)]
        results = [process.communicate(timeout=10) + (process.returncode,) for process in processes]
        self.assertTrue(all(result[2] == 0 for result in results), results)
        snapshots = patrol_store.load_snapshot(self.root)
        self.assertEqual(len(snapshots["actions"]), 1)
        changed_values = sorted(json.loads(result[0])["changed"] for result in results)
        self.assertEqual(changed_values, [False, True])


if __name__ == "__main__":
    unittest.main()
