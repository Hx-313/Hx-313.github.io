#!/usr/bin/env python3
"""
===============================================================================
HX313 MASCOT INTELLIGENCE, KINEMATICS & TOUR ENGINE — AERO & DASH
===============================================================================
Author: HX313 / Hafiz Ali Abdullah
Concept & Design: HX313 System Mascots (Think • Build • Deploy)

Mascot Crew:
  * AERO  · AI Assistant   — "I think, analyze and assist."
            Features: Halo Ring, Ear Pods, Face Screen, Glass Core Body.
  * DASH  · System Drone   — "I move, monitor and execute."
            Features: Antennae, Face Screen, Plasma Thrusters, Robotic Arms.

Capabilities:
  1. User Context & Persona Intelligence (Traffic Source, UTMs, Referrers, Dwell).
  2. Real-time Cursor Intent & Heading Prediction (Velocity, Acceleration, Gaze).
  3. Advanced Physics & Kinematics (Bézier Splines, Spring-Mass-Damper, Boids).
  4. Emotional State Machines & Reactions:
     - Click / Hit Flinch Mechanics & Combo Defenses.
     - Continuous Drag & Rotational Dizziness Accumulator (Spiral eyes, Gyro Reboot).
     - Ballistic Fling & Boundary Bounces.
  5. Interactive Page & Section Tour Guide System (Coordinated Dual Banter).
  6. Multi-Mode Runtime: Interactive ANSI CLI Simulator + Async WebSocket/HTTP JSON Server.
===============================================================================
"""

from __future__ import annotations
import asyncio
import dataclasses
from dataclasses import dataclass, field
from enum import Enum
import http.server
import json
import math
import os
import random
import socketserver
import sys
import time
from typing import Any, Callable, Dict, List, Optional, Tuple
from urllib.parse import parse_qs, urlparse

# =============================================================================
# 1. ENUMS & CONSTANTS
# =============================================================================

class Persona(str, Enum):
    TECH_LEAD = "TECH_LEAD"            # Focuses on Clean Architecture, Test Coverage, Flutter, SaaS
    RECRUITER = "RECRUITER"            # Focuses on Skills, Experience, Shipped Apps, CV
    FOUNDER = "FOUNDER"                # Focuses on MVP Speed, Business Value, Production Readiness
    AI_RESEARCHER = "AI_RESEARCHER"    # Focuses on Models, Kaggle, Data Pipelines, System AI
    EXPLORER = "EXPLORER"              # Curious visitor, UI/UX enthusiast, peer developer

class TrafficSource(str, Enum):
    GITHUB = "GITHUB"
    LINKEDIN = "LINKEDIN"
    KAGGLE = "KAGGLE"
    UPWORK = "UPWORK"
    TWITTER_X = "TWITTER_X"
    GOOGLE_SEARCH = "GOOGLE_SEARCH"
    DIRECT = "DIRECT"
    UNKNOWN = "UNKNOWN"

class AeroExpression(str, Enum):
    HAPPY = "happy"
    THINKING = "thinking"
    EXCITED = "excited"
    ANALYZING = "analyzing"
    CONFUSED = "confused"
    WINKING = "winking"
    LOADING = "loading"
    SURPRISED = "surprised"
    SLEEP = "sleep"
    HIT = "hit"
    DIZZY = "dizzy"

class DashExpression(str, Enum):
    HAPPY = "happy"
    WINKING = "winking"
    EXCITED = "excited"
    FOCUSED = "focused"
    SCANNING = "scanning"
    CONFUSED = "confused"
    EXECUTING = "executing"
    ALERT = "alert"
    SLEEP = "sleep"
    HIT = "hit"
    DIZZY = "dizzy"

class MascotState(str, Enum):
    IDLE = "IDLE"
    PATROL = "PATROL"
    FOLLOW_CURSOR = "FOLLOW_CURSOR"
    ESCORT_TARGET = "ESCORT_TARGET"
    INSPECT_ELEMENT = "INSPECT_ELEMENT"
    HIT_RECOIL = "HIT_RECOIL"
    DRAGGING = "DRAGGING"
    DIZZY = "DIZZY"
    GYRO_REBOOT = "GYRO_REBOOT"
    TOUR_GUIDE = "TOUR_GUIDE"

class CursorIntent(str, Enum):
    HOVERING_INTERACTIVE = "HOVERING_INTERACTIVE"
    CAREFUL_READING = "CAREFUL_READING"
    RAPID_SEARCHING = "RAPID_SEARCHING"
    IDLE_DWELL = "IDLE_DWELL"
    ERRATIC_MOTION = "ERRATIC_MOTION"

# =============================================================================
# 2. 2D VECTOR & KINEMATICS MATHEMATICS
# =============================================================================

@dataclass
class Vector2D:
    x: float = 0.0
    y: float = 0.0

    def __add__(self, other: Vector2D) -> Vector2D:
        return Vector2D(self.x + other.x, self.y + other.y)

    def __sub__(self, other: Vector2D) -> Vector2D:
        return Vector2D(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar: float) -> Vector2D:
        return Vector2D(self.x * scalar, self.y * scalar)

    def __truediv__(self, scalar: float) -> Vector2D:
        if abs(scalar) < 1e-8:
            return Vector2D(0.0, 0.0)
        return Vector2D(self.x / scalar, self.y / scalar)

    def magnitude(self) -> float:
        return math.sqrt(self.x * self.x + self.y * self.y)

    def normalized(self) -> Vector2D:
        mag = self.magnitude()
        if mag < 1e-8:
            return Vector2D(0.0, 0.0)
        return Vector2D(self.x / mag, self.y / mag)

    def distance_to(self, other: Vector2D) -> float:
        return (self - other).magnitude()

    def clamp(self, min_val: float, max_val: float) -> Vector2D:
        return Vector2D(
            max(min_val, min(max_val, self.x)),
            max(min_val, min(max_val, self.y))
        )

    def angle(self) -> float:
        """Returns angle in radians (-pi to pi)."""
        return math.atan2(self.y, self.x)

    def rotate(self, radians: float) -> Vector2D:
        cos_a = math.cos(radians)
        sin_a = math.sin(radians)
        return Vector2D(
            self.x * cos_a - self.y * sin_a,
            self.x * sin_a + self.y * cos_a
        )

    def to_dict(self) -> Dict[str, float]:
        return {"x": round(self.x, 2), "y": round(self.y, 2)}

