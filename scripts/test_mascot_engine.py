#!/usr/bin/env python3
"""
===============================================================================
TEST SUITE FOR HX313 MASCOT ENGINE (AERO & DASH)
===============================================================================
"""

import math
import time
import unittest
from mascot_engine import (
    Vector2D,
    SplineGenerator,
    UserContextEngine,
    CursorIntentTracker,
    KinematicFlightEngine,
    MascotDialogueDirector,
    TourGuideSystem,
    MascotOrchestrator,
    Persona,
    TrafficSource,
    AeroExpression,
    DashExpression,
    MascotState,
    CursorIntent
)

class TestVectorMathAndSplines(unittest.TestCase):
    def test_vector_operations(self):
        v1 = Vector2D(10.0, 20.0)
        v2 = Vector2D(5.0, 10.0)

        # Addition / Subtraction
        self.assertEqual(v1 + v2, Vector2D(15.0, 30.0))
        self.assertEqual(v1 - v2, Vector2D(5.0, 10.0))

        # Scalar multiplication / division
        self.assertEqual(v1 * 2.0, Vector2D(20.0, 40.0))
        self.assertEqual(v1 / 2.0, Vector2D(5.0, 10.0))

        # Magnitude & Normalization
        v3 = Vector2D(3.0, 4.0)
        self.assertAlmostEqual(v3.magnitude(), 5.0)
        norm = v3.normalized()
        self.assertAlmostEqual(norm.magnitude(), 1.0)
        self.assertAlmostEqual(norm.x, 0.6)
        self.assertAlmostEqual(norm.y, 0.8)

        # Clamping
        v_clamped = Vector2D(-10.0, 150.0).clamp(0.0, 100.0)
        self.assertEqual(v_clamped, Vector2D(0.0, 100.0))

    def test_spline_generator(self):
        start = Vector2D(10.0, 10.0)
        end = Vector2D(90.0, 90.0)
        path = SplineGenerator.generate_swoop_path(start, end, apex_offset=20.0)

        self.assertGreater(len(path), 10)
        self.assertAlmostEqual(path[0].x, 10.0)
        self.assertAlmostEqual(path[-1].x, 90.0)

class TestUserContextEngine(unittest.TestCase):
    def test_referrer_and_persona_inference(self):
        # GitHub -> Tech Lead
        src, persona = UserContextEngine.analyze_source("https://github.com/Hx-313/portfolio")
        self.assertEqual(src, TrafficSource.GITHUB)
        self.assertEqual(persona, Persona.TECH_LEAD)

        # LinkedIn Job -> Recruiter
        src, persona = UserContextEngine.analyze_source(
            "https://linkedin.com", {"utm_campaign": ["recruiter_hiring"]}
        )
        self.assertEqual(src, TrafficSource.LINKEDIN)
        self.assertEqual(persona, Persona.RECRUITER)

        # Kaggle -> AI Researcher
        src, persona = UserContextEngine.analyze_source("https://www.kaggle.com/hx313")
        self.assertEqual(src, TrafficSource.KAGGLE)
        self.assertEqual(persona, Persona.AI_RESEARCHER)

        # Upwork -> Founder / Client
        src, persona = UserContextEngine.analyze_source("https://upwork.com/freelancers/~01")
        self.assertEqual(src, TrafficSource.UPWORK)
        self.assertEqual(persona, Persona.FOUNDER)

        # Direct
        src, persona = UserContextEngine.analyze_source("")
        self.assertEqual(src, TrafficSource.DIRECT)
        self.assertEqual(persona, Persona.FOUNDER)

class TestCursorIntentTracker(unittest.TestCase):
    def test_cursor_tracking_and_intent(self):
        tracker = CursorIntentTracker()

        # Idle start
        tel = tracker.update_position(Vector2D(50.0, 50.0))
        self.assertEqual(tel.position, Vector2D(50.0, 50.0))

        # Rapid movement
        time.sleep(0.01)
        tel_fast = tracker.update_position(Vector2D(90.0, 90.0))
        self.assertGreater(tel_fast.speed, 50.0)
        self.assertIn(tel_fast.intent, [CursorIntent.RAPID_SEARCHING, CursorIntent.ERRATIC_MOTION])

        # Interactive hover
        tel_hover = tracker.update_position(Vector2D(50.0, 50.0), hovered_element="btn-cta")
        self.assertEqual(tel_hover.intent, CursorIntent.HOVERING_INTERACTIVE)
        self.assertEqual(tel_hover.hovered_element_id, "btn-cta")

