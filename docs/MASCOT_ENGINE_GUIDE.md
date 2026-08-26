# HX313 Mascot Intelligence, Kinematics & Tour Engine Guide (Aero & Dash)

> **Design & Engineering**: HX313 System Mascots · *Think • Build • Deploy*  
> **Source**: `scripts/mascot_engine.py`  
> **Test Suite**: `scripts/test_mascot_engine.py`

---

## 1. Mascot Profiles & Design Sheet Specifications

Based on the official **HX313 Mascot Design Sheet**:

```
+----------------------------------------------------------------------------------------------------+
|                                      HX313 PRODUCT ENGINEER                                         |
|                                      THINK • BUILD • DEPLOY                                         |
+----------------------------------------------------------------------------------------------------+
| AERO — AI ASSISTANT                               | DASH — SYSTEM DRONE                            |
| "I think, analyze and assist."                    | "I move, monitor and execute."                 |
|                                                   |                                                |
| Personality: Calm, Smart, Helpful, Curious        | Personality: Energetic, Fast, Focused, Reliable|
| Role: Handles analysis, suggestions & informs     | Role: Executes tasks, monitors & moves systems |
|                                                   |                                                |
| Signature Elements:                               | Signature Elements:                            |
|   • Halo Ring (Thinking Indicator)                |   • Antennae (Signal Receiver)                 |
|   • Ear Pods (Audio Interface)                    |   • Face Screen (Expression Engine)            |
|   • Face Screen (Emotion Engine)                  |   • Thrusters (Flight & Movement)              |
|   • Core Body (AI Holographic Glass Processor)    |   • Robotic Arms (Interaction / Action)        |
|                                                   |                                                |
| Expressions:                                      | Expressions:                                   |
|   happy, thinking, excited, analyzing, confused,   |   happy, winking, excited, focused, scanning,  |
|   winking, loading, surprised, sleep, hit, dizzy  |   confused, executing, alert, sleep, hit, dizzy|
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Core Capabilities

### A. User Origin & Persona Intelligence (`UserContextEngine`)
Understands the visitor's traffic source and tailors mascot dialogue and guidance:
- **GitHub** (`github.com`): Inferred as `TECH_LEAD` — Mascots highlight Clean Architecture, 99.8% test coverage, Dart/Flutter patterns, and CI/CD pipelines.
- **LinkedIn / Upwork** (`linkedin.com`, `upwork.com`): Inferred as `RECRUITER` / `FOUNDER` — Highlights 5+ shipped production apps, CV downloads, and strategy call booking.
- **Kaggle** (`kaggle.com`): Inferred as `AI_RESEARCHER` — Highlights algorithmic pipelines and machine learning systems.
- **Direct Search**: Inferred as `FOUNDER` — Highlights full-stack SaaS builds (`onlineorder.pk`) and MVP turnaround speed.

### B. Predictive Cursor Intent & Kinematics (`CursorIntentTracker` & `KinematicFlightEngine`)
- Tracks cursor $(x, y)$, speed, and acceleration.
- Predicts cursor trajectory $300\text{ms}-500\text{ms}$ into the future.
- **Kinematic Physics**:
  - **Aero**: Smooth, floating, high inertia ($m = 2.2$), critical damping ($\zeta = 0.86$), gentle parabolic glides.
  - **Dash**: Snappy, agile, low inertia ($m = 0.95$), high thrust ($\zeta = 0.68$), dynamic banking turns.
  - **Boids Steering**: Seek, Arrive with deceleration zones, tactical dual separation, and cursor escort orbiting.

### C. Hit / Click Reaction State Machine
- **Single Click/Hit**: Recoil impulse flinch with immediate expression change (`surprised`, `hit`, `confused`) and playful defensive banter.
- **Combo Hits (Rapid Clicks)**: Triggers special defense sequences (Aero loads energy shield; Dash performs supersonic evasive barrel rolls).

### D. Continuous Dragging & Rotational Dizziness Accumulator
- Measures continuous drag distance, instantaneous velocity, and angular swirl circles.
- When `dizziness_level > 0.60`, transitions to the **`DIZZY`** state:
  - **Eyes**: Hypnotic spiral vortex eyes (`@_@` / `🌀_🌀`).
  - **Physics**: Wobbly orbital tumbling drift with helical recoil.
  - **Recovery**: Automatic **Gyroscopic Sensor Reboot** sequence upon release to return to nominal status.

### E. Interactive Guided Tour System (`TourGuideSystem`)
- **Executive Portfolio Tour**: Coordinates Aero and Dash through Hero $\rightarrow$ Shipped Flutter Apps $\rightarrow$ Flagship SaaS Platform $\rightarrow$ Booking.
- **Command Center Technical Tour**: Deep-dive into Active Build pipelines and System Core telemetry.

---

## 3. Running the Python Engine

### A. Terminal Interactive Simulation
Run the rich ANSI terminal simulation with real-time ASCII map and live telemetry:

```powershell
python scripts/mascot_engine.py
```

### B. Unit & Integration Test Suite
Execute the automated test suite:

```powershell
python scripts/test_mascot_engine.py
```

### C. Live HTTP / WebSocket API Server Mode
Launch the streaming backend for web clients:

```powershell
python scripts/mascot_engine.py --serve --port 8765
```

---

## 4. API Endpoints Reference

| Method | Endpoint | Description | Sample Request Body |
|---|---|---|---|
| `GET` | `/api/state` | Returns full engine state (Aero, Dash, cursor, tour, session) | None |
| `GET` | `/api/tours` | Returns available tours and steps | None |
| `POST` | `/api/cursor` | Ingests real-time mouse/touch coordinates | `{"x": 45.2, "y": 62.0, "hovered": "btn-saas"}` |
| `POST` | `/api/hit` | Triggers a click/hit impact on a mascot | `{"mascot": "aero"}` or `{"mascot": "dash"}` |
| `POST` | `/api/drag` | Handles continuous drag pointer events | `{"action": "move", "mascot": "dash", "x": 60, "y": 40}` |
| `POST` | `/api/tour` | Starts or jumps to a guided tour | `{"tour_id": "executive_tour"}` |

### Sample JSON Telemetry Packet:
```json
{
  "timestamp": 1724718290.41,
  "session": {
    "id": "web_client",
    "source": "GITHUB",
    "persona": "TECH_LEAD",
    "dwell_sec": 42.5,
    "section": "hero"
  },
  "cursor": {
    "pos": { "x": 52.4, "y": 38.1 },
    "speed": 14.8,
    "intent": "HOVERING_INTERACTIVE",
    "hovered": "project_card_wos"
  },
  "aero": {
    "name": "AERO",
    "role": "AI Assistant",
    "position": { "x": 22.4, "y": 28.5 },
    "expression": "analyzing",
    "state": "IDLE",
    "bubble": "Clean architecture verified. 99.8% test coverage.",
    "dizziness": 0.0,
    "is_dragging": false
  },
  "dash": {
    "name": "DASH",
    "role": "System Drone",
    "position": { "x": 68.2, "y": 44.0 },
    "expression": "executing",
    "state": "IDLE",
    "bubble": "60 FPS Flutter telemetry active! ⚡",
    "dizziness": 0.0,
    "is_dragging": false
  },
  "tour": {
    "is_playing": false
  }
}
```