class SplineGenerator:
    """Generates smooth Cubic Hermite & Bézier trajectories between waypoints."""

    @staticmethod
    def cubic_bezier(p0: Vector2D, p1: Vector2D, p2: Vector2D, p3: Vector2D, t: float) -> Vector2D:
        """Evaluates cubic Bézier curve at parameter t in [0, 1]."""
        t = max(0.0, min(1.0, t))
        u = 1.0 - t
        tt = t * t
        uu = u * u
        uuu = uu * u
        ttt = tt * t

        x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x
        y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
        return Vector2D(x, y)

    @staticmethod
    def generate_swoop_path(start: Vector2D, end: Vector2D, apex_offset: float = 15.0) -> List[Vector2D]:
        """Creates an aerodynamic swoop curve between two coordinates."""
        mid = (start + end) * 0.5
        perp = Vector2D(-(end.y - start.y), end.x - start.x).normalized() * apex_offset
        ctrl1 = start + (mid - start) * 0.5 + perp
        ctrl2 = end + (mid - end) * 0.5 + perp

        points = []
        steps = 20
        for i in range(steps + 1):
            t = i / steps
            points.append(SplineGenerator.cubic_bezier(start, ctrl1, ctrl2, end, t))
        return points

# =============================================================================
# 3. USER CONTEXT & INTENT ENGINE
# =============================================================================

@dataclass
class UserSessionContext:
    session_id: str
    traffic_source: TrafficSource = TrafficSource.DIRECT
    inferred_persona: Persona = Persona.FOUNDER
    referrer_url: str = ""
    utm_source: str = ""
    utm_campaign: str = ""
    utm_medium: str = ""
    dwell_seconds: float = 0.0
    current_page: str = "home"
    current_section: str = "hero"
    is_mobile: bool = False
    viewport_size: Vector2D = field(default_factory=lambda: Vector2D(1920, 1080))
    interaction_count: int = 0
    tours_completed: List[str] = field(default_factory=list)

class UserContextEngine:
    """Understands user source, predicts persona, and tracks dwell & engagement."""

    @staticmethod
    def analyze_source(referrer: str = "", query_params: Optional[Dict[str, List[str]]] = None) -> Tuple[TrafficSource, Persona]:
        referrer_lower = referrer.lower()
        params = query_params or {}

        utm_source = params.get("utm_source", [""])[0].lower()
        utm_campaign = params.get("utm_campaign", [""])[0].lower()

        # 1. Source Classification
        if "github.com" in referrer_lower or "github" in utm_source:
            source = TrafficSource.GITHUB
            persona = Persona.TECH_LEAD
        elif "linkedin.com" in referrer_lower or "linkedin" in utm_source:
            source = TrafficSource.LINKEDIN
            persona = Persona.RECRUITER if "recruiter" in utm_campaign or "job" in utm_campaign else Persona.FOUNDER
        elif "kaggle.com" in referrer_lower or "kaggle" in utm_source:
            source = TrafficSource.KAGGLE
            persona = Persona.AI_RESEARCHER
        elif "upwork.com" in referrer_lower or "upwork" in utm_source or "freelance" in utm_campaign:
            source = TrafficSource.UPWORK
            persona = Persona.FOUNDER
        elif "t.co" in referrer_lower or "twitter.com" in referrer_lower or "x.com" in referrer_lower:
            source = TrafficSource.TWITTER_X
            persona = Persona.EXPLORER
        elif "google" in referrer_lower or "bing" in referrer_lower:
            source = TrafficSource.GOOGLE_SEARCH
            persona = Persona.FOUNDER
        else:
            source = TrafficSource.DIRECT
            persona = Persona.FOUNDER

        return source, persona

    @staticmethod
    def create_session(
        session_id: str,
        referrer: str = "",
        query_string: str = "",
        is_mobile: bool = False,
        viewport_width: float = 1920,
        viewport_height: float = 1080
    ) -> UserSessionContext:
        params = parse_qs(query_string)
        source, persona = UserContextEngine.analyze_source(referrer, params)

        return UserSessionContext(
            session_id=session_id,
            traffic_source=source,
            inferred_persona=persona,
            referrer_url=referrer,
            utm_source=params.get("utm_source", [""])[0],
            utm_campaign=params.get("utm_campaign", [""])[0],
            utm_medium=params.get("utm_medium", [""])[0],
            is_mobile=is_mobile,
            viewport_size=Vector2D(viewport_width, viewport_height)
        )

# =============================================================================
# 4. CURSOR INTENT & GAZE TRACKER
# =============================================================================

@dataclass
class CursorTelemetry:
    position: Vector2D = field(default_factory=lambda: Vector2D(50.0, 50.0))  # Percentage (0-100)
    velocity: Vector2D = field(default_factory=lambda: Vector2D(0.0, 0.0))
    acceleration: Vector2D = field(default_factory=lambda: Vector2D(0.0, 0.0))
    speed: float = 0.0
    heading: float = 0.0
    intent: CursorIntent = CursorIntent.IDLE_DWELL
    hovered_element_id: Optional[str] = None
    last_move_time: float = field(default_factory=time.time)
    predicted_target_300ms: Vector2D = field(default_factory=lambda: Vector2D(50.0, 50.0))

class CursorIntentTracker:
    """Tracks mouse movement dynamics, predicts destination, and infers user intent."""

    def __init__(self):
        self.history: List[Tuple[float, Vector2D]] = []
        self.last_update = time.time()
        self.telemetry = CursorTelemetry()

    def update_position(self, pos_pct: Vector2D, hovered_element: Optional[str] = None) -> CursorTelemetry:
        now = time.time()
        dt = max(0.001, now - self.last_update)
        self.last_update = now

        prev_pos = self.telemetry.position
        prev_vel = self.telemetry.velocity

        # Compute instant velocity (% per second)
        raw_vel = (pos_pct - prev_pos) / dt
        # Exponential smoothing
        smooth_vel = prev_vel * 0.4 + raw_vel * 0.6
        raw_acc = (smooth_vel - prev_vel) / dt
        smooth_acc = self.telemetry.acceleration * 0.4 + raw_acc * 0.6

        speed = smooth_vel.magnitude()
        heading = smooth_vel.angle() if speed > 1.0 else self.telemetry.heading

        # Predicted position 350ms in the future with velocity damping
        predicted = pos_pct + smooth_vel * 0.35
        predicted = predicted.clamp(5.0, 95.0)

        # Classify Intent
        if hovered_element:
            intent = CursorIntent.HOVERING_INTERACTIVE
        elif speed < 2.0 and (now - self.telemetry.last_move_time) > 2.5:
            intent = CursorIntent.IDLE_DWELL
        elif speed < 12.0 and abs(smooth_vel.x) > abs(smooth_vel.y) * 2:
            intent = CursorIntent.CAREFUL_READING
        elif speed > 85.0 or smooth_acc.magnitude() > 250.0:
            intent = CursorIntent.RAPID_SEARCHING
        elif smooth_acc.magnitude() > 400.0:
            intent = CursorIntent.ERRATIC_MOTION
        else:
            intent = CursorIntent.HOVERING_INTERACTIVE if speed < 8.0 else CursorIntent.RAPID_SEARCHING

        self.telemetry = CursorTelemetry(
            position=pos_pct,
            velocity=smooth_vel,
            acceleration=smooth_acc,
            speed=speed,
            heading=heading,
            intent=intent,
            hovered_element_id=hovered_element,
            last_move_time=now if speed > 1.0 else self.telemetry.last_move_time,
            predicted_target_300ms=predicted
        )
        return self.telemetry