class TestMascotInteractionsAndDizziness(unittest.TestCase):
    def test_hit_reaction_and_combo(self):
        engine = KinematicFlightEngine()

        # 1. Single hit on Aero
        res = engine.trigger_hit("aero")
        self.assertEqual(engine.aero.state, MascotState.HIT_RECOIL)
        self.assertIn(engine.aero.expression, [AeroExpression.SURPRISED.value, AeroExpression.CONFUSED.value, AeroExpression.HIT.value])
        self.assertIsNotNone(engine.aero.bubble_text)

        # 2. Combo hits on Dash
        engine.trigger_hit("dash")
        engine.trigger_hit("dash")
        res_dash = engine.trigger_hit("dash")
        self.assertEqual(engine.dash.combo_hits, 3)
        self.assertEqual(engine.dash.expression, DashExpression.ALERT.value)

    def test_drag_and_dizziness_accumulation(self):
        engine = KinematicFlightEngine()

        # Start Dragging Aero
        engine.start_drag("aero", Vector2D(20.0, 30.0))
        self.assertTrue(engine.aero.is_dragging)
        self.assertEqual(engine.aero.state, MascotState.DRAGGING)

        # Drag violently in circular orbits to trigger dizziness
        for i in range(16):
            angle = i * (math.pi / 4)
            pos = Vector2D(50.0 + math.cos(angle) * 20.0, 50.0 + math.sin(angle) * 20.0)
            engine.update_drag("aero", pos)

        self.assertGreater(engine.aero.dizziness_level, 0.60)
        self.assertEqual(engine.aero.expression, AeroExpression.DIZZY.value)

        # End drag with fling momentum
        engine.end_drag("aero", release_velocity=Vector2D(40.0, -20.0))
        self.assertFalse(engine.aero.is_dragging)
        self.assertEqual(engine.aero.state, MascotState.DIZZY)

        # Verify physics updates & dizzy recovery
        cursor_tel = CursorIntentTracker().update_position(Vector2D(50.0, 50.0))
        for _ in range(35):
            engine.update_physics(0.1, cursor_tel)

        # Eventually settles back or reboots gyro
        self.assertIn(engine.aero.state, [MascotState.IDLE, MascotState.GYRO_REBOOT])

class TestTourGuideSystem(unittest.TestCase):
    def test_tour_progression(self):
        flight_engine = KinematicFlightEngine()
        tour_system = TourGuideSystem()

        # Start Executive Tour
        success = tour_system.start_tour("executive_tour", flight_engine)
        self.assertTrue(success)
        self.assertTrue(tour_system.is_playing)
        self.assertEqual(flight_engine.aero.state, MascotState.TOUR_GUIDE)
        self.assertEqual(flight_engine.dash.state, MascotState.TOUR_GUIDE)

        # Advance through steps
        tour_state = tour_system.update_tour(0.1, flight_engine)
        self.assertEqual(tour_state["tour_status"], "PLAYING")
        self.assertEqual(tour_state["step_index"], 0)

class TestMascotOrchestrator(unittest.TestCase):
    def test_full_state_and_serialization(self):
        session = UserContextEngine.create_session("test_session", referrer="https://github.com/Hx-313")
        orch = MascotOrchestrator(session)

        # Move cursor
        state = orch.handle_cursor_move(30.0, 40.0, hovered_id="system-core")
        self.assertIn("aero", state)
        self.assertIn("dash", state)
        self.assertIn("cursor", state)
        self.assertIn("session", state)
        self.assertEqual(state["session"]["persona"], Persona.TECH_LEAD.value)

        # Tick simulation
        tick_state = orch.tick()
        self.assertIsNotNone(tick_state["timestamp"])

if __name__ == "__main__":
    unittest.main()