# =============================================================================
# 5. PHYSICAL MASCOT KINEMATICS, DIZZINESS & HIT STATE MACHINE
# =============================================================================

@dataclass
class MascotRig:
    name: str                           # "AERO" or "DASH"
    role: str                           # "AI Assistant" or "System Drone"
    position: Vector2D                  # 0-100% within container
    velocity: Vector2D = field(default_factory=lambda: Vector2D(0.0, 0.0))
    target_pos: Vector2D = field(default_factory=lambda: Vector2D(50.0, 50.0))
    mass: float = 1.0
    damping: float = 0.75
    spring_k: float = 3.5
    expression: str = "happy"
    state: MascotState = MascotState.IDLE
    bubble_text: Optional[str] = None
    bubble_expires: float = 0.0

    # Interaction & Dizziness Dynamics
    is_dragging: bool = False
    drag_start_time: float = 0.0
    drag_distance_accum: float = 0.0
    drag_rotation_accum: float = 0.0
    last_drag_pos: Vector2D = field(default_factory=lambda: Vector2D(0.0, 0.0))
    dizziness_level: float = 0.0        # 0.0 to 1.0
    dizzy_expire_time: float = 0.0
    hit_recoil_expire: float = 0.0
    combo_hits: int = 0
    last_hit_time: float = 0.0

    # Personality traits
    max_speed: float = 45.0
    curiosity_factor: float = 0.6
    float_phase: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "role": self.role,
            "position": self.position.to_dict(),
            "velocity": self.velocity.to_dict(),
            "target": self.target_pos.to_dict(),
            "expression": self.expression,
            "state": self.state.value,
            "bubble": self.bubble_text if time.time() < self.bubble_expires else None,
            "dizziness": round(self.dizziness_level, 2),
            "is_dragging": self.is_dragging,
        }

class KinematicFlightEngine:
    """Simulates physical flight, spring-damper dynamics, boids steering, hits, and drag dizziness."""

    def __init__(self):
        # Aero: Buoyant, higher inertia, gentle halo stabilization
        self.aero = MascotRig(
            name="AERO",
            role="AI Assistant",
            position=Vector2D(18.0, 26.0),
            target_pos=Vector2D(18.0, 26.0),
            mass=2.2,
            damping=0.86,
            spring_k=2.8,
            expression=AeroExpression.HAPPY.value,
            max_speed=32.0,
            curiosity_factor=0.75
        )

        # Dash: Agile drone, lower mass, high thrust, snappy recovery
        self.dash = MascotRig(
            name="DASH",
            role="System Drone",
            position=Vector2D(78.0, 46.0),
            target_pos=Vector2D(78.0, 46.0),
            mass=0.95,
            damping=0.68,
            spring_k=4.8,
            expression=DashExpression.HAPPY.value,
            max_speed=62.0,
            curiosity_factor=0.90
        )

        self.last_tick = time.time()

    # -------------------------------------------------------------------------
    # HIT / CLICK INTERACTION
    # -------------------------------------------------------------------------
    def trigger_hit(self, mascot_name: str, impact_vector: Optional[Vector2D] = None) -> Dict[str, Any]:
        rig = self.aero if mascot_name.upper() == "AERO" else self.dash
        now = time.time()

        # Check combo hit
        if now - rig.last_hit_time < 0.9:
            rig.combo_hits += 1
        else:
            rig.combo_hits = 1
        rig.last_hit_time = now

        # Impact impulse
        impulse = impact_vector if impact_vector else Vector2D(
            (random.random() - 0.5) * 50.0,
            (random.random() - 0.5) * 35.0 - 15.0  # upwards flinch
        )
        rig.velocity = rig.velocity + impulse / rig.mass
        rig.state = MascotState.HIT_RECOIL
        rig.hit_recoil_expire = now + 1.2

        # Expression & response
        if rig.name == "AERO":
            if rig.combo_hits >= 3:
                rig.expression = AeroExpression.LOADING.value
                rig.bubble_text = "*Overload! Initializing energy shield! ⚡🛡️*"
            else:
                rig.expression = random.choice([AeroExpression.SURPRISED.value, AeroExpression.CONFUSED.value, AeroExpression.HIT.value])
                rig.bubble_text = random.choice([
                    "*Ouch! Analyzing kinetic impact... 🤖*",
                    "*Recalibrating sensory halo matrix! (>_<)*",
                    "*Hey! My processor felt that! ✨*"
                ])
        else:
            if rig.combo_hits >= 3:
                rig.expression = DashExpression.ALERT.value
                rig.bubble_text = "*Evasive maneuvers! Supersonic barrel roll! 🌀💨*"
                rig.velocity = Vector2D(random.choice([-1, 1]) * 80.0, -40.0)
            else:
                rig.expression = random.choice([DashExpression.ALERT.value, DashExpression.CONFUSED.value, DashExpression.HIT.value])
                rig.bubble_text = random.choice([
                    "*Whoa! Direct hit to thrusters! ⚡🚀*",
                    "*Turbulence detected! 🐦💨*",
                    "*Target intercepted with chassis! 💥*"
                ])

        rig.bubble_expires = now + 2.5
        return rig.to_dict()

    # -------------------------------------------------------------------------
    # DRAG & DIZZINESS ACCUMULATION
    # -------------------------------------------------------------------------
    def start_drag(self, mascot_name: str, start_pos: Vector2D) -> None:
        rig = self.aero if mascot_name.upper() == "AERO" else self.dash
        rig.is_dragging = True
        rig.state = MascotState.DRAGGING
        rig.drag_start_time = time.time()
        rig.drag_distance_accum = 0.0
        rig.drag_rotation_accum = 0.0
        rig.last_drag_pos = start_pos
        rig.velocity = Vector2D(0.0, 0.0)
        rig.expression = AeroExpression.SURPRISED.value if rig.name == "AERO" else DashExpression.WINKING.value

    def update_drag(self, mascot_name: str, current_pos: Vector2D) -> None:
        rig = self.aero if mascot_name.upper() == "AERO" else self.dash
        if not rig.is_dragging:
            return

        now = time.time()
        delta = current_pos - rig.last_drag_pos
        dist = delta.magnitude()
        rig.drag_distance_accum += dist

        # Calculate angular rotation / circular swirl motion
        if dist > 0.5:
            angle_prev = (rig.last_drag_pos - rig.position).angle()
            angle_curr = (current_pos - rig.position).angle()
            diff = abs(angle_curr - angle_prev)
            if diff < math.pi:
                rig.drag_rotation_accum += diff

        # Instantaneous position snap during drag
        rig.position = current_pos.clamp(6.0, 92.0)
        rig.target_pos = current_pos.clamp(6.0, 92.0)

        # Accumulate Dizziness based on rapid movement and circular swirls
        swirl_bonus = rig.drag_rotation_accum * 0.15
        motion_bonus = (rig.drag_distance_accum / 30.0)
        rig.dizziness_level = min(1.0, (motion_bonus + swirl_bonus) * 0.25)

        if rig.dizziness_level > 0.60:
            rig.state = MascotState.DIZZY
            rig.expression = AeroExpression.DIZZY.value if rig.name == "AERO" else DashExpression.DIZZY.value
            rig.bubble_text = "*Whoa... everything is spinning @~@!*"
            rig.bubble_expires = now + 2.0

        rig.last_drag_pos = current_pos

    def end_drag(self, mascot_name: str, release_velocity: Optional[Vector2D] = None) -> None:
        rig = self.aero if mascot_name.upper() == "AERO" else self.dash
        now = time.time()
        rig.is_dragging = False

        # If released with high velocity, apply ballistic fling throw
        if release_velocity and release_velocity.magnitude() > 5.0:
            fling_force = release_velocity.clamp(-120.0, 120.0)
            rig.velocity = fling_force * (0.8 / rig.mass)

        # Check if enters dizzy recovery state
        if rig.dizziness_level >= 0.55:
            rig.state = MascotState.DIZZY
            rig.expression = AeroExpression.DIZZY.value if rig.name == "AERO" else DashExpression.DIZZY.value
            rig.dizzy_expire_time = now + (3.0 * rig.dizziness_level)
            rig.bubble_text = random.choice([
                "*Sensors overloaded... Gyroscope spinning! @_@*",
                "*Whoa... 360 degree planetary drift... 🌀*",
                "*Initiating gyro calibration in 3.. 2.. 1..*"
            ])
            rig.bubble_expires = now + 3.0
        else:
            rig.state = MascotState.IDLE
            rig.expression = AeroExpression.HAPPY.value if rig.name == "AERO" else DashExpression.HAPPY.value

    # -------------------------------------------------------------------------
    # PHYSICS SIMULATION TICK (Spring-Damper + Boids + Dizziness Recovery)
    # -------------------------------------------------------------------------
    def update_physics(self, dt: float, cursor: CursorTelemetry) -> None:
        now = time.time()

        for rig in [self.aero, self.dash]:
            # 1. Skip position integration during active pointer drag
            if rig.is_dragging:
                continue

            # 2. Check Hit Recoil Recovery
            if rig.state == MascotState.HIT_RECOIL and now > rig.hit_recoil_expire:
                rig.state = MascotState.IDLE
                rig.expression = AeroExpression.HAPPY.value if rig.name == "AERO" else DashExpression.HAPPY.value

            # 3. Check Dizzy State & Gyroscope Reboot
            if rig.state == MascotState.DIZZY:
                # Add dizzy wobble oscillation to velocity
                wobble_freq = 12.0
                wobble = Vector2D(
                    math.sin(now * wobble_freq) * 14.0 * rig.dizziness_level,
                    math.cos(now * wobble_freq) * 10.0 * rig.dizziness_level
                )
                rig.velocity = rig.velocity + wobble * dt

                # Decay dizziness
                rig.dizziness_level = max(0.0, rig.dizziness_level - dt * 0.28)
                if now > rig.dizzy_expire_time or rig.dizziness_level <= 0.05:
                    rig.state = MascotState.GYRO_REBOOT
                    rig.expression = AeroExpression.ANALYZING.value if rig.name == "AERO" else DashExpression.SCANNING.value
                    rig.bubble_text = "*Gyroscopes calibrated! Systems nominal! ✨*"
                    rig.bubble_expires = now + 2.0
                    rig.dizziness_level = 0.0

            elif rig.state == MascotState.GYRO_REBOOT and now > rig.bubble_expires:
                rig.state = MascotState.IDLE
                rig.expression = AeroExpression.HAPPY.value if rig.name == "AERO" else DashExpression.HAPPY.value

            # 4. Spring-Mass-Damper force toward target
            to_target = rig.target_pos - rig.position
            dist = to_target.magnitude()

            # Spring force
            spring_force = to_target * rig.spring_k
            # Damping resistance
            damping_force = rig.velocity * (-rig.damping)
            # Gentle ambient buoyant floating
            rig.float_phase += dt * (1.8 if rig.name == "AERO" else 3.2)
            float_force = Vector2D(
                math.sin(rig.float_phase) * (1.2 if rig.name == "AERO" else 2.5),
                math.cos(rig.float_phase * 0.8) * (2.2 if rig.name == "AERO" else 1.5)
            )

            # Acceleration = (F_spring + F_damping + F_float) / Mass
            acceleration = (spring_force + damping_force + float_force) / rig.mass
            rig.velocity = rig.velocity + acceleration * dt

            # Speed clamp
            if rig.velocity.magnitude() > rig.max_speed:
                rig.velocity = rig.velocity.normalized() * rig.max_speed

            # Integrate position
            rig.position = rig.position + rig.velocity * dt

            # 5. Soft Boundary Bounces (Confined within 6% - 94% viewport)
            if rig.position.x < 6.0:
                rig.position.x = 6.0
                rig.velocity.x = abs(rig.velocity.x) * 0.6
            elif rig.position.x > 92.0:
                rig.position.x = 92.0
                rig.velocity.x = -abs(rig.velocity.x) * 0.6

            if rig.position.y < 8.0:
                rig.position.y = 8.0
                rig.velocity.y = abs(rig.velocity.y) * 0.6
            elif rig.position.y > 88.0:
                rig.position.y = 88.0
                rig.velocity.y = -abs(rig.velocity.y) * 0.6

        # 6. Tactical Separation between Aero & Dash (Maintain minimum comfortable spacing)
        sep_vec = self.dash.position - self.aero.position
        sep_dist = sep_vec.magnitude()
        min_spacing = 14.0
        if 0.1 < sep_dist < min_spacing:
            push = sep_vec.normalized() * (min_spacing - sep_dist) * 0.5
            self.aero.position = self.aero.position - push * 0.3
            self.dash.position = self.dash.position + push * 0.7

# =============================================================================
# 6. CONTEXTUAL DIALOGUE & PERSONA INTELLIGENCE DIRECTOR
# =============================================================================

class MascotDialogueDirector:
    """Generates authentic, persona-grounded dialogues reflecting the brand and user intent."""

    COMMENTARY_MATRIX: Dict[str, Dict[Persona, List[Dict[str, Any]]]] = {
        "hero": {
            Persona.TECH_LEAD: [
                {"who": "AERO", "expr": "analyzing", "text": "Clean Architecture detected: modular domain layers, pure DI, and 99.8% test coverage."},
                {"who": "DASH", "expr": "executing", "text": "Zero compile lag, 60 FPS on iOS & Android via Flutter! 🚀"},
                {"who": "AERO", "expr": "thinking", "text": "Notice the decoupled UI state management and deterministic telemetry pipelines."},
            ],
            Persona.RECRUITER: [
                {"who": "AERO", "expr": "happy", "text": "Welcome! Hafiz Ali Abdullah is a Lead Product & Flutter/SaaS Engineer."},
                {"who": "DASH", "expr": "winking", "text": "5+ published production apps and high-scale SaaS architectures shipped! 📱"},
                {"who": "AERO", "expr": "excited", "text": "You can grab Abdullah's full CV and verified skill matrix right from the header! 📄"},
            ],
            Persona.FOUNDER: [
                {"who": "DASH", "expr": "executing", "text": "Building an MVP or SaaS? Abdullah ships App Store ready products in record time! ⚡"},
                {"who": "AERO", "expr": "happy", "text": "From architectural design to live deployment, we turn complex ideas into revenue. 💡"},
                {"who": "DASH", "expr": "winking", "text": "Tap [Book Strategy Call] below to lock in a free architecture session! 🗓️"},
            ],
            Persona.AI_RESEARCHER: [
                {"who": "AERO", "expr": "analyzing", "text": "Neural pipeline scan active: algorithmic optimization and intelligent agent systems."},
                {"who": "DASH", "expr": "focused", "text": "Kaggle Grandmaster track & advanced mathematical modeling integrated! 🧠"},
            ],
            Persona.EXPLORER: [
                {"who": "DASH", "expr": "excited", "text": "Hey explorer! Catch me if you can — try dragging us around! 🐦⚡"},
                {"who": "AERO", "expr": "happy", "text": "I think and analyze while Dash moves and executes. Enjoy the portfolio! ✨"},
            ],
        },
        "command_center": {
            Persona.TECH_LEAD: [
                {"who": "AERO", "expr": "analyzing", "text": "Command Center Core: Distributed WebSockets with sub-20ms multi-terminal sync."},
                {"who": "DASH", "expr": "focused", "text": "Real-time state telemetry, offline-first SQLite caches, zero ghost mutations! ⚡"},
            ],
            Persona.FOUNDER: [
                {"who": "DASH", "expr": "excited", "text": "This is the flagship WOS ecosystem — powers live restaurant chains daily! 🍔"},
                {"who": "AERO", "expr": "happy", "text": "Unified ecosystem: Customer Apps + Kitchen Terminals + Admin Cloud Core."},
            ],
            Persona.RECRUITER: [
                {"who": "AERO", "expr": "happy", "text": "Inspect the live telemetry cards below to view production architecture metrics."},
                {"who": "DASH", "expr": "winking", "text": "Every app listed here is live and actively used in production! ✅"},
            ],
        }
    }

    @classmethod
    def get_contextual_line(cls, section: str, persona: Persona) -> Optional[Dict[str, Any]]:
        section_pool = cls.COMMENTARY_MATRIX.get(section, cls.COMMENTARY_MATRIX.get("hero", {}))
        lines = section_pool.get(persona, section_pool.get(Persona.FOUNDER, []))
        if not lines:
            return None
        return random.choice(lines)

# =============================================================================
# 7. INTERACTIVE GUIDED TOUR SYSTEM
# =============================================================================

@dataclass
class TourStep:
    step_id: int
    title: str
    target_selector: str
    aero_waypoint: Vector2D
    dash_waypoint: Vector2D
    aero_line: str
    dash_line: str
    aero_expr: AeroExpression = AeroExpression.HAPPY
    dash_expr: DashExpression = DashExpression.HAPPY
    dwell_duration: float = 6.0

@dataclass
class TourDefinition:
    tour_id: str
    name: str
    description: str
    steps: List[TourStep]

class TourGuideSystem:
    """Directs multi-step interactive tours with coordinated dual-mascot choreography."""

    def __init__(self):
        self.active_tour: Optional[TourDefinition] = None
        self.current_step_idx: int = 0
        self.step_start_time: float = 0.0
        self.is_playing: bool = False
        self.tours: Dict[str, TourDefinition] = self._build_tours()

    def _build_tours(self) -> Dict[str, TourDefinition]:
        # 1. Executive Master Tour
        exec_tour = TourDefinition(
            tour_id="executive_tour",
            name="Executive Portfolio Overview",
            description="Complete strategic overview of skills, shipped apps, SaaS platform, and booking.",
            steps=[
                TourStep(
                    step_id=1,
                    title="System Engineering Philosophy",
                    target_selector="#hero",
                    aero_waypoint=Vector2D(20.0, 28.0),
                    dash_waypoint=Vector2D(76.0, 32.0),
                    aero_line="Welcome! I'm Aero. We build software with uncompromising architectural rigor.",
                    dash_line="And I'm Dash! We ship at supersonic velocity without sacrificing stability! 🚀",
                    aero_expr=AeroExpression.HAPPY,
                    dash_expr=DashExpression.EXCITED,
                    dwell_duration=6.5
                ),
                TourStep(
                    step_id=2,
                    title="Shipped Flutter Mobile Ecosystem",
                    target_selector="#work",
                    aero_waypoint=Vector2D(25.0, 48.0),
                    dash_waypoint=Vector2D(70.0, 52.0),
                    aero_line="Explore 5+ published commercial Flutter apps with offline caching & clean bloc architectures.",
                    dash_line="Every app is verified, App Store ready, and running live in production! 📱✨",
                    aero_expr=AeroExpression.ANALYZING,
                    dash_expr=DashExpression.WINKING,
                    dwell_duration=7.0
                ),
                TourStep(
                    step_id=3,
                    title="Flagship onlineorder.pk SaaS Platform",
                    target_selector="#saas",
                    aero_waypoint=Vector2D(22.0, 35.0),
                    dash_waypoint=Vector2D(75.0, 40.0),
                    aero_line="The crown jewel: A multi-tier distributed restaurant ordering & POS ecosystem.",
                    dash_line="Handles real-time ordering terminals, payment gateways, and live customer tracking! 🍔⚡",
                    aero_expr=AeroExpression.THINKING,
                    dash_expr=DashExpression.EXECUTING,
                    dwell_duration=7.5
                ),
                TourStep(
                    step_id=4,
                    title="Ready to Build? Book a Strategy Call",
                    target_selector="#book",
                    aero_waypoint=Vector2D(30.0, 60.0),
                    dash_waypoint=Vector2D(68.0, 60.0),
                    aero_line="Have a product vision in mind? Let's engineer a clear roadmap.",
                    dash_line="Tap the WhatsApp or Email button to schedule your direct strategy call with Abdullah! 🚀📞",
                    aero_expr=AeroExpression.WINKING,
                    dash_expr=DashExpression.EXCITED,
                    dwell_duration=6.0
                )
            ]
        )

        # 2. Command Center Technical Deep-Dive
        tech_tour = TourDefinition(
            tour_id="tech_deep_dive",
            name="Command Center Deep-Dive",
            description="Technical inspection of telemetry, system core, and real-time synchronization.",
            steps=[
                TourStep(
                    step_id=1,
                    title="Active Build Pipeline",
                    target_selector="#active-build",
                    aero_waypoint=Vector2D(22.0, 30.0),
                    dash_waypoint=Vector2D(45.0, 25.0),
                    aero_line="Active build status: Zero lint violations, deterministic compilation, CI/CD green.",
                    dash_line="Hot reload active! Real-time code changes under 120 milliseconds! ⚡",
                    aero_expr=AeroExpression.ANALYZING,
                    dash_expr=DashExpression.FOCUSED,
                    dwell_duration=6.0
                ),
                TourStep(
                    step_id=2,
                    title="System Core Architecture",
                    target_selector="#system-core",
                    aero_waypoint=Vector2D(50.0, 24.0),
                    dash_waypoint=Vector2D(78.0, 36.0),
                    aero_line="Notice the unidirectional data flow and strict domain boundaries.",
                    dash_line="Optimized GPU rendering pipeline maintaining a rock-solid 60 FPS! 🎯",
                    aero_expr=AeroExpression.THINKING,
                    dash_expr=DashExpression.EXECUTING,
                    dwell_duration=6.0
                )
            ]
        )

        return {
            "executive_tour": exec_tour,
            "tech_deep_dive": tech_tour
        }

    def start_tour(self, tour_id: str, flight_engine: KinematicFlightEngine) -> bool:
        if tour_id not in self.tours:
            return False

        self.active_tour = self.tours[tour_id]
        self.current_step_idx = 0
        self.step_start_time = time.time()
        self.is_playing = True
        self._apply_current_step(flight_engine)
        return True

    def _apply_current_step(self, flight_engine: KinematicFlightEngine) -> None:
        if not self.active_tour or self.current_step_idx >= len(self.active_tour.steps):
            return

        step = self.active_tour.steps[self.current_step_idx]
        flight_engine.aero.state = MascotState.TOUR_GUIDE
        flight_engine.dash.state = MascotState.TOUR_GUIDE

        # Assign targets
        flight_engine.aero.target_pos = step.aero_waypoint
        flight_engine.dash.target_pos = step.dash_waypoint

        # Assign expressions
        flight_engine.aero.expression = step.aero_expr.value
        flight_engine.dash.expression = step.dash_expr.value

        # Alternating speech bubbles
        now = time.time()
        flight_engine.aero.bubble_text = step.aero_line
        flight_engine.aero.bubble_expires = now + (step.dwell_duration * 0.55)

        # Dash speaks in second half of step
        flight_engine.dash.bubble_text = step.dash_line
        flight_engine.dash.bubble_expires = now + step.dwell_duration

    def update_tour(self, dt: float, flight_engine: KinematicFlightEngine) -> Optional[Dict[str, Any]]:
        if not self.is_playing or not self.active_tour:
            return None

        now = time.time()
        current_step = self.active_tour.steps[self.current_step_idx]
        elapsed = now - self.step_start_time

        if elapsed > current_step.dwell_duration:
            self.current_step_idx += 1
            if self.current_step_idx >= len(self.active_tour.steps):
                # Tour complete!
                self.is_playing = False
                flight_engine.aero.state = MascotState.IDLE
                flight_engine.dash.state = MascotState.IDLE
                flight_engine.aero.bubble_text = "*Tour complete! Feel free to explore freely! ✨*"
                flight_engine.dash.bubble_text = "*Ready whenever you want to deploy! 🚀*"
                flight_engine.aero.bubble_expires = now + 3.0
                flight_engine.dash.bubble_expires = now + 3.0
                return {"tour_status": "COMPLETED", "tour_id": self.active_tour.tour_id}
            else:
                self.step_start_time = now
                self._apply_current_step(flight_engine)

        return {
            "tour_status": "PLAYING",
            "tour_id": self.active_tour.tour_id,
            "step_index": self.current_step_idx,
            "total_steps": len(self.active_tour.steps),
            "step_title": current_step.title,
            "target": current_step.target_selector
        }

# =============================================================================
# 8. CENTRAL MASCOT ORCHESTRATOR
# =============================================================================

class MascotOrchestrator:
    """Master coordinator linking physics, user persona, intent, dialogue, and tour state."""

    def __init__(self, session_context: Optional[UserSessionContext] = None):
        self.session = session_context or UserSessionContext(session_id="local_sim")
        self.cursor_tracker = CursorIntentTracker()
        self.flight_engine = KinematicFlightEngine()
        self.tour_system = TourGuideSystem()
        self.last_commentary_time = time.time()
        self.last_tick = time.time()

    def handle_cursor_move(self, x_pct: float, y_pct: float, hovered_id: Optional[str] = None) -> Dict[str, Any]:
        pos = Vector2D(x_pct, y_pct)
        telemetry = self.cursor_tracker.update_position(pos, hovered_id)

        # Autonomous flight reactions to cursor when not in tour or drag mode
        if not self.tour_system.is_playing:
            # Dash is curious: swoops closer to cursor if hovering interactive items
            if telemetry.intent == CursorIntent.HOVERING_INTERACTIVE and not self.flight_engine.dash.is_dragging:
                if self.flight_engine.dash.state in [MascotState.IDLE, MascotState.PATROL]:
                    offset = Vector2D(12.0, -8.0)
                    self.flight_engine.dash.target_pos = (telemetry.position + offset).clamp(10.0, 88.0)
                    self.flight_engine.dash.expression = DashExpression.SCANNING.value

            # Aero avoids rapid chaotic sweeps to remain readable and stable
            if telemetry.intent == CursorIntent.RAPID_SEARCHING and not self.flight_engine.aero.is_dragging:
                # Glide towards safe corner
                safe_x = 15.0 if telemetry.position.x > 50.0 else 85.0
                self.flight_engine.aero.target_pos = Vector2D(safe_x, 22.0)
                self.flight_engine.aero.expression = AeroExpression.ANALYZING.value

        return self.get_full_state()

    def handle_hit(self, mascot: str) -> Dict[str, Any]:
        return self.flight_engine.trigger_hit(mascot)

    def handle_drag_start(self, mascot: str, x_pct: float, y_pct: float) -> None:
        self.flight_engine.start_drag(mascot, Vector2D(x_pct, y_pct))

    def handle_drag_move(self, mascot: str, x_pct: float, y_pct: float) -> None:
        self.flight_engine.update_drag(mascot, Vector2D(x_pct, y_pct))

    def handle_drag_end(self, mascot: str, vx: float = 0.0, vy: float = 0.0) -> None:
        self.flight_engine.end_drag(mascot, Vector2D(vx, vy))

    def start_tour(self, tour_id: str = "executive_tour") -> bool:
        return self.tour_system.start_tour(tour_id, self.flight_engine)

    def tick(self) -> Dict[str, Any]:
        now = time.time()
        dt = max(0.001, min(0.1, now - self.last_tick))
        self.last_tick = now
        self.session.dwell_seconds += dt

        # Update Physics
        self.flight_engine.update_physics(dt, self.cursor_tracker.telemetry)

        # Update Tour if active
        tour_state = self.tour_system.update_tour(dt, self.flight_engine)

        # Ambient Contextual Commentary (every 9-14s when idle)
        if not self.tour_system.is_playing and now - self.last_commentary_time > 11.0:
            if random.random() < 0.45:
                line = MascotDialogueDirector.get_contextual_line(self.session.current_section, self.session.inferred_persona)
                if line:
                    if line["who"] == "AERO" and not self.flight_engine.aero.is_dragging:
                        self.flight_engine.aero.bubble_text = line["text"]
                        self.flight_engine.aero.expression = line["expr"]
                        self.flight_engine.aero.bubble_expires = now + 4.0
                    elif line["who"] == "DASH" and not self.flight_engine.dash.is_dragging:
                        self.flight_engine.dash.bubble_text = line["text"]
                        self.flight_engine.dash.expression = line["expr"]
                        self.flight_engine.dash.bubble_expires = now + 4.0
            self.last_commentary_time = now

        return self.get_full_state(tour_state)

    def get_full_state(self, tour_state: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "timestamp": round(time.time(), 3),
            "session": {
                "id": self.session.session_id,
                "source": self.session.traffic_source.value,
                "persona": self.session.inferred_persona.value,
                "dwell_sec": round(self.session.dwell_seconds, 1),
                "section": self.session.current_section
            },
            "cursor": {
                "pos": self.cursor_tracker.telemetry.position.to_dict(),
                "velocity": self.cursor_tracker.telemetry.velocity.to_dict(),
                "speed": round(self.cursor_tracker.telemetry.speed, 2),
                "intent": self.cursor_tracker.telemetry.intent.value,
                "hovered": self.cursor_tracker.telemetry.hovered_element_id
            },
            "aero": self.flight_engine.aero.to_dict(),
            "dash": self.flight_engine.dash.to_dict(),
            "tour": tour_state or {"is_playing": self.tour_system.is_playing}
        }

# =============================================================================
# 9. ASYNC HTTP & WEBSOCKET STREAMING SERVER (FOR FRONTEND INTEGRATION)
# =============================================================================

class MascotServerHandler(http.server.BaseHTTPRequestHandler):
    orchestrator: Optional[MascotOrchestrator] = None

    def _set_cors(self, content_type: str = "application/json"):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/state":
            self._set_cors()
            state = self.orchestrator.tick() if self.orchestrator else {}
            self.wfile.write(json.dumps(state).encode("utf-8"))
        elif parsed.path == "/api/tours":
            self._set_cors()
            tours = {
                t_id: {"name": t.name, "description": t.description, "steps": len(t.steps)}
                for t_id, t in (self.orchestrator.tour_system.tours.items() if self.orchestrator else {}.items())
            }
            self.wfile.write(json.dumps(tours).encode("utf-8"))
        else:
            self._set_cors("text/plain")
            self.wfile.write(b"HX313 Mascot Engine Active. Endpoints: /api/state, /api/hit, /api/tour, /api/cursor")

    def do_POST(self):
        parsed = urlparse(self.path)
        content_len = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_len) if content_len > 0 else b"{}"

        try:
            data = json.loads(post_body.decode("utf-8")) if post_body else {}
        except Exception:
            data = {}

        if not self.orchestrator:
            self._set_cors()
            self.wfile.write(b'{"error": "Orchestrator not initialized"}')
            return

        if parsed.path == "/api/cursor":
            x = float(data.get("x", 50.0))
            y = float(data.get("y", 50.0))
            hovered = data.get("hovered", None)
            res = self.orchestrator.handle_cursor_move(x, y, hovered)
            self._set_cors()
            self.wfile.write(json.dumps(res).encode("utf-8"))

        elif parsed.path == "/api/hit":
            mascot = str(data.get("mascot", "aero"))
            res = self.orchestrator.handle_hit(mascot)
            self._set_cors()
            self.wfile.write(json.dumps(res).encode("utf-8"))

        elif parsed.path == "/api/drag":
            action = data.get("action", "move")  # "start", "move", "end"
            mascot = str(data.get("mascot", "aero"))
            x = float(data.get("x", 50.0))
            y = float(data.get("y", 50.0))
            vx = float(data.get("vx", 0.0))
            vy = float(data.get("vy", 0.0))

            if action == "start":
                self.orchestrator.handle_drag_start(mascot, x, y)
            elif action == "move":
                self.orchestrator.handle_drag_move(mascot, x, y)
            elif action == "end":
                self.orchestrator.handle_drag_end(mascot, vx, vy)

            self._set_cors()
            self.wfile.write(json.dumps(self.orchestrator.get_full_state()).encode("utf-8"))

        elif parsed.path == "/api/tour":
            tour_id = data.get("tour_id", "executive_tour")
            success = self.orchestrator.start_tour(tour_id)
            self._set_cors()
            self.wfile.write(json.dumps({"success": success, "tour_id": tour_id}).encode("utf-8"))

        else:
            self._set_cors()
            self.wfile.write(b'{"status": "unknown_endpoint"}')

def run_server(port: int = 8765):
    orchestrator = MascotOrchestrator(
        UserContextEngine.create_session("web_client", referrer="https://github.com/Hx-313")
    )
    MascotServerHandler.orchestrator = orchestrator

    with socketserver.ThreadingTCPServer(("", port), MascotServerHandler) as httpd:
        print(f"\n✨ [HX313 MASCOT SERVER] Online at http://localhost:{port}")
        print(f"📡 API Endpoints:")
        print(f"   GET  http://localhost:{port}/api/state")
        print(f"   GET  http://localhost:{port}/api/tours")
        print(f"   POST http://localhost:{port}/api/cursor   body: {{'x': 25, 'y': 60, 'hovered': 'btn-cta'}}")
        print(f"   POST http://localhost:{port}/api/hit      body: {{'mascot': 'aero'}}")
        print(f"   POST http://localhost:{port}/api/drag     body: {{'action': 'move', 'mascot': 'dash', 'x': 40, 'y': 30}}")
        print(f"   POST http://localhost:{port}/api/tour     body: {{'tour_id': 'executive_tour'}}")
        print(f"\nPress Ctrl+C to terminate.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

# =============================================================================
# 10. INTERACTIVE ANSI TERMINAL SIMULATOR & VISUALIZER
# =============================================================================

def run_cli_simulation():
    """Runs a rich real-time terminal visualizer displaying ASCII space map and mascot telemetry."""
    orchestrator = MascotOrchestrator(
        UserContextEngine.create_session("cli_session", referrer="https://github.com/Hx-313")
    )

    print("\033[2J\033[H", end="")  # Clear terminal
    print("=" * 80)
    print("  🚀 HX313 MASCOTS KINEMATICS & INTELLIGENCE SIMULATOR (AERO & DASH) 🤖⚡")
    print("=" * 80)
    print("  CONTROLS: [A] Hit Aero | [D] Hit Dash | [S] Drag Aero (Dizzy) | [T] Start Tour | [Q] Quit")
    print("-" * 80)

    # Simulated trajectory loop
    cursor_x = 50.0
    cursor_y = 50.0
    t = 0.0

    try:
        for frame in range(120):  # Simulate 120 steps
            t += 0.1
            # Simulated organic cursor motion
            cursor_x = 50.0 + math.sin(t * 0.8) * 32.0
            cursor_y = 45.0 + math.cos(t * 1.1) * 22.0
            hovered = "project_card_wos" if 40 < cursor_x < 60 and 40 < cursor_y < 60 else None

            # Simulate interaction events
            if frame == 20:
                orchestrator.handle_hit("aero")
            elif frame == 35:
                # Simulate violent circular drag on Dash to trigger DIZZY
                orchestrator.handle_drag_start("dash", 70.0, 50.0)
                for _ in range(8):
                    orchestrator.handle_drag_move("dash", 70.0 + math.sin(_) * 15.0, 50.0 + math.cos(_) * 15.0)
                orchestrator.handle_drag_end("dash", vx=30.0, vy=-15.0)
            elif frame == 70:
                orchestrator.start_tour("executive_tour")

            state = orchestrator.handle_cursor_move(cursor_x, cursor_y, hovered)
            orchestrator.tick()

            # Render ASCII Space Map (50 cols x 14 rows)
            cols, rows = 50, 14
            grid = [["." for _ in range(cols)] for _ in range(rows)]

            # Draw cursor
            cx = max(0, min(cols - 1, int((cursor_x / 100.0) * cols)))
            cy = max(0, min(rows - 1, int((cursor_y / 100.0) * rows)))
            grid[cy][cx] = "X"

            # Draw Aero
            ax = max(0, min(cols - 1, int((state["aero"]["position"]["x"] / 100.0) * cols)))
            ay = max(0, min(rows - 1, int((state["aero"]["position"]["y"] / 100.0) * rows)))
            grid[ay][ax] = "A"

            # Draw Dash
            dx = max(0, min(cols - 1, int((state["dash"]["position"]["x"] / 100.0) * cols)))
            dy = max(0, min(rows - 1, int((state["dash"]["position"]["y"] / 100.0) * rows)))
            grid[dy][dx] = "D"

            # Print frame
            print(f"\033[5;1H", end="")
            print("+" + "-" * (cols * 2) + "+")
            for r in range(rows):
                row_str = " ".join(grid[r])
                print(f"| {row_str} |")
            print("+" + "-" * (cols * 2) + "+")

            # Telemetry readout
            a_state = state["aero"]
            d_state = state["dash"]
            cur = state["cursor"]

            print(f"\n📊 [TELEMETRY FEED - Frame {frame:03d}]  Persona: {state['session']['persona']} | Intent: {cur['intent']}")
            print(f"   🖱️ Cursor : Pos=({cur['pos']['x']:4.1f}%, {cur['pos']['y']:4.1f}%) | Speed={cur['speed']:4.1f}%/s | Hover={cur['hovered'] or 'None'}")
            print(f"   🤖 AERO   : Pos=({a_state['position']['x']:4.1f}%, {a_state['position']['y']:4.1f}%) | Expr={a_state['expression']:<9} | State={a_state['state']:<10} | Dizzy={a_state['dizziness']:.2f}")
            if a_state['bubble']:
                print(f"      💬 Aero: \"{a_state['bubble']}\"")
            print(f"   ⚡ DASH   : Pos=({d_state['position']['x']:4.1f}%, {d_state['position']['y']:4.1f}%) | Expr={d_state['expression']:<9} | State={d_state['state']:<10} | Dizzy={d_state['dizziness']:.2f}")
            if d_state['bubble']:
                print(f"      💬 Dash: \"{d_state['bubble']}\"")

            if state["tour"].get("tour_status") == "PLAYING":
                print(f"\n   🗺️ [GUIDED TOUR ACTIVE]: {state['tour']['step_title']} (Target: {state['tour']['target']})")

            time.sleep(0.06)

    except KeyboardInterrupt:
        pass

    print("\n✅ Simulation completed successfully.")

# =============================================================================
# 11. ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    if "--serve" in sys.argv:
        port_idx = sys.argv.index("--port") + 1 if "--port" in sys.argv else -1
        port_num = int(sys.argv[port_idx]) if port_idx > 0 and port_idx < len(sys.argv) else 8765
        run_server(port_num)
    else:
        run_cli_simulation()
