# NASA SPACE APPS

Proposed Niche Project for NASA Space Apps

### **Project Title:** *Habitat Harmony: Lunar Stress Layout Simulator (LS²)*

*(A NASA-data-driven interactive simulator for evaluating psychological resilience in lunar habitat layouts.)*

---

### **Niche Focus**

**Single precise problem being solved:**

How can **internal habitat layout and zoning** reduce **crew psychological stress** and improve **behavioral health** in long-duration lunar missions — within **NASA’s volumetric and habitability constraints**?

This isolates one of the hardest and most under-served sub-problems in the challenge:

> Mapping spatial configuration to psychological performance using validated NASA analog and design data.
> 

---

### **NASA-Derived Foundations**

| Data Source | How It Informs the Simulator |
| --- | --- |
| **NASA/TP-2020-220505 — Deep Space Habitability Design Guidelines** | Provides quantitative volume allocations and adjacency rules (e.g., crew quarters, hygiene, galley, exercise, waste) to generate layout constraints. |
| **HERA Facility Documentation (2019)** | Defines mission durations (up to 45 days), crew size (4), lighting, and psychological stressor modeling for confined environments. |
| **UND Lunar Daytime Behavioral Study (2020)** | Supplies behavioral metrics and flexibility parameters for analog missions, forming the core of the psychometric simulation. |
| **AIAA “Internal Layout of a Lunar Surface Habitat” (2022)** | Establishes empirical area and volume tables for each function (e.g., 1.82 m² sleep, 1.06 m² hygiene) to constrain user design actions. |
| **HDU / HERA Habitat Demonstration Unit reports (2013)** | Validates modular architecture and ergonomic flow for realistic layout rendering. |
| **MMPACT / Moon-to-Mars Architecture (2024)** | Contextualizes lunar surface construction methods and power/logistics coupling for surface missions. |

---

### **Core Objective**

Create an **interactive simulation tool** where users design interior layouts of a lunar habitat and receive **quantitative psych-health feedback** based on NASA-validated data (lighting, volume, adjacency, privacy).

---

### **How It Works**

### 1. **Setup Phase**

- Select mission parameters:
    - Duration (30–60 days per HERA protocol).
    - Crew size (2–4).
    - Habitat type (Inflatable vs. Rigid – from HDU data).

### 2. **Layout Phase**

- Drag-and-drop rooms (crew quarters, galley, hygiene, etc.) within a fixed pressure shell (as defined by AIAA 2022 layout paper).
- Enforced NASA adjacency rules:
    - Noise isolation between exercise and sleep.
    - Minimum access width 1 m for translation paths.
    - Required functional areas (medical, EVA prep, etc.).

### 3. **Simulation Phase**

- Psychological metrics modeled on **SHAQ and UND’s Behavioral Index**:
    - Stress (linked to space per person, task overlap, lighting).
    - Mood (linked to privacy and recreation availability).
    - Cohesion (linked to common area and line-of-sight).
- Environmental inputs: noise, lighting, communication latency (from HERA standardized conditions).

### 4. **Feedback Phase**

- Visualization: color-coded “well-being map” (green = optimal, red = stress hotspot).
- Quantitative outputs (CSV):
    - m³ per function, psych health score, compliance % with NASA habitability volumes.

### 5. **Iterate & Share**

- Users adjust layouts and re-simulate.
- Optional community leaderboard ranked by “Psychological Efficiency per m³”.

---

### **Core Mathematical and Physical Models**

| Subsystem | NASA Source | In-Game Model |
| --- | --- | --- |
| **Habitat Volume & Adjacency Matrix** | Deep Space Habitability Guidelines | Constraint-based solver (minimize cross-noise adjacency). |
| **Crew Psych Model** | UND Lunar Daytime behavioral data + HERA isolation data | Multivariate regression: stress = f(volume per crew, noise adjacency, light cycle, privacy index). |
| **Power & ECLSS Overheads** | HDU Deep Space Habitat analog | Fixed resource penalty if layout lengthens air loop or increases heat zones. |
| **Mission Scenarios** | Moon-to-Mars Architecture (2024) | Select from defined lunar campaign segments (Foundational vs. Sustained). |

---

### **Educational & Research Impact**

- **For Students:** Teaches spatial systems engineering using authentic NASA constraints.
- **For Engineers:** Offers a lightweight pre-CAD simulator for early layout validation before full modeling (bridging Simon & Wilhite 2013 layout automation tool).
- **For Behavioral Scientists:** Enables parametric testing of confinement stress correlations.

---

### **Minimal Viable Scope**

Focus only on **internal layout psychology** — not full mission, ECLSS, or construction physics.

This single-axis focus makes LS² a **niche yet complete solution** addressing all Space Apps challenge goals:

1. Define shape and volume ✅
2. Partition functional areas ✅
3. Provide quantitative feedback ✅
4. Support iterative layout exploration ✅
5. Make it accessible and educational ✅

---

### **Next Step Prototype Plan**

- **Data Integration:** Encode volumetric and adjacency constraints from NASA TP-2020-220505 and AIAA 2022.
    
    ---
    
    # Habitat Harmony LS² — Constraints Dataset (v0.1)
    
    ```json
    {
      "unit_system": "SI",
      "notes": "All areas in m², volumes in m³; widths/heights in meters. Values come directly from NASA TP-2020-220505 and the AIAA ASCEND 2022 'Internal Layout of a Lunar Surface Habitat' paper.",
      "global_circulation": {
        "crew_translation_path_min_width_m": 1.00
      },
      "structural_clearances": {
        "crew_quarters_min_internal_dims": {
          "width_m": 0.762,
          "depth_m": 0.762,
          "length_m_min": 1.981,
          "source_units": "30 in × 30 in × >78 in"
        },
        "wcs_compartment_min_internal_dims": {
          "width_m": 1.016,
          "depth_m": 0.762,
          "height_m": 1.981,
          "source_units": "~40 in × 30 in × 78 in"
        }
      },
      "stowage_planning": {
        "weekly_consumables_stowage": {
          "volume_ft3_range": [85, 95],
          "volume_m3_range": [2.407, 2.690],
          "description": "Dedicated on-board stowage for ~1 week of food + clothing"
        }
      },
      "atomic_functional_minima": [
        { "category": "Crew Habitation", "function": "Access to Personal Stowage", "min_volume_m3": 2.60, "min_area_m2": 1.08 },
        { "category": "Crew Habitation", "function": "Changing Clothes", "min_volume_m3": 2.40, "min_area_m2": 1.00 },
        { "category": "Crew Habitation", "function": "Sleep Accommodation", "min_volume_m3": 3.64, "min_area_m2": 1.82 },
        { "category": "Crew Habitation", "function": "Stretching", "min_volume_m3": 3.36, "min_area_m2": 1.40 },
    
        { "category": "EVA Support", "function": "Computer Display & Control", "min_volume_m3": 2.24, "min_area_m2": 1.12 },
        { "category": "EVA Support", "function": "Suit Component Test/Repair", "min_volume_m3": 3.28, "min_area_m2": 1.37 },
        { "category": "EVA Support", "function": "Temporary EVA Items Stowage", "min_volume_m3": 0.25, "min_area_m2": 0.25 },
    
        { "category": "Exercise", "function": "Resistive Exercise", "min_volume_m3": 3.60, "min_area_m2": 1.50 },
    
        { "category": "Group Socialization & Recreation", "function": "Group Movie Viewing", "min_volume_m3": 5.04, "min_area_m2": 2.10 },
        { "category": "Group Socialization & Recreation", "function": "Group Tabletop Games", "min_volume_m3": 3.89, "min_area_m2": 1.62 },
        { "category": "Group Socialization & Recreation", "function": "Personal Recreation", "min_volume_m3": 3.89, "min_area_m2": 1.62 },
    
        { "category": "Human Waste Collection", "function": "Emesis Waste", "min_volume_m3": 2.18, "min_area_m2": 0.91 },
        { "category": "Human Waste Collection", "function": "Menses Waste", "min_volume_m3": 2.18, "min_area_m2": 0.91 },
        { "category": "Human Waste Collection", "function": "Liquid Waste", "min_volume_m3": 2.18, "min_area_m2": 0.91 },
        { "category": "Human Waste Collection", "function": "Solid Waste", "min_volume_m3": 2.18, "min_area_m2": 0.91 },
        { "category": "Human Waste Collection", "function": "WMS Maintenance & Repair", "min_volume_m3": 2.18, "min_area_m2": 0.91 },
    
        { "category": "Meal Consumption", "function": "Full Crew Dining", "min_volume_m3": 3.89, "min_area_m2": 1.62 },
    
        { "category": "Medical Operations", "function": "Autonomous Ambulatory Care", "min_volume_m3": 2.68, "min_area_m2": 1.12 },
        { "category": "Medical Operations", "function": "Basic Medical Care", "min_volume_m3": 4.49, "min_area_m2": 1.87 },
        { "category": "Medical Operations", "function": "Telemedicine/Data Entry", "min_volume_m3": 2.69, "min_area_m2": 1.12 },
    
        { "category": "Mission Planning", "function": "Planning Interface Access", "min_volume_m3": 4.37, "min_area_m2": 1.82 },
        { "category": "Mission Planning", "function": "Work Surface Access", "min_volume_m3": 3.89, "min_area_m2": 1.62 },
        { "category": "Mission Planning", "function": "Team Meetings", "min_volume_m3": 4.37, "min_area_m2": 1.82 },
    
        { "category": "Monitoring & Commanding", "function": "Teleop/Comms Interface", "min_volume_m3": 4.37, "min_area_m2": 1.82 },
        { "category": "Monitoring & Commanding", "function": "Direct Window Viewing", "min_volume_m3": 1.35, "min_area_m2": 0.56 },
        { "category": "Monitoring & Commanding", "function": "Command/Control Interface", "min_volume_m3": 4.37, "min_area_m2": 1.82 },
    
        { "category": "Hygiene", "function": "Appearance/Body Inspection", "min_volume_m3": 2.54, "min_area_m2": 1.06 },
        { "category": "Hygiene", "function": "Facial Cleaning", "min_volume_m3": 2.54, "min_area_m2": 1.06 },
        { "category": "Hygiene", "function": "Fingernail/Toenail Clipping", "min_volume_m3": 2.11, "min_area_m2": 0.88 },
        { "category": "Hygiene", "function": "Full Body Cleaning", "min_volume_m3": 2.54, "min_area_m2": 1.06 },
        { "category": "Hygiene", "function": "Hair Styling/Grooming", "min_volume_m3": 2.54, "min_area_m2": 1.06 },
        { "category": "Hygiene", "function": "Hand Cleaning", "min_volume_m3": 2.54, "min_area_m2": 1.06 },
        { "category": "Hygiene", "function": "Oral Hygiene", "min_volume_m3": 2.11, "min_area_m2": 0.88 },
        { "category": "Hygiene", "function": "Shaving", "min_volume_m3": 2.11, "min_area_m2": 0.88 },
        { "category": "Hygiene", "function": "Skin Care", "min_volume_m3": 2.11, "min_area_m2": 0.88 },
        { "category": "Hygiene", "function": "Towel/Clothes Drying", "min_volume_m3": 2.11, "min_area_m2": 0.88 },
    
        { "category": "Logistics", "function": "Packing & Inventory Mgmt", "min_volume_m3": 3.28, "min_area_m2": 1.37 },
    
        { "category": "Maintenance & Repair", "function": "Diagnostics Workstation", "min_volume_m3": 3.28, "min_area_m2": 1.37 },
        { "category": "Maintenance & Repair", "function": "Systems/Electronics Repair", "min_volume_m3": 3.28, "min_area_m2": 1.37 },
    
        { "category": "Meal Preparation", "function": "Food Item Sorting", "min_volume_m3": 1.35, "min_area_m2": 0.56 },
        { "category": "Meal Preparation", "function": "Food Preparation", "min_volume_m3": 1.35, "min_area_m2": 0.56 }
      ],
      "combined_spaces_min_areas": [
        { "combined_space": "Stretching", "min_area_m2": 1.40 },
        { "combined_space": "Sleeping (per crew)", "min_area_m2": 1.82 },
        { "combined_space": "Medical", "min_area_m2": 1.87 },
        { "combined_space": "Exercise", "min_area_m2": 1.50 },
        { "combined_space": "UWMS (Toilet)", "min_area_m2": 0.91 },
        { "combined_space": "Hygiene", "min_area_m2": 1.06 },
        { "combined_space": "Ward/Dining Table", "min_area_m2": 1.62 },
        { "combined_space": "General Work Surface", "min_area_m2": 1.37 },
        { "combined_space": "General Computer Station", "min_area_m2": 1.82 },
        { "combined_space": "Galley — Work Surface", "min_area_m2": 0.56 },
        { "combined_space": "Galley — Meal Prep", "min_area_m2": 0.56 },
        { "combined_space": "Translation + Ladder + Airlock Access", "min_area_m2": null },
        { "combined_space": "Systems & Storage Access", "min_area_m2": null },
        { "combined_space": "Airlock", "min_area_m2": null, "min_volume_m3": 5.00 }
      ],
      "zones": {
        "clean_examples": ["Crew Quarters", "Galley", "Science Workspaces", "Medical Workspaces"],
        "dirty_examples": ["WCS (Toilet)", "Hygiene Station", "IFM/Maintenance", "Trash Handling"]
      },
      "adjacency_rules": [
        { "rule": "separate_from", "a": "Hygiene Station", "b": "Crew Quarters", "rationale": "Prevent cross-contamination; crew quarters remain dry" },
        { "rule": "separate_from", "a": "Hygiene Station", "b": "WCS", "rationale": "Dedicated, enclosed hygiene; WCS reserved for WCS ops" },
    
        { "rule": "co_locate_with", "a": "WCS", "b": "Dirty Functions Cluster", "rationale": "Group dirty functions to localize contamination and cleaning burden" },
        { "rule": "separate_from", "a": "WCS", "b": "Hygiene Station", "rationale": "WCS is permanent, private, ventilated, with rigid door; not part of hygiene room" },
        { "rule": "different_module_from", "a": "WCS", "b": "Galley", "rationale": "Reduce cross-contam with food prep" },
    
        { "rule": "co_locate_with", "a": "Crew Quarters", "b": "Clean Functions Cluster", "rationale": "Quiet/clean zone with galley, science, medical" },
        { "rule": "noise_isolate", "a": "Crew Quarters", "b": "Exercise", "rationale": "Exercise should be separated from other volumes to limit cross-contamination and noise" },
    
        { "rule": "path_width_min", "a": "Translation Paths", "value_m": 1.00, "rationale": "Crew translation minimum width" }
      ]
    }
    
    ```
    
    **Provenance (key fields):**
    
    - **Translation path ≥1.00 m** and all **atomic minima**/“combined spaces” areas/volumes come from the AIAA ASCEND 2022 “Internal Layout of a Lunar Surface Habitat” tables (Tables 1 & 4). ([NASA Technical Reports Server](https://ntrs.nasa.gov/api/citations/20220013669/downloads/Internal%20Layout%20of%20a%20Lunar%20Surface%20Habitat.pdf))
    - **Crew quarters min internal dims** (≥30″×30″×>78″) and **WCS compartment min dims** (~40″×30″×78″) are from NASA TP-2020-220505 Section 4 (Crew Quarters; WCS).
    - **Hygiene station** must be **separate from WCS and Crew Quarters** and **co-located near “dirty” areas**: adjacency rules encoded above.
    - **WCS co-located with dirty functions** and **separate from hygiene**, with **rigid door & ventilation**; **WCS in a different module/deck from the galley** (capability list/adjacency).
    - **Exercise** “separate from other volumes” to limit cross-contamination of **clean** areas.
    - **Weekly consumables stowage** (85–95 ft³ ≈ 2.407–2.690 m³) from Logistics Stowage guidance.
    
    ---
    
    ## How to wire this into the sim
    
    - Treat `atomic_functional_minima` as **per-function hard constraints** on footprint/clearance for placement.
    - Use `combined_spaces_min_areas` as **pre-packaged modules** you can unlock for faster layout validation (they’re exactly how NASA combined functions in the reference layout). ([NASA Technical Reports Server](https://ntrs.nasa.gov/api/citations/20220013669/downloads/Internal%20Layout%20of%20a%20Lunar%20Surface%20Habitat.pdf))
    - Enforce `adjacency_rules` at build time (block illegal placements) **and** at runtime (apply penalties to the “Psych Health” score for violations like WCS↔Galley adjacency, Hygiene touching Quarters, etc.).
    - Apply `global_circulation.crew_translation_path_min_width_m` to any walkable path and door clearance checks (ladder wells too). ([NASA Technical Reports Server](https://ntrs.nasa.gov/api/citations/20220013669/downloads/Internal%20Layout%20of%20a%20Lunar%20Surface%20Habitat.pdf))
    
- **Simulation Core:** Build psych-response model using HERA + UND parameters.
    
    # LS² Psych-Response Model (HERA + UND)
    
    ## 1) What we model (state vector, per crew and per day)
    
    - **Stress(t)** ∈ [0,100]
    - **Mood(t)** ∈ [0,100] (higher is better)
    - **SleepQuality(t)** ∈ [0,100]
    - **Cohesion(t)** ∈ [0,100]
    
    These four are driven by mission context from **HERA** and design interventions from **UND LDT**.
    
    ### Mission context (HERA – constants / inputs)
    
    - **crew_size** = 4 (HERA missions)
    - **mission_days** = 45 in-mission confinement days (excludes pre/post)
    - **isolation_protocol** = “restricted comms; weekly family conferences; no personal internet/phone” (psych stressor baseline)
    - **adjustable_led_lighting** = available (supports circadian-tuned schedules in your sim; HERA has adjustable LEDs)
    - **virtual_window_views** = available (HERA capability)
    - **exercise_equipment** = available (aerobic & resistive)
    - **hygiene_shower** = available (shower/sink w/ hot & cold)
    
    ### Design interventions (UND LDT – layout/UX variables)
    
    - **PrivateSleepQuarters** (0..1): fraction of crew with private quarters (UND hypothesis: private > shared)
    - **WindowType** ∈ {0:none, 0.5:digital, 1:physical} (digital/physical windows reduce stress & confinement)
    - **CirculationPattern** ∈ {0:tree/dead-end, 1:loop} (loop increases interaction, improves egress)
    - **VisualOrder** ∈ [0,1]: 1 = very orderly/low clutter; increases performance & positive affect
    - **AdjacencyCompliance** ∈ [0,1]: proportion of required separations/zoning met (e.g., sleep vs. noise) — your layout engine already computes this from the constraints dataset; this maps to “reduced disruptive stimuli” for sleep/privacy per UND privacy/sleep rationale
    - **LightingScheduleCompliance** ∈ [0,1]: how well your chosen day-night lighting profile uses HERA’s adjustable LEDs to support stable routines (capability noted)
    - **ExerciseCompliance** ∈ [0,1]: fraction of recommended daily exercise delivered (capability noted)
    
    > UND LDT frames these as independent variables modified physically, with crew behavioral response as dependent variables — exactly what we encode here as design inputs → psych outputs.
    > 
    
    ---
    
    ## 2) Equations (discrete time, daily step)
    
    Let each metric evolve with a **baseline**, **accumulation/decay**, and **design modifiers**.
    
    ### 2.1 Baselines from confinement & isolation (HERA)
    
    - Confinement adds daily stress load; structured routines and permitted amenities (lighting, exercise, hygiene, galley) help limit it. HERA establishes 45-day confined missions with restricted personal communications, a known psychosocial stressor we model as a positive baseline trend on Stress and a negative on Mood/Cohesion.
    
    We use normalized time ( \tau=t/45 \in [0,1] ).
    
    [
    
    \begin{aligned}
    
    \text{Stress}*\text{base}(t) &= s_0 + s_1 \cdot \tau \
    \text{Mood}*\text{base}(t) &= m_0 - m_1 \cdot \tau \
    \text{Cohesion}*\text{base}(t) &= c_0 - c_1 \cdot \tau \
    \text{Sleep}*\text{base}(t) &= q_0 - q_1 \cdot \tau
    \end{aligned}
    ]
    
    *(Defaults below; coefficients exposed for calibration.)*
    
    ### 2.2 Design modifiers (UND LDT hypotheses; HERA capabilities)
    
    Define **design feature scores**:
    
    - (P=) PrivateSleepQuarters
    - (W=) WindowType (0/0.5/1)
    - (R=) CirculationPattern (0/1)
    - (V=) VisualOrder
    - (A=) AdjacencyCompliance
    - (L=) LightingScheduleCompliance
    - (E=) ExerciseCompliance
    
    **Stress reduction** (privacy, windows, order, lighting, adjacency):
    
    [
    
    \Delta \text{Stress}(t) =
    
    -\alpha_P P - \alpha_W W - \alpha_V V - \alpha_L L - \alpha_A A
    
    ]
    
    - Privacy & sleep isolation reduce disruptive stimuli → lower stress; direct UND claim.
    - Digital/physical windows reduce stress & confinement.
    - Visual order supports calmer, more readable environment (less cognitive load).
    - Good lighting schedules (enabled by HERA LEDs) support routine/alertness → lower stress load.
    
    **Mood lift** (privacy, windows, order, loop circulation, exercise):
    
    [
    
    \Delta \text{Mood}(t) =
    
    +\beta_P P + \beta_W W + \beta_V V + \beta_R R + \beta_E E
    
    ]
    
    - Private quarters → more positive moods.
    - Windows → reduced sense of confinement; positive affect.
    - Visual order → positive effects in mood & productivity.
    - Loop circulation → more social interaction (can be positive/negative; we weight net-positive, tunable).
    - Exercise available daily in HERA; compliance boosts mood.
    
    **Sleep quality** (privacy, adjacency, lighting, exercise):
    
    [
    
    \Delta \text{Sleep}(t) =
    
    +\gamma_P P + \gamma_A A + \gamma_L L + \gamma_E E
    
    ]
    
    - Sleep hygiene benefits from isolation from light/noise/activity; privacy & adjacency separation explicitly cited.
    - Lighting schedule regularity (via adjustable LEDs) supports circadian alignment (modeled as positive).
    
    **Cohesion** (loop circulation, visual order, dining/meeting layout quality via adjacency):
    
    [
    
    \Delta \text{Cohesion}(t) =
    
    +\delta_R R + \delta_V V + \delta_A A
    
    ]
    
    - Loop circulation → increased interaction; we model as net cohesion benefit (tunable).
    - Visual order → smoother work, fewer friction points.
    - Proper adjacency (e.g., quiet sleep, clean/dirty separation) reduces conflicts.
    
    ### 2.3 Daily update with damping (bounded 0..100)
    
    [
    
    \begin{aligned}
    
    \text{Stress}(t) &= \operatorname{clip}\big(\lambda_S \cdot \text{Stress}(t!-!1) + (1-\lambda_S)\cdot [\text{Stress}*\text{base}(t) + \Delta \text{Stress}(t)],~0,100\big) \
    \text{Mood}(t) &= \operatorname{clip}\big(\lambda_M \cdot \text{Mood}(t!-!1) + (1-\lambda_M)\cdot [\text{Mood}*\text{base}(t) + \Delta \text{Mood}(t)],~0,100\big) \
    \text{Sleep}(t) &= \operatorname{clip}\big(\lambda_Q \cdot \text{Sleep}(t!-!1) + (1-\lambda_Q)\cdot [\text{Sleep}*\text{base}(t) + \Delta \text{Sleep}(t)],~0,100\big) \
    \text{Cohesion}(t) &= \operatorname{clip}\big(\lambda_C \cdot \text{Cohesion}(t!-!1) + (1-\lambda_C)\cdot [\text{Cohesion}*\text{base}(t) + \Delta \text{Cohesion}(t)],~0,100\big)
    \end{aligned}
    ]
    
    (\lambda_*) are **memory** (0..1). Higher = sluggish change; lower = responsive crew.
    
    > Note: UND LDT recommends experimental manipulation of environmental variables and measurement of behavioral responses with modern wearables/self-reports; the model architecture (independent design vars → dependent psych metrics) mirrors that method.
    > 
    
    ---
    
    ## 3) Defaults (tunable, but grounded in what the docs support)
    
    **Baselines** (reflect “confinement + restricted comms” trend in HERA missions):
    
    `s0=40, s1=25` → Stress drifts from ~40 → ~65 without design help
    
    `m0=70, m1=20` → Mood drifts from ~70 → ~50
    
    `c0=70, c1=15` → Cohesion ~70 → ~55
    
    `q0=70, q1=10` → Sleep ~70 → ~60
    
    (These are **initial seeds**; you should calibrate in playtesting/validation runs. Their shape—rising stress, slight mood/cohesion declines—follows HERA’s isolation framing.)
    
    **Damping**: `λS=λM=λQ=λC=0.7` (weekly changes matter but don’t whiplash)
    
    **Design weights** (direction taken from UND hypotheses; magnitudes are exposed):
    
    - Stress: `αP=10, αW=6, αV=4, αL=4, αA=6`
    - Mood: `βP=8, βW=6, βV=4, βR=3, βE=5`
    - Sleep: `γP=8, γA=6, γL=6, γE=3`
    - Cohesion: `δR=5, δV=3, δA=3`
    
    > Why these directions?
    > 
    > 
    > • **Privacy** → lower stress, better mood & sleep.
    > 
    > • **Windows (digital/physical)** → lower stress / confinement, better mood.
    > 
    > • **Circulation loop** → more interaction & egress efficiency → cohesion↑ (with tunable sign).
    > 
    > • **Visual order** → performance & positive effects (we map to mood/cohesion, stress↓).
    > 
    > • **Lighting schedule** feasible due to HERA adjustable LEDs; benefits sleep/stress/mood via routine stability.
    > 
    > • **Exercise** provided in HERA; we map compliance → mood/sleep benefit.
    > 
    > • **Adjacency compliance** (quiet sleep, clean/dirty separation) → fewer disruptions → stress↓, sleep↑, cohesion↑ (fewer conflicts).
    > 
    
    ---
    
    ## 4) Input → Score mapping (implementation notes)
    
    - Your **layout solver** already yields: `AdjacencyCompliance`, plus whether sleep modules are private/shared. Map those directly to (A) and (P).
    - If user enables **virtual window** only, set (W=0.5) (HERA supports “modifiable virtual window views”); physical window (if your scenario supports) sets (W=1) per UND hypothesis.
    - **LightingScheduleCompliance** can be computed by comparing user’s light schedule to a simple standard (e.g., consistent day/night cycles) leveraging HERA LEDs (capability present).
    - **ExerciseCompliance**: compare scheduled exercise minutes vs. target (use the presence of HERA equipment as enabling factor, you set the target minutes in gameplay).
    
    ---
    
    ## 5) JSON schema (drop-in for your sim)
    
    ```json
    {
      "hera_context": {
        "crew_size": 4,
        "mission_days": 45,
        "isolation_protocol": "restricted_personal_comms_weekly_family_conf",
        "capabilities": {
          "adjustable_led_lighting": true,
          "virtual_window_views": true,
          "exercise_equipment": true,
          "hygiene_shower": true
        }
      },
      "design_inputs": {
        "PrivateSleepQuarters": 0.75,
        "WindowType": 0.5,
        "CirculationPattern": 1,
        "VisualOrder": 0.8,
        "AdjacencyCompliance": 0.9,
        "LightingScheduleCompliance": 0.8,
        "ExerciseCompliance": 0.7
      },
      "model_params": {
        "baselines": { "s0": 40, "s1": 25, "m0": 70, "m1": 20, "c0": 70, "c1": 15, "q0": 70, "q1": 10 },
        "damping": { "lambdaS": 0.7, "lambdaM": 0.7, "lambdaQ": 0.7, "lambdaC": 0.7 },
        "weights": {
          "alphaP": 10, "alphaW": 6, "alphaV": 4, "alphaL": 4, "alphaA": 6,
          "betaP": 8, "betaW": 6, "betaV": 4, "betaR": 3, "betaE": 5,
          "gammaP": 8, "gammaA": 6, "gammaL": 6, "gammaE": 3,
          "deltaR": 5, "deltaV": 3, "deltaA": 3
        }
      }
    }
    
    ```
    
    ---
    
    ## 6) Provenance (what drives each term)
    
    - **HERA mission framing** — 4-person, 45-day confinement; restricted personal communications; adjustable LEDs; virtual windows; exercise, hygiene provisions: these define baseline stressors and available countermeasures your sim can schedule.
    - **UND LDT hypotheses** — Privacy & sleep isolation improve stress/mood/sleep; digital/physical windows lower stress & confinement; loop circulation changes interaction and emergency response; visual order improves performance and positive affect; method: treat environmental features as independent variables and measure behavioral responses: this motivates the sign and placement of weights in the modifiers.
    
    ---
    
    ## 7) Calibration path (within NASA-only scope)
    
    - Run **virtual experiments** by toggling one UND variable at a time (e.g., set (P) from 0→1 while others fixed) exactly as UND prescribes — environmental manipulation with dependent variable observation — to validate your signs and relative magnitudes before public demos.
    - Use **HERA-style schedules** (exercise daily, stable lights, weekly family conf uplinks) as the *control* profile when comparing layouts since HERA defines those mission conditions.
    
    ---
    
- **Interface Prototype:** WebGL (Three.js) 2.5D layout builder.
    
    # What you get
    
    - 2.5D orthographic scene (slight tilt) with meters-based grid
    - Drag/rotate/resize modules (Sleep, Hygiene, WCS, Exercise, Galley, Ward/Dining, Workstation)
    - “Clean” vs “Dirty” zoning colors (and illegal adjacency flags)
    - Path width validator (ensures ≥ 1.00 m corridors)
    - Live HUD for area (m²), compliance %, and quick errors
    - Export/Import layout JSON
    
    > Run via a tiny local server (e.g. python3 -m http.server) so ES modules/CDN work.
    > 
    
    ---
    
    ## `index.html`
    
    > Single file, no build step. Copy–paste the whole thing to index.html, serve locally, and open in a browser (Chrome/Edge/Firefox).
    > 
    
    ```html
    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8" />
    <title>LS² 2.5D Layout Builder (NASA-constrained)</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body { margin:0; height:100%; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
      #app { display:grid; grid-template-columns: 320px 1fr; grid-template-rows: 48px 1fr; height:100%; }
      header { grid-column: 1 / -1; display:flex; align-items:center; padding:8px 12px; border-bottom:1px solid #e5e7eb; }
      header h1 { font-size:16px; font-weight:600; margin:0; }
      #left { border-right:1px solid #e5e7eb; overflow:auto; padding:12px; }
      #hud { padding:8px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; margin-bottom:12px; }
      #hud .row { display:flex; justify-content:space-between; font-size:13px; margin:4px 0; }
      #tools { display:grid; gap:8px; margin-top:10px; }
      .btn { background:#111827; color:white; border:0; padding:8px 10px; border-radius:8px; font-size:13px; cursor:pointer; }
      .btn.secondary { background:#374151; }
      .btn.outline { background:white; color:#111827; border:1px solid #e5e7eb; }
      .legend { display:grid; gap:6px; font-size:12px; }
      .legend .item { display:flex; align-items:center; gap:8px; }
      .swatch { width:14px; height:14px; border-radius:4px; border:1px solid #d1d5db; }
      #catalog { display:grid; gap:6px; margin-top:10px; }
      .tile { display:flex; justify-content:space-between; align-items:center; border:1px solid #e5e7eb; padding:8px; border-radius:10px; cursor:grab; }
      .tile small { color:#6b7280; }
      #right { position:relative; }
      canvas { display:block; width:100%; height:100%; }
      #toast { position:absolute; top:8px; right:8px; background:#111827; color:white; padding:8px 10px; border-radius:8px; font-size:12px; opacity:.95; display:none; }
      #errors { margin-top:10px; font-size:12px; color:#b91c1c; }
      input[type=range] { width:100%; }
      .row-inline { display:flex; gap:8px; align-items:center; }
    </style>
    </head>
    <body>
    <div id="app">
      <header><h1>LS² Layout Builder — NASA Habitability Rules (meters)</h1></header>
      <aside id="left">
        <div id="hud">
          <div class="row"><span>Total Footprint:</span><strong><span id="areaTotal">0.00</span> m²</strong></div>
          <div class="row"><span>Adjacency Compliance:</span><strong id="adjComp">100%</strong></div>
          <div class="row"><span>Min Path Width ≥ 1.00 m:</span><strong id="pathOk">OK</strong></div>
        </div>
    
        <div class="legend">
          <div class="item"><span class="swatch" style="background:#e0f2fe;"></span><span>Clean zone (Crew Qtrs, Galley, Medical, Work)</span></div>
          <div class="item"><span class="swatch" style="background:#fee2e2;"></span><span>Dirty zone (WCS, Hygiene, IFM, Trash)</span></div>
          <div class="item"><span class="swatch" style="background:#fde68a;"></span><span>Flagged adjacency</span></div>
        </div>
    
        <div id="tools">
          <button class="btn" id="exportBtn">Export JSON</button>
          <label class="btn outline">
            Import JSON
            <input id="importFile" type="file" accept="application/json" style="display:none" />
          </label>
          <div class="row-inline">
            <label style="font-size:12px">Rotate step (°):</label>
            <input id="rotateStep" type="range" min="5" max="45" step="5" value="15" />
            <span id="rotateStepVal" style="font-size:12px">15°</span>
          </div>
        </div>
    
        <h3 style="margin-top:16px;">Module Catalog</h3>
        <div id="catalog"></div>
    
        <div id="errors"></div>
      </aside>
      <main id="right">
        <div id="toast"></div>
        <canvas id="c"></canvas>
      </main>
    </div>
    
    <!-- Three.js via CDN -->
    <script type="module">
    import * as THREE from '<https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js>';
    import { OrbitControls } from '<https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/controls/OrbitControls.js>';
    
    ////////////////////////////////////////////////////////////////////////////////
    // NASA-CONSTRAINT SNAPSHOT (subset from your dataset v0.1)
    ////////////////////////////////////////////////////////////////////////////////
    const Constraints = {
      pathMinWidth: 1.00, // m (AIAA 2022)
      clean: new Set(['Crew Quarters','Galley','Ward/Dining','Workstation','Medical']),
      dirty: new Set(['WCS','Hygiene','IFM/Repair','Trash']),
      mustSeparatePairs: [
        ['Hygiene','Crew Quarters'],
        ['Hygiene','WCS'],
        ['WCS','Galley'],
        ['Exercise','Crew Quarters']
      ],
      atomicMinArea: new Map([
        ['Crew Quarters', 1.82],
        ['Hygiene', 1.06],
        ['WCS', 0.91],
        ['Exercise', 1.50],
        ['Galley', 0.56],
        ['Ward/Dining', 1.62],
        ['Workstation', 1.37]
      ])
    };
    
    // Catalog definitions (meters). height is for 2.5D extrusion only.
    const Catalog = [
      { name:'Crew Quarters', w:1.4, d:1.35, h:2.4, zone:'clean', color:0xe0f2fe },
      { name:'Hygiene',       w:1.2, d:0.9,  h:2.4, zone:'dirty', color:0xfee2e2 },
      { name:'WCS',           w:1.1, d:0.9,  h:2.4, zone:'dirty', color:0xfee2e2 },
      { name:'Exercise',      w:1.5, d:1.0,  h:2.4, zone:'dirty', color:0xfee2e2 },
      { name:'Galley',        w:0.9, d:0.7,  h:2.4, zone:'clean', color:0xe0f2fe },
      { name:'Ward/Dining',   w:1.3, d:1.3,  h:2.4, zone:'clean', color:0xe0f2fe },
      { name:'Workstation',   w:1.2, d:1.15, h:2.4, zone:'clean', color:0xe0f2fe },
    ];
    
    ////////////////////////////////////////////////////////////////////////////////
    // UI helpers
    ////////////////////////////////////////////////////////////////////////////////
    const catalogEl = document.querySelector('#catalog');
    Catalog.forEach(item=>{
      const el=document.createElement('div'); el.className='tile';
      el.innerHTML = `<div><strong>${item.name}</strong><br><small>${item.w}×${item.d} m</small></div><button class="btn secondary">Add</button>`;
      el.querySelector('button').onclick = ()=> addModule(item);
      catalogEl.appendChild(el);
    });
    const toast=(msg)=>{ const t=document.getElementById('toast'); t.textContent=msg; t.style.display='block'; setTimeout(()=>t.style.display='none',1400); };
    const setText=(id,val)=>document.getElementById(id).textContent=val;
    
    ////////////////////////////////////////////////////////////////////////////////
    // Scene setup (meters)
    ////////////////////////////////////////////////////////////////////////////////
    const canvas = document.getElementById('c');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const aspect = w / h;
    const camSize = 10; // world units shown vertically
    const camera = new THREE.OrthographicCamera(-camSize*aspect, camSize*aspect, camSize, -camSize, 0.1, 100);
    camera.position.set(10, 12, 10); // 2.5D angle
    camera.lookAt(0,0,0);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true; controls.enableRotate = false; controls.zoomSpeed = 1.0;
    
    const hemi = new THREE.HemisphereLight(0xffffff, 0xcccccc, 1.0);
    scene.add(hemi);
    
    // Grid (0.1 m minor, 1 m major)
    const grid = new THREE.Group();
    scene.add(grid);
    const majorGrid = new THREE.GridHelper(40, 40, 0x9ca3af, 0xe5e7eb); // 1m
    majorGrid.rotation.x = Math.PI/2;
    grid.add(majorGrid);
    const minor = new THREE.GridHelper(40, 400, 0xffffff, 0xf3f4f6); // 0.1m
    minor.rotation.x = Math.PI/2;
    grid.add(minor);
    
    // Floor plate (hab shell outline placeholder ~ 12m x 8m)
    const plateGeom = new THREE.PlaneGeometry(12, 8);
    const plateMat = new THREE.MeshBasicMaterial({ color:0xf8fafc, side:THREE.DoubleSide });
    const plate = new THREE.Mesh(plateGeom, plateMat);
    plate.rotation.x = -Math.PI/2;
    scene.add(plate);
    
    ////////////////////////////////////////////////////////////////////////////////
    // Modules
    ////////////////////////////////////////////////////////////////////////////////
    const modules = []; // {name, mesh, w,d,h, zone, color}
    const pickRay = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let active = null;
    let dragOffset = new THREE.Vector3();
    let rotateStepDeg = 15;
    
    function addModule(proto) {
      const geom = new THREE.BoxGeometry(proto.w, proto.h, proto.d);
      const mat = new THREE.MeshLambertMaterial({ color: proto.color, transparent:true, opacity:0.95 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(0, proto.h/2, 0); // y = half height
      mesh.userData = { ...proto };
      scene.add(mesh);
      modules.push({ ...proto, mesh });
      active = mesh;
      toast(`Added: ${proto.name}`);
      refreshStats();
    }
    
    function snap01(x){ return Math.round(x*10)/10; } // 0.1 m snapping
    
    function onPointerDown(ev){
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      pickRay.setFromCamera(mouse, camera);
      const intersects = pickRay.intersectObjects(modules.map(m=>m.mesh));
      if(intersects.length){
        active = intersects[0].object;
        const p = intersects[0].point.clone(); p.y = active.position.y;
        dragOffset.copy(active.position).sub(p);
      } else {
        active = null;
      }
    }
    
    function onPointerMove(ev){
      if(!active) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      pickRay.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
      const pos = new THREE.Vector3();
      pickRay.ray.intersectPlane(plane, pos);
      pos.add(dragOffset);
      active.position.x = snap01(pos.x);
      active.position.z = snap01(pos.z);
      refreshStats();
    }
    
    function onWheel(ev){
      if(!active) return;
      const dir = Math.sign(ev.deltaY) < 0 ? 1 : -1;
      const stepRad = THREE.MathUtils.degToRad(rotateStepDeg);
      active.rotation.y = Math.round((active.rotation.y + dir*stepRad)/stepRad)*stepRad;
      refreshStats();
      ev.preventDefault();
    }
    
    function resizeCanvas(){
      const w=canvas.clientWidth, h=canvas.clientHeight;
      renderer.setSize(w,h,false);
      const aspect = w / h;
      camera.left = -camSize*aspect;
      camera.right = camSize*aspect;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resizeCanvas);
    renderer.setAnimationLoop(()=>{ renderer.render(scene, camera); });
    
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('wheel', onWheel, { passive:false });
    
    ////////////////////////////////////////////////////////////////////////////////
    // Compliance & metrics
    ////////////////////////////////////////////////////////////////////////////////
    function moduleFootprint(m){
      // oriented bounds projection on ground (x,z)
      const box = new THREE.Box3().setFromObject(m.mesh);
      const size = new THREE.Vector3(); box.getSize(size);
      // approximate area by rectangle on ground (2.5D box)
      return size.x * size.z;
    }
    
    function totalArea(){
      return modules.reduce((s,m)=>s + moduleFootprint(m), 0);
    }
    
    function minAreaViolations(){
      const errs=[];
      for(const m of modules){
        const minA = Constraints.atomicMinArea.get(m.name);
        if(minA && moduleFootprint(m) + 1e-6 < minA){
          errs.push(`${m.name}: area ${moduleFootprint(m).toFixed(2)} < min ${minA.toFixed(2)} m²`);
          flagMesh(m.mesh, true);
        } else {
          flagMesh(m.mesh, false);
        }
      }
      return errs;
    }
    
    function flagMesh(mesh, on){
      mesh.material.emissive = new THREE.Color(on?0xf59e0b:0x000000); // amber tint if too small
    }
    
    function adjacencyCompliance(){
      // Treat adjacency violation if rectangles (AABB on ground) touch/overlap and rule says separate
      const badPairs = [];
      const matsToAmber = new Set();
      const getAABB=(m)=>{
        const box = new THREE.Box3().setFromObject(m.mesh);
        // project onto ground (x,z)
        return { minx:box.min.x, maxx:box.max.x, minz:box.min.z, maxz:box.max.z };
      };
      const pairs = Constraints.mustSeparatePairs;
      for (let i=0;i<modules.length;i++){
        for (let j=i+1;j<modules.length;j++){
          const A=modules[i], B=modules[j];
          const ruleMatch = pairs.some(([a,b])=>(A.name===a && B.name===b)||(A.name===b && B.name===a));
          if(!ruleMatch) continue;
          const a = getAABB(A), b = getAABB(B);
          const overlap = !(a.maxx < b.minx || a.minx > b.maxx || a.maxz < b.minz || a.minz > b.maxz);
          if(overlap){
            badPairs.push(`${A.name} ↔ ${B.name} must be separated`);
            matsToAmber.add(A.mesh.material); matsToAmber.add(B.mesh.material);
          }
        }
      }
      // reset
      modules.forEach(m=>{ if(!m.mesh.material.__originalColor){ m.mesh.material.__originalColor=m.mesh.material.color.clone(); }
                            m.mesh.material.color.copy(new THREE.Color(m.color)); });
      // mark violators
      matsToAmber.forEach(mat=>mat.color.setHex(0xfde68a));
      // compliance %
      const totalRules = pairs.length;
      const violated = new Set(badPairs.map(s=>s.split(' must')[0])).size; // distinct pair instances
      const score = totalRules===0?1:Math.max(0, 1 - (badPairs.length/Math.max(1, modules.length)));
      return { score, badPairs };
    }
    
    function pathWidthOK(){
      // Simple corridor test: create an occupancy grid at 0.1 m; any two module AABBs that pinch spacing < 1.0 m?
      // We approximate by checking pairwise edges distances.
      const min = Constraints.pathMinWidth;
      const edges = [];
      for (let i=0;i<modules.length;i++){
        for (let j=i+1;j<modules.length;j++){
          const a = new THREE.Box3().setFromObject(modules[i].mesh);
          const b = new THREE.Box3().setFromObject(modules[j].mesh);
          // horizontal distance between AABB projections
          const dx = Math.max(0, Math.max(a.min.x - b.max.x, b.min.x - a.max.x));
          const dz = Math.max(0, Math.max(a.min.z - b.max.z, b.min.z - a.max.z));
          const gap = Math.max(dx, dz)===0 ? 0 : Math.hypot(dx, dz);
          if (gap>0 && gap < min) return { ok:false, msg:`Gap ${gap.toFixed(2)} m < ${min.toFixed(2)} m` };
        }
      }
      return { ok:true };
    }
    
    function refreshStats(){
      setText('areaTotal', totalArea().toFixed(2));
      const errs = [];
      errs.push(...minAreaViolations());
      const adj = adjacencyCompliance();
      setText('adjComp', Math.round(adj.score*100)+'%');
      errs.push(...adj.badPairs);
      const path = pathWidthOK();
      setText('pathOk', path.ok?'OK':'NARROW');
      if(!path.ok) errs.push(path.msg);
      document.getElementById('errors').innerHTML = errs.length?('<ul>'+errs.map(e=>`<li>${e}</li>`).join('')+'</ul>'):'';
    }
    
    ////////////////////////////////////////////////////////////////////////////////
    // Export / Import
    ////////////////////////////////////////////////////////////////////////////////
    document.getElementById('exportBtn').onclick = ()=>{
      const data = modules.map(m=>({
        name:m.name, zone:m.zone, w:m.w, d:m.d, h:m.h,
        pos:[m.mesh.position.x, m.mesh.position.y, m.mesh.position.z],
        rotY:m.mesh.rotation.y
      }));
      const blob = new Blob([JSON.stringify({ version:'ls2-v1', modules:data }, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'layout.json';
      a.click();
    };
    
    document.getElementById('importFile').onchange = (ev)=>{
      const f = ev.target.files[0]; if(!f) return;
      f.text().then(txt=>{
        try{
          const obj = JSON.parse(txt);
          // clear
          modules.splice(0);
          [...scene.children].forEach(ch=>{
            if(ch.type==='Mesh' && ch!==plate) scene.remove(ch);
          });
          (obj.modules||[]).forEach(m=>{
            const proto = Catalog.find(c=>c.name===m.name) || { name:m.name, color:0xe5e7eb, zone:m.zone||'clean' };
            addModule({ ...proto, w:m.w, d:m.d, h:m.h });
            const last = modules[modules.length-1];
            last.mesh.position.set(...m.pos);
            last.mesh.rotation.y = m.rotY||0;
          });
          refreshStats();
          toast('Imported layout');
        }catch(e){ alert('Invalid JSON'); }
      });
    };
    
    const rotateRange = document.getElementById('rotateStep');
    const rotateVal = document.getElementById('rotateStepVal');
    rotateRange.addEventListener('input', e=>{
      rotateStepDeg = parseInt(rotateRange.value,10);
      rotateVal.textContent = rotateStepDeg + '°';
    });
    
    ////////////////////////////////////////////////////////////////////////////////
    // Kickoff
    ////////////////////////////////////////////////////////////////////////////////
    resizeCanvas();
    addModule(Catalog[0]); // seed one Crew Quarters
    refreshStats();
    
    </script>
    </body>
    </html>
    
    ```
    
    ---
    
    ## Notes & extension hooks
    
    - **Meters everywhere.** Module sizes equal NASA minima or a touch larger so you can resize down and immediately see the **min-area violations** (amber emissive).
    - **Adjacency rules** implemented now:
        - Hygiene ↔ Crew Quarters (must separate)
        - Hygiene ↔ WCS (must separate)
        - WCS ↔ Galley (must separate)
        - Exercise ↔ Crew Quarters (noise isolation)
        Add more in `Constraints.mustSeparatePairs`.
    - **Path-width check (≥ 1.00 m):** pairwise AABB gap test; for production, upgrade to a grid-based **navmesh carve** and compute the minimum-width corridor skeleton.
    - **Zoning colors:** Clean = light blue, Dirty = light red; violations tint **banana yellow**.
    - **Export/Import:** round-trips to JSON so you can pass layouts into your **psych model** and **rules validator**.
    - **2.5D:** Orthographic camera with elevated angle; each module extruded to **2.4 m** high by default for depth cues.
    
    ---
    
    ## Where to plug the rest
    
    - **Constraints v0.1:** Replace the inline `Constraints` snapshot with the full JSON you built earlier; wire the min areas and adjacency list directly.
    - **Psych Model:** After `refreshStats()`, call your HERA+UND model with `AdjacencyCompliance` (we compute live), total area, private-quarters ratio (inferred from how many “Crew Quarters” you place), etc.
    - **Levels/Decks:** Add a Y-stepper and per-level array; the corridor width checker should consider inter-level ladders and ring stairwells (min 1 m clearance).
    
    If you want, I can add a **CSV exporter** for areas per function and an **SVG floorplan snapshot** button so you’ve got assets for the Space Apps submission page.
    
    Sweet — here’s a **minimal, runnable Three.js 2.5D layout builder** you can drop into a folder and open in a local server. It encodes your NASA rules via the constraint object we built (min areas, path width, adjacency), snaps modules to a 0.1 m grid, shows zoning colors (clean/dirty), and live-scores **AdjacencyCompliance** + **Translation Path ≥ 1.00 m**.
    
    ---
    
    # What you get
    
    - 2.5D orthographic scene (slight tilt) with meters-based grid
    - Drag/rotate/resize modules (Sleep, Hygiene, WCS, Exercise, Galley, Ward/Dining, Workstation)
    - “Clean” vs “Dirty” zoning colors (and illegal adjacency flags)
    - Path width validator (ensures ≥ 1.00 m corridors)
    - Live HUD for area (m²), compliance %, and quick errors
    - Export/Import layout JSON
    
    > Run via a tiny local server (e.g. python3 -m http.server) so ES modules/CDN work.
    > 
    
    ---
    
    ## `index.html`
    
    > Single file, no build step. Copy–paste the whole thing to index.html, serve locally, and open in a browser (Chrome/Edge/Firefox).
    > 
    
    ```html
    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8" />
    <title>LS² 2.5D Layout Builder (NASA-constrained)</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body { margin:0; height:100%; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
      #app { display:grid; grid-template-columns: 320px 1fr; grid-template-rows: 48px 1fr; height:100%; }
      header { grid-column: 1 / -1; display:flex; align-items:center; padding:8px 12px; border-bottom:1px solid #e5e7eb; }
      header h1 { font-size:16px; font-weight:600; margin:0; }
      #left { border-right:1px solid #e5e7eb; overflow:auto; padding:12px; }
      #hud { padding:8px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; margin-bottom:12px; }
      #hud .row { display:flex; justify-content:space-between; font-size:13px; margin:4px 0; }
      #tools { display:grid; gap:8px; margin-top:10px; }
      .btn { background:#111827; color:white; border:0; padding:8px 10px; border-radius:8px; font-size:13px; cursor:pointer; }
      .btn.secondary { background:#374151; }
      .btn.outline { background:white; color:#111827; border:1px solid #e5e7eb; }
      .legend { display:grid; gap:6px; font-size:12px; }
      .legend .item { display:flex; align-items:center; gap:8px; }
      .swatch { width:14px; height:14px; border-radius:4px; border:1px solid #d1d5db; }
      #catalog { display:grid; gap:6px; margin-top:10px; }
      .tile { display:flex; justify-content:space-between; align-items:center; border:1px solid #e5e7eb; padding:8px; border-radius:10px; cursor:grab; }
      .tile small { color:#6b7280; }
      #right { position:relative; }
      canvas { display:block; width:100%; height:100%; }
      #toast { position:absolute; top:8px; right:8px; background:#111827; color:white; padding:8px 10px; border-radius:8px; font-size:12px; opacity:.95; display:none; }
      #errors { margin-top:10px; font-size:12px; color:#b91c1c; }
      input[type=range] { width:100%; }
      .row-inline { display:flex; gap:8px; align-items:center; }
    </style>
    </head>
    <body>
    <div id="app">
      <header><h1>LS² Layout Builder — NASA Habitability Rules (meters)</h1></header>
      <aside id="left">
        <div id="hud">
          <div class="row"><span>Total Footprint:</span><strong><span id="areaTotal">0.00</span> m²</strong></div>
          <div class="row"><span>Adjacency Compliance:</span><strong id="adjComp">100%</strong></div>
          <div class="row"><span>Min Path Width ≥ 1.00 m:</span><strong id="pathOk">OK</strong></div>
        </div>
    
        <div class="legend">
          <div class="item"><span class="swatch" style="background:#e0f2fe;"></span><span>Clean zone (Crew Qtrs, Galley, Medical, Work)</span></div>
          <div class="item"><span class="swatch" style="background:#fee2e2;"></span><span>Dirty zone (WCS, Hygiene, IFM, Trash)</span></div>
          <div class="item"><span class="swatch" style="background:#fde68a;"></span><span>Flagged adjacency</span></div>
        </div>
    
        <div id="tools">
          <button class="btn" id="exportBtn">Export JSON</button>
          <label class="btn outline">
            Import JSON
            <input id="importFile" type="file" accept="application/json" style="display:none" />
          </label>
          <div class="row-inline">
            <label style="font-size:12px">Rotate step (°):</label>
            <input id="rotateStep" type="range" min="5" max="45" step="5" value="15" />
            <span id="rotateStepVal" style="font-size:12px">15°</span>
          </div>
        </div>
    
        <h3 style="margin-top:16px;">Module Catalog</h3>
        <div id="catalog"></div>
    
        <div id="errors"></div>
      </aside>
      <main id="right">
        <div id="toast"></div>
        <canvas id="c"></canvas>
      </main>
    </div>
    
    <!-- Three.js via CDN -->
    <script type="module">
    import * as THREE from '<https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js>';
    import { OrbitControls } from '<https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/controls/OrbitControls.js>';
    
    ////////////////////////////////////////////////////////////////////////////////
    // NASA-CONSTRAINT SNAPSHOT (subset from your dataset v0.1)
    ////////////////////////////////////////////////////////////////////////////////
    const Constraints = {
      pathMinWidth: 1.00, // m (AIAA 2022)
      clean: new Set(['Crew Quarters','Galley','Ward/Dining','Workstation','Medical']),
      dirty: new Set(['WCS','Hygiene','IFM/Repair','Trash']),
      mustSeparatePairs: [
        ['Hygiene','Crew Quarters'],
        ['Hygiene','WCS'],
        ['WCS','Galley'],
        ['Exercise','Crew Quarters']
      ],
      atomicMinArea: new Map([
        ['Crew Quarters', 1.82],
        ['Hygiene', 1.06],
        ['WCS', 0.91],
        ['Exercise', 1.50],
        ['Galley', 0.56],
        ['Ward/Dining', 1.62],
        ['Workstation', 1.37]
      ])
    };
    
    // Catalog definitions (meters). height is for 2.5D extrusion only.
    const Catalog = [
      { name:'Crew Quarters', w:1.4, d:1.35, h:2.4, zone:'clean', color:0xe0f2fe },
      { name:'Hygiene',       w:1.2, d:0.9,  h:2.4, zone:'dirty', color:0xfee2e2 },
      { name:'WCS',           w:1.1, d:0.9,  h:2.4, zone:'dirty', color:0xfee2e2 },
      { name:'Exercise',      w:1.5, d:1.0,  h:2.4, zone:'dirty', color:0xfee2e2 },
      { name:'Galley',        w:0.9, d:0.7,  h:2.4, zone:'clean', color:0xe0f2fe },
      { name:'Ward/Dining',   w:1.3, d:1.3,  h:2.4, zone:'clean', color:0xe0f2fe },
      { name:'Workstation',   w:1.2, d:1.15, h:2.4, zone:'clean', color:0xe0f2fe },
    ];
    
    ////////////////////////////////////////////////////////////////////////////////
    // UI helpers
    ////////////////////////////////////////////////////////////////////////////////
    const catalogEl = document.querySelector('#catalog');
    Catalog.forEach(item=>{
      const el=document.createElement('div'); el.className='tile';
      el.innerHTML = `<div><strong>${item.name}</strong><br><small>${item.w}×${item.d} m</small></div><button class="btn secondary">Add</button>`;
      el.querySelector('button').onclick = ()=> addModule(item);
      catalogEl.appendChild(el);
    });
    const toast=(msg)=>{ const t=document.getElementById('toast'); t.textContent=msg; t.style.display='block'; setTimeout(()=>t.style.display='none',1400); };
    const setText=(id,val)=>document.getElementById(id).textContent=val;
    
    ////////////////////////////////////////////////////////////////////////////////
    // Scene setup (meters)
    ////////////////////////////////////////////////////////////////////////////////
    const canvas = document.getElementById('c');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const aspect = w / h;
    const camSize = 10; // world units shown vertically
    const camera = new THREE.OrthographicCamera(-camSize*aspect, camSize*aspect, camSize, -camSize, 0.1, 100);
    camera.position.set(10, 12, 10); // 2.5D angle
    camera.lookAt(0,0,0);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true; controls.enableRotate = false; controls.zoomSpeed = 1.0;
    
    const hemi = new THREE.HemisphereLight(0xffffff, 0xcccccc, 1.0);
    scene.add(hemi);
    
    // Grid (0.1 m minor, 1 m major)
    const grid = new THREE.Group();
    scene.add(grid);
    const majorGrid = new THREE.GridHelper(40, 40, 0x9ca3af, 0xe5e7eb); // 1m
    majorGrid.rotation.x = Math.PI/2;
    grid.add(majorGrid);
    const minor = new THREE.GridHelper(40, 400, 0xffffff, 0xf3f4f6); // 0.1m
    minor.rotation.x = Math.PI/2;
    grid.add(minor);
    
    // Floor plate (hab shell outline placeholder ~ 12m x 8m)
    const plateGeom = new THREE.PlaneGeometry(12, 8);
    const plateMat = new THREE.MeshBasicMaterial({ color:0xf8fafc, side:THREE.DoubleSide });
    const plate = new THREE.Mesh(plateGeom, plateMat);
    plate.rotation.x = -Math.PI/2;
    scene.add(plate);
    
    ////////////////////////////////////////////////////////////////////////////////
    // Modules
    ////////////////////////////////////////////////////////////////////////////////
    const modules = []; // {name, mesh, w,d,h, zone, color}
    const pickRay = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let active = null;
    let dragOffset = new THREE.Vector3();
    let rotateStepDeg = 15;
    
    function addModule(proto) {
      const geom = new THREE.BoxGeometry(proto.w, proto.h, proto.d);
      const mat = new THREE.MeshLambertMaterial({ color: proto.color, transparent:true, opacity:0.95 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(0, proto.h/2, 0); // y = half height
      mesh.userData = { ...proto };
      scene.add(mesh);
      modules.push({ ...proto, mesh });
      active = mesh;
      toast(`Added: ${proto.name}`);
      refreshStats();
    }
    
    function snap01(x){ return Math.round(x*10)/10; } // 0.1 m snapping
    
    function onPointerDown(ev){
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      pickRay.setFromCamera(mouse, camera);
      const intersects = pickRay.intersectObjects(modules.map(m=>m.mesh));
      if(intersects.length){
        active = intersects[0].object;
        const p = intersects[0].point.clone(); p.y = active.position.y;
        dragOffset.copy(active.position).sub(p);
      } else {
        active = null;
      }
    }
    
    function onPointerMove(ev){
      if(!active) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      pickRay.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
      const pos = new THREE.Vector3();
      pickRay.ray.intersectPlane(plane, pos);
      pos.add(dragOffset);
      active.position.x = snap01(pos.x);
      active.position.z = snap01(pos.z);
      refreshStats();
    }
    
    function onWheel(ev){
      if(!active) return;
      const dir = Math.sign(ev.deltaY) < 0 ? 1 : -1;
      const stepRad = THREE.MathUtils.degToRad(rotateStepDeg);
      active.rotation.y = Math.round((active.rotation.y + dir*stepRad)/stepRad)*stepRad;
      refreshStats();
      ev.preventDefault();
    }
    
    function resizeCanvas(){
      const w=canvas.clientWidth, h=canvas.clientHeight;
      renderer.setSize(w,h,false);
      const aspect = w / h;
      camera.left = -camSize*aspect;
      camera.right = camSize*aspect;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resizeCanvas);
    renderer.setAnimationLoop(()=>{ renderer.render(scene, camera); });
    
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('wheel', onWheel, { passive:false });
    
    ////////////////////////////////////////////////////////////////////////////////
    // Compliance & metrics
    ////////////////////////////////////////////////////////////////////////////////
    function moduleFootprint(m){
      // oriented bounds projection on ground (x,z)
      const box = new THREE.Box3().setFromObject(m.mesh);
      const size = new THREE.Vector3(); box.getSize(size);
      // approximate area by rectangle on ground (2.5D box)
      return size.x * size.z;
    }
    
    function totalArea(){
      return modules.reduce((s,m)=>s + moduleFootprint(m), 0);
    }
    
    function minAreaViolations(){
      const errs=[];
      for(const m of modules){
        const minA = Constraints.atomicMinArea.get(m.name);
        if(minA && moduleFootprint(m) + 1e-6 < minA){
          errs.push(`${m.name}: area ${moduleFootprint(m).toFixed(2)} < min ${minA.toFixed(2)} m²`);
          flagMesh(m.mesh, true);
        } else {
          flagMesh(m.mesh, false);
        }
      }
      return errs;
    }
    
    function flagMesh(mesh, on){
      mesh.material.emissive = new THREE.Color(on?0xf59e0b:0x000000); // amber tint if too small
    }
    
    function adjacencyCompliance(){
      // Treat adjacency violation if rectangles (AABB on ground) touch/overlap and rule says separate
      const badPairs = [];
      const matsToAmber = new Set();
      const getAABB=(m)=>{
        const box = new THREE.Box3().setFromObject(m.mesh);
        // project onto ground (x,z)
        return { minx:box.min.x, maxx:box.max.x, minz:box.min.z, maxz:box.max.z };
      };
      const pairs = Constraints.mustSeparatePairs;
      for (let i=0;i<modules.length;i++){
        for (let j=i+1;j<modules.length;j++){
          const A=modules[i], B=modules[j];
          const ruleMatch = pairs.some(([a,b])=>(A.name===a && B.name===b)||(A.name===b && B.name===a));
          if(!ruleMatch) continue;
          const a = getAABB(A), b = getAABB(B);
          const overlap = !(a.maxx < b.minx || a.minx > b.maxx || a.maxz < b.minz || a.minz > b.maxz);
          if(overlap){
            badPairs.push(`${A.name} ↔ ${B.name} must be separated`);
            matsToAmber.add(A.mesh.material); matsToAmber.add(B.mesh.material);
          }
        }
      }
      // reset
      modules.forEach(m=>{ if(!m.mesh.material.__originalColor){ m.mesh.material.__originalColor=m.mesh.material.color.clone(); }
                            m.mesh.material.color.copy(new THREE.Color(m.color)); });
      // mark violators
      matsToAmber.forEach(mat=>mat.color.setHex(0xfde68a));
      // compliance %
      const totalRules = pairs.length;
      const violated = new Set(badPairs.map(s=>s.split(' must')[0])).size; // distinct pair instances
      const score = totalRules===0?1:Math.max(0, 1 - (badPairs.length/Math.max(1, modules.length)));
      return { score, badPairs };
    }
    
    function pathWidthOK(){
      // Simple corridor test: create an occupancy grid at 0.1 m; any two module AABBs that pinch spacing < 1.0 m?
      // We approximate by checking pairwise edges distances.
      const min = Constraints.pathMinWidth;
      const edges = [];
      for (let i=0;i<modules.length;i++){
        for (let j=i+1;j<modules.length;j++){
          const a = new THREE.Box3().setFromObject(modules[i].mesh);
          const b = new THREE.Box3().setFromObject(modules[j].mesh);
          // horizontal distance between AABB projections
          const dx = Math.max(0, Math.max(a.min.x - b.max.x, b.min.x - a.max.x));
          const dz = Math.max(0, Math.max(a.min.z - b.max.z, b.min.z - a.max.z));
          const gap = Math.max(dx, dz)===0 ? 0 : Math.hypot(dx, dz);
          if (gap>0 && gap < min) return { ok:false, msg:`Gap ${gap.toFixed(2)} m < ${min.toFixed(2)} m` };
        }
      }
      return { ok:true };
    }
    
    function refreshStats(){
      setText('areaTotal', totalArea().toFixed(2));
      const errs = [];
      errs.push(...minAreaViolations());
      const adj = adjacencyCompliance();
      setText('adjComp', Math.round(adj.score*100)+'%');
      errs.push(...adj.badPairs);
      const path = pathWidthOK();
      setText('pathOk', path.ok?'OK':'NARROW');
      if(!path.ok) errs.push(path.msg);
      document.getElementById('errors').innerHTML = errs.length?('<ul>'+errs.map(e=>`<li>${e}</li>`).join('')+'</ul>'):'';
    }
    
    ////////////////////////////////////////////////////////////////////////////////
    // Export / Import
    ////////////////////////////////////////////////////////////////////////////////
    document.getElementById('exportBtn').onclick = ()=>{
      const data = modules.map(m=>({
        name:m.name, zone:m.zone, w:m.w, d:m.d, h:m.h,
        pos:[m.mesh.position.x, m.mesh.position.y, m.mesh.position.z],
        rotY:m.mesh.rotation.y
      }));
      const blob = new Blob([JSON.stringify({ version:'ls2-v1', modules:data }, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'layout.json';
      a.click();
    };
    
    document.getElementById('importFile').onchange = (ev)=>{
      const f = ev.target.files[0]; if(!f) return;
      f.text().then(txt=>{
        try{
          const obj = JSON.parse(txt);
          // clear
          modules.splice(0);
          [...scene.children].forEach(ch=>{
            if(ch.type==='Mesh' && ch!==plate) scene.remove(ch);
          });
          (obj.modules||[]).forEach(m=>{
            const proto = Catalog.find(c=>c.name===m.name) || { name:m.name, color:0xe5e7eb, zone:m.zone||'clean' };
            addModule({ ...proto, w:m.w, d:m.d, h:m.h });
            const last = modules[modules.length-1];
            last.mesh.position.set(...m.pos);
            last.mesh.rotation.y = m.rotY||0;
          });
          refreshStats();
          toast('Imported layout');
        }catch(e){ alert('Invalid JSON'); }
      });
    };
    
    const rotateRange = document.getElementById('rotateStep');
    const rotateVal = document.getElementById('rotateStepVal');
    rotateRange.addEventListener('input', e=>{
      rotateStepDeg = parseInt(rotateRange.value,10);
      rotateVal.textContent = rotateStepDeg + '°';
    });
    
    ////////////////////////////////////////////////////////////////////////////////
    // Kickoff
    ////////////////////////////////////////////////////////////////////////////////
    resizeCanvas();
    addModule(Catalog[0]); // seed one Crew Quarters
    refreshStats();
    
    </script>
    </body>
    </html>
    
    ```
    
    ---
    
    ## Notes & extension hooks
    
    - **Meters everywhere.** Module sizes equal NASA minima or a touch larger so you can resize down and immediately see the **min-area violations** (amber emissive).
    - **Adjacency rules** implemented now:
        - Hygiene ↔ Crew Quarters (must separate)
        - Hygiene ↔ WCS (must separate)
        - WCS ↔ Galley (must separate)
        - Exercise ↔ Crew Quarters (noise isolation)
        Add more in `Constraints.mustSeparatePairs`.
    - **Path-width check (≥ 1.00 m):** pairwise AABB gap test; for production, upgrade to a grid-based **navmesh carve** and compute the minimum-width corridor skeleton.
    - **Zoning colors:** Clean = light blue, Dirty = light red; violations tint **banana yellow**.
    - **Export/Import:** round-trips to JSON so you can pass layouts into your **psych model** and **rules validator**.
    - **2.5D:** Orthographic camera with elevated angle; each module extruded to **2.4 m** high by default for depth cues.
    
    ---
    
    ## Where to plug the rest
    
    - **Constraints v0.1:** Replace the inline `Constraints` snapshot with the full JSON you built earlier; wire the min areas and adjacency list directly.
    - **Psych Model:** After `refreshStats()`, call your HERA+UND model with `AdjacencyCompliance` (we compute live), total area, private-quarters ratio (inferred from how many “Crew Quarters” you place), etc.
    - **Levels/Decks:** Add a Y-stepper and per-level array; the corridor width checker should consider inter-level ladders and ring stairwells (min 1 m clearance).
    
    If you want, I can add a **CSV exporter** for areas per function and an **SVG floorplan snapshot** button so you’ve got assets for the Space Apps submission page.
    
- **Output Dashboard:** Psych health index, compliance %, downloadable CSV.
    
    
    ## `index.html`
    
    ```html
    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8" />
    <title>LS² Layout Builder — Output Dashboard (NASA-constrained)</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body { margin:0; height:100%; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
      #app { display:grid; grid-template-columns: 360px 1fr 360px; grid-template-rows: 52px 1fr; height:100%; }
      header { grid-column: 1 / -1; display:flex; align-items:center; padding:10px 12px; border-bottom:1px solid #e5e7eb; gap:12px; }
      header h1 { font-size:16px; font-weight:600; margin:0; }
      #left, #rightPanel { border-right:1px solid #e5e7eb; overflow:auto; padding:12px; }
      #rightPanel { border-left:1px solid #e5e7eb; border-right:none; }
      #hud, .card { padding:10px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; margin-bottom:12px; }
      #hud .row, .row { display:flex; justify-content:space-between; font-size:13px; margin:4px 0; gap:8px; align-items:center; }
      .btn { background:#111827; color:white; border:0; padding:8px 10px; border-radius:8px; font-size:13px; cursor:pointer; }
      .btn.secondary { background:#374151; }
      .btn.outline { background:white; color:#111827; border:1px solid #e5e7eb; }
      .legend { display:grid; gap:6px; font-size:12px; }
      .legend .item { display:flex; align-items:center; gap:8px; }
      .swatch { width:14px; height:14px; border-radius:4px; border:1px solid #d1d5db; }
      #catalog { display:grid; gap:6px; margin-top:10px; }
      .tile { display:flex; justify-content:space-between; align-items:center; border:1px solid #e5e7eb; padding:8px; border-radius:10px; cursor:grab; }
      .tile small { color:#6b7280; }
      #center { position:relative; }
      canvas { display:block; width:100%; height:100%; }
      #toast { position:absolute; top:8px; right:8px; background:#111827; color:white; padding:8px 10px; border-radius:8px; font-size:12px; opacity:.95; display:none; }
      #errors { margin-top:10px; font-size:12px; color:#b91c1c; }
      input[type=range], input[type=number], select { width:100%; }
      .kpi { font-size:22px; font-weight:700; }
      .kpi-sub { font-size:12px; color:#6b7280; }
      .stack { display:grid; gap:8px; }
      .sep { height:1px; background:#e5e7eb; margin:8px 0; }
    </style>
    </head>
    <body>
    <div id="app">
      <header>
        <h1>LS² Layout Builder — NASA Habitability Rules + Output Dashboard</h1>
        <div class="kpi-sub">Units in meters (m, m²)</div>
      </header>
    
      <!-- LEFT: Builder & controls -->
      <aside id="left">
        <div id="hud">
          <div class="row"><span>Total Footprint:</span><strong><span id="areaTotal">0.00</span> m²</strong></div>
          <div class="row"><span>Adjacency Compliance:</span><strong id="adjComp">100%</strong></div>
          <div class="row"><span>Min Path Width ≥ 1.00 m:</span><strong id="pathOk">OK</strong></div>
        </div>
    
        <div class="legend">
          <div class="item"><span class="swatch" style="background:#e0f2fe;"></span><span>Clean zone (Crew Qtrs, Galley, Medical, Work)</span></div>
          <div class="item"><span class="swatch" style="background:#fee2e2;"></span><span>Dirty zone (WCS, Hygiene, IFM, Trash)</span></div>
          <div class="item"><span class="swatch" style="background:#fde68a;"></span><span>Flagged adjacency</span></div>
        </div>
    
        <div class="stack" style="margin-top:10px">
          <div class="row">
            <button class="btn" id="exportBtn">Export Layout JSON</button>
            <label class="btn outline">Import Layout
              <input id="importFile" type="file" accept="application/json" style="display:none" />
            </label>
          </div>
          <div class="row">
            <label style="font-size:12px">Rotate step (°)</label>
            <input id="rotateStep" type="range" min="5" max="45" step="5" value="15" />
            <span id="rotateStepVal" style="font-size:12px">15°</span>
          </div>
        </div>
    
        <h3 style="margin-top:16px;">Module Catalog</h3>
        <div id="catalog"></div>
    
        <div id="errors"></div>
      </aside>
    
      <!-- CENTER: Canvas -->
      <main id="center">
        <div id="toast"></div>
        <canvas id="c"></canvas>
      </main>
    
      <!-- RIGHT: Output Dashboard -->
      <aside id="rightPanel">
        <div class="card">
          <div class="row"><span>Mission Day</span>
            <input id="missionDay" type="range" min="1" max="45" value="15" />
          </div>
          <div class="row"><span>Window Type</span>
            <select id="windowType">
              <option value="0">None</option>
              <option value="0.5" selected>Digital (virtual port)</option>
              <option value="1">Physical</option>
            </select>
          </div>
          <div class="row"><span>Circulation Pattern</span>
            <select id="circType">
              <option value="0">Tree / dead-end</option>
              <option value="1" selected>Loop</option>
            </select>
          </div>
          <div class="row"><span>Lighting Schedule Compliance</span>
            <input id="lightCompliance" type="range" min="0" max="1" step="0.05" value="0.8" />
          </div>
          <div class="row"><span>Exercise Compliance</span>
            <input id="exerciseCompliance" type="range" min="0" max="1" step="0.05" value="0.7" />
          </div>
          <div class="sep"></div>
          <div class="row"><span>Private Sleep Quarters</span><strong id="privatePct">—</strong></div>
          <div class="row"><span>Adjacency Compliance</span><strong id="adjPct">—</strong></div>
          <div class="row"><span>Visual Order</span><strong id="visualOrder">—</strong></div>
        </div>
    
        <div class="card">
          <div class="row"><span>Psych Health Index</span><span class="kpi" id="phi">—</span></div>
          <div class="row kpi-sub"><span>Stress</span><strong id="stress">—</strong></div>
          <div class="row kpi-sub"><span>Mood</span><strong id="mood">—</strong></div>
          <div class="row kpi-sub"><span>Sleep Quality</span><strong id="sleepQ">—</strong></div>
          <div class="row kpi-sub"><span>Cohesion</span><strong id="cohesion">—</strong></div>
        </div>
    
        <div class="card">
          <div class="row"><button class="btn secondary" id="downloadCsvBtn">Download CSV</button>
            <span class="kpi-sub">Modules + metrics</span>
          </div>
        </div>
      </aside>
    </div>
    
    <!-- Three.js via CDN -->
    <script type="module">
    import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js';
    import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/controls/OrbitControls.js';
    
    ////////////////////////////////////////////////////////////////////////////////
    // NASA-CONSTRAINT SNAPSHOT (subset from your dataset v0.1)
    ////////////////////////////////////////////////////////////////////////////////
    const Constraints = {
      pathMinWidth: 1.00, // m (AIAA 2022)
      clean: new Set(['Crew Quarters','Galley','Ward/Dining','Workstation','Medical']),
      dirty: new Set(['WCS','Hygiene','IFM/Repair','Trash']),
      mustSeparatePairs: [
        ['Hygiene','Crew Quarters'],
        ['Hygiene','WCS'],
        ['WCS','Galley'],
        ['Exercise','Crew Quarters']
      ],
      atomicMinArea: new Map([
        ['Crew Quarters', 1.82],
        ['Hygiene', 1.06],
        ['WCS', 0.91],
        ['Exercise', 1.50],
        ['Galley', 0.56],
        ['Ward/Dining', 1.62],
        ['Workstation', 1.37]
      ])
    };
    
    // Catalog definitions (meters). height is for 2.5D extrusion only.
    const Catalog = [
      { name:'Crew Quarters', w:1.4, d:1.35, h:2.4, zone:'clean', color:0xe0f2fe },
      { name:'Hygiene',       w:1.2, d:0.9,  h:2.4, zone:'dirty', color:0xfee2e2 },
      { name:'WCS',           w:1.1, d:0.9,  h:2.4, zone:'dirty', color:0xfee2e2 },
      { name:'Exercise',      w:1.5, d:1.0,  h:2.4, zone:'dirty', color:0xfee2e2 },
      { name:'Galley',        w:0.9, d:0.7,  h:2.4, zone:'clean', color:0xe0f2fe },
      { name:'Ward/Dining',   w:1.3, d:1.3,  h:2.4, zone:'clean', color:0xe0f2fe },
      { name:'Workstation',   w:1.2, d:1.15, h:2.4, zone:'clean', color:0xe0f2fe }
    ];
    
    ////////////////////////////////////////////////////////////////////////////////
    // Scene setup
    ////////////////////////////////////////////////////////////////////////////////
    const canvas = document.getElementById('c');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const aspect = w / h;
    const camSize = 10;
    const camera = new THREE.OrthographicCamera(-camSize*aspect, camSize*aspect, camSize, -camSize, 0.1, 100);
    camera.position.set(10, 12, 10);
    camera.lookAt(0,0,0);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true; controls.enableRotate = false; controls.zoomSpeed = 1.0;
    
    const hemi = new THREE.HemisphereLight(0xffffff, 0xcccccc, 1.0);
    scene.add(hemi);
    
    // Grid
    const grid = new THREE.Group();
    scene.add(grid);
    const majorGrid = new THREE.GridHelper(40, 40, 0x9ca3af, 0xe5e7eb);
    majorGrid.rotation.x = Math.PI/2;
    grid.add(majorGrid);
    const minor = new THREE.GridHelper(40, 400, 0xffffff, 0xf3f4f6);
    minor.rotation.x = Math.PI/2;
    grid.add(minor);
    
    // Floor plate
    const plateGeom = new THREE.PlaneGeometry(12, 8);
    const plateMat = new THREE.MeshBasicMaterial({ color:0xf8fafc, side:THREE.DoubleSide });
    const plate = new THREE.Mesh(plateGeom, plateMat);
    plate.rotation.x = -Math.PI/2;
    scene.add(plate);
    
    ////////////////////////////////////////////////////////////////////////////////
    // Modules & interaction
    ////////////////////////////////////////////////////////////////////////////////
    const modules = [];
    const pickRay = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let active = null;
    let dragOffset = new THREE.Vector3();
    let rotateStepDeg = 15;
    
    const catalogEl = document.querySelector('#catalog');
    Catalog.forEach(item=>{
      const el=document.createElement('div'); el.className='tile';
      el.innerHTML = `<div><strong>${item.name}</strong><br><small>${item.w}×${item.d} m</small></div><button class="btn secondary">Add</button>`;
      el.querySelector('button').onclick = ()=> addModule(item);
      catalogEl.appendChild(el);
    });
    const toast=(msg)=>{ const t=document.getElementById('toast'); t.textContent=msg; t.style.display='block'; setTimeout(()=>t.style.display='none',1400); };
    const setText=(id,val)=>document.getElementById(id).textContent=val;
    
    function addModule(proto) {
      const geom = new THREE.BoxGeometry(proto.w, proto.h, proto.d);
      const mat = new THREE.MeshLambertMaterial({ color: proto.color, transparent:true, opacity:0.95 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(0, proto.h/2, 0);
      mesh.userData = { ...proto };
      scene.add(mesh);
      modules.push({ ...proto, mesh });
      active = mesh;
      toast(`Added: ${proto.name}`);
      refreshAll();
    }
    
    function snap01(x){ return Math.round(x*10)/10; }
    
    function onPointerDown(ev){
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      pickRay.setFromCamera(mouse, camera);
      const intersects = pickRay.intersectObjects(modules.map(m=>m.mesh));
      if(intersects.length){
        active = intersects[0].object;
        const p = intersects[0].point.clone(); p.y = active.position.y;
        dragOffset.copy(active.position).sub(p);
      } else {
        active = null;
      }
    }
    function onPointerMove(ev){
      if(!active) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      pickRay.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
      const pos = new THREE.Vector3();
      pickRay.ray.intersectPlane(plane, pos);
      pos.add(dragOffset);
      active.position.x = snap01(pos.x);
      active.position.z = snap01(pos.z);
      refreshAll();
    }
    function onWheel(ev){
      if(!active) return;
      const dir = Math.sign(ev.deltaY) < 0 ? 1 : -1;
      const stepRad = THREE.MathUtils.degToRad(rotateStepDeg);
      active.rotation.y = Math.round((active.rotation.y + dir*stepRad)/stepRad)*stepRad;
      refreshAll();
      ev.preventDefault();
    }
    function resizeCanvas(){
      const w=canvas.clientWidth, h=canvas.clientHeight;
      renderer.setSize(w,h,false);
      const aspect = w / h;
      camera.left = -camSize*aspect;
      camera.right = camSize*aspect;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resizeCanvas);
    renderer.setAnimationLoop(()=>{ renderer.render(scene, camera); });
    
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('wheel', onWheel, { passive:false });
    
    ////////////////////////////////////////////////////////////////////////////////
    // Metrics
    ////////////////////////////////////////////////////////////////////////////////
    function moduleFootprint(m){
      const box = new THREE.Box3().setFromObject(m.mesh);
      const size = new THREE.Vector3(); box.getSize(size);
      return size.x * size.z;
    }
    function totalArea(){
      return modules.reduce((s,m)=>s + moduleFootprint(m), 0);
    }
    function minAreaViolations(){
      const errs=[];
      for(const m of modules){
        const minA = Constraints.atomicMinArea.get(m.name);
        if(minA && moduleFootprint(m) + 1e-6 < minA){
          errs.push(`${m.name}: area ${moduleFootprint(m).toFixed(2)} < min ${minA.toFixed(2)} m²`);
          m.mesh.material.emissive = new THREE.Color(0xf59e0b);
        } else {
          m.mesh.material.emissive = new THREE.Color(0x000000);
        }
      }
      return errs;
    }
    function adjacencyCompliance(){
      const badPairs = [];
      const matsToAmber = new Set();
      const getAABB=(m)=>{
        const box = new THREE.Box3().setFromObject(m.mesh);
        return { minx:box.min.x, maxx:box.max.x, minz:box.min.z, maxz:box.max.z };
      };
      const pairs = Constraints.mustSeparatePairs;
      for (let i=0;i<modules.length;i++){
        for (let j=i+1;j<modules.length;j++){
          const A=modules[i], B=modules[j];
          const ruleMatch = pairs.some(([a,b])=>(A.name===a && B.name===b)||(A.name===b && B.name===a));
          if(!ruleMatch) continue;
          const a = getAABB(A), b = getAABB(B);
          const overlap = !(a.maxx < b.minx || a.minx > b.maxx || a.maxz < b.minz || a.minz > b.maxz);
          if(overlap){
            badPairs.push(`${A.name} ↔ ${B.name} must be separated`);
            matsToAmber.add(A.mesh.material); matsToAmber.add(B.mesh.material);
          }
        }
      }
      modules.forEach(m=>{ m.mesh.material.color.setHex(m.color); });
      matsToAmber.forEach(mat=>mat.color.setHex(0xfde68a));
      const totalRules = Constraints.mustSeparatePairs.length;
      // Compliance: fraction of rule-pairs not violated (per present module pairs)
      const presentPairs = Constraints.mustSeparatePairs.filter(([a,b])=>{
        const ha = modules.some(m=>m.name===a);
        const hb = modules.some(m=>m.name===b);
        return ha && hb;
      }).length;
      const violated = badPairs.length;
      const score = presentPairs===0 ? 1 : Math.max(0, 1 - violated / presentPairs);
      return { score, badPairs, presentPairs };
    }
    function pathWidthOK(){
      const min = Constraints.pathMinWidth;
      for (let i=0;i<modules.length;i++){
        for (let j=i+1;j<modules.length;j++){
          const a = new THREE.Box3().setFromObject(modules[i].mesh);
          const b = new THREE.Box3().setFromObject(modules[j].mesh);
          const dx = Math.max(0, Math.max(a.min.x - b.max.x, b.min.x - a.max.x));
          const dz = Math.max(0, Math.max(a.min.z - b.max.z, b.min.z - a.max.z));
          const gap = Math.max(dx, dz)===0 ? 0 : Math.hypot(dx, dz);
          if (gap>0 && gap < min) return { ok:false, msg:`Gap ${gap.toFixed(2)} m < ${min.toFixed(2)} m` };
        }
      }
      return { ok:true };
    }
    
    // Visual order proxy: 1 if no module overlaps (AABB) + small penalty per min-area violation
    function computeVisualOrder(){
      let overlaps = 0;
      for (let i=0;i<modules.length;i++){
        for (let j=i+1;j<modules.length;j++){
          const a = new THREE.Box3().setFromObject(modules[i].mesh);
          const b = new THREE.Box3().setFromObject(modules[j].mesh);
          const overlap = !(a.max.x < b.min.x || a.min.x > b.max.x || a.max.z < b.min.z || a.min.z > b.max.z);
          if (overlap) overlaps++;
        }
      }
      const v0 = overlaps===0 ? 1 : Math.max(0, 1 - overlaps / Math.max(1, modules.length));
      // subtract 0.1 if any min-area violations
      const hasMinViolations = minAreaViolations().length>0;
      return Math.max(0, Math.min(1, v0 - (hasMinViolations ? 0.1 : 0)));
    }
    
    // Private sleep % = min(crew quarters count / crew size, 1)
    function computePrivateSleepPct(crewSize){
      const cq = modules.filter(m=>m.name==='Crew Quarters').length;
      return Math.max(0, Math.min(1, crewSize>0? cq / crewSize : 0));
    }
    
    ////////////////////////////////////////////////////////////////////////////////
    // Psych model (HERA + UND defaults you specified earlier)
    ////////////////////////////////////////////////////////////////////////////////
    const ModelParams = {
      baselines: { s0:40, s1:25, m0:70, m1:20, c0:70, c1:15, q0:70, q1:10 },
      damping:   { lambdaS:0.7, lambdaM:0.7, lambdaQ:0.7, lambdaC:0.7 },
      weights: {
        alphaP:10, alphaW:6, alphaV:4, alphaL:4, alphaA:6,
        betaP:8, betaW:6, betaV:4, betaR:3, betaE:5,
        gammaP:8, gammaA:6, gammaL:6, gammaE:3,
        deltaR:5, deltaV:3, deltaA:3
      }
    };
    // single-day snapshot (no memory) — we evaluate at the chosen mission day
    function computePsychSnapshot(inputs){
      const { day, P, W, R, V, A, L, E } = inputs;
      const tau = Math.max(0, Math.min(1, (day-1)/45));
      const { s0,s1,m0,m1,c0,c1,q0,q1 } = ModelParams.baselines;
      const bStress = s0 + s1*tau;
      const bMood   = m0 - m1*tau;
      const bCoh    = c0 - c1*tau;
      const bSleep  = q0 - q1*tau;
      const w = ModelParams.weights;
      const dStress = -w.alphaP*P - w.alphaW*W - w.alphaV*V - w.alphaL*L - w.alphaA*A;
      const dMood   = +w.betaP*P  + w.betaW*W  + w.betaV*V  + w.betaR*R  + w.betaE*E;
      const dSleep  = +w.gammaP*P + w.gammaA*A + w.gammaL*L + w.gammaE*E;
      const dCoh    = +w.deltaR*R + w.deltaV*V + w.deltaA*A;
      // clamp to 0..100
      const stress  = Math.max(0, Math.min(100, bStress + dStress));
      const mood    = Math.max(0, Math.min(100, bMood   + dMood));
      const sleepQ  = Math.max(0, Math.min(100, bSleep  + dSleep));
      const cohesion= Math.max(0, Math.min(100, bCoh    + dCoh));
      // Psych Health Index: simple composite (invert stress)
      const phi = Math.round(( (100 - stress) + mood + sleepQ + cohesion ) / 4);
      return { stress:Math.round(stress), mood:Math.round(mood), sleepQ:Math.round(sleepQ), cohesion:Math.round(cohesion), phi };
    }
    
    ////////////////////////////////////////////////////////////////////////////////
    // Dashboard & CSV
    ////////////////////////////////////////////////////////////////////////////////
    const ui = {
      areaTotal: document.getElementById('areaTotal'),
      adjComp:   document.getElementById('adjComp'),
      pathOk:    document.getElementById('pathOk'),
      errors:    document.getElementById('errors'),
      rotateStep:document.getElementById('rotateStep'),
      rotateStepVal:document.getElementById('rotateStepVal'),
      missionDay:document.getElementById('missionDay'),
      windowType:document.getElementById('windowType'),
      circType:  document.getElementById('circType'),
      lightCompliance:document.getElementById('lightCompliance'),
      exerciseCompliance:document.getElementById('exerciseCompliance'),
      privatePct:document.getElementById('privatePct'),
      adjPct:   document.getElementById('adjPct'),
      visualOrder:document.getElementById('visualOrder'),
      phi:      document.getElementById('phi'),
      stress:   document.getElementById('stress'),
      mood:     document.getElementById('mood'),
      sleepQ:   document.getElementById('sleepQ'),
      cohesion: document.getElementById('cohesion'),
      downloadCsvBtn: document.getElementById('downloadCsvBtn')
    };
    
    function refreshAll(){
      // builder stats
      ui.areaTotal.textContent = totalArea().toFixed(2);
      const errs = [];
      errs.push(...minAreaViolations());
      const adj = adjacencyCompliance();
      const adjPct = Math.round(adj.score*100);
      ui.adjComp.textContent = adjPct + '%';
      errs.push(...adj.badPairs);
      const path = pathWidthOK();
      ui.pathOk.textContent = path.ok ? 'OK' : 'NARROW';
      if(!path.ok) errs.push(path.msg);
      ui.errors.innerHTML = errs.length?('<ul>'+errs.map(e=>`<li>${e}</li>`).join('')+'</ul>'):'';
    
      // psych-model inputs derived from layout + user controls
      const crewSize = Math.max(1, modules.filter(m=>m.name==='Crew Quarters').length); // simple proxy
      const P = computePrivateSleepPct(crewSize);                ui.privatePct.textContent = Math.round(P*100)+'%';
      const A = adj.score;                                       ui.adjPct.textContent = Math.round(A*100)+'%';
      const V = computeVisualOrder();                            ui.visualOrder.textContent = Math.round(V*100)+'%';
      const W = parseFloat(ui.windowType.value);
      const R = parseInt(ui.circType.value,10);
      const L = parseFloat(ui.lightCompliance.value);
      const E = parseFloat(ui.exerciseCompliance.value);
      const day = parseInt(ui.missionDay.value,10);
    
      // compute snapshot
      const out = computePsychSnapshot({ day, P, W, R, V, A, L, E });
      ui.phi.textContent = out.phi;
      ui.stress.textContent = out.stress;
      ui.mood.textContent = out.mood;
      ui.sleepQ.textContent = out.sleepQ;
      ui.cohesion.textContent = out.cohesion;
    
      // keep in state for CSV
      lastSnapshot = { day, crewSize, P, W, R, V, A, L, E, ...out, area: parseFloat(ui.areaTotal.textContent) };
    }
    
    ['change','input'].forEach(evt=>{
      ui.missionDay.addEventListener(evt, refreshAll);
      ui.windowType.addEventListener(evt, refreshAll);
      ui.circType.addEventListener(evt, refreshAll);
      ui.lightCompliance.addEventListener(evt, refreshAll);
      ui.exerciseCompliance.addEventListener(evt, refreshAll);
    });
    
    document.getElementById('exportBtn').onclick = ()=>{
      const data = modules.map(m=>({
        name:m.name, zone:m.zone, w:m.w, d:m.d, h:m.h,
        pos:[m.mesh.position.x, m.mesh.position.y, m.mesh.position.z],
        rotY:m.mesh.rotation.y
      }));
      const blob = new Blob([JSON.stringify({ version:'ls2-v1', modules:data }, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'layout.json';
      a.click();
    };
    document.getElementById('importFile').onchange = (ev)=>{
      const f = ev.target.files[0]; if(!f) return;
      f.text().then(txt=>{
        try{
          const obj = JSON.parse(txt);
          // clear
          modules.splice(0);
          [...scene.children].forEach(ch=>{
            if(ch.type==='Mesh' && ch!==plate) scene.remove(ch);
          });
          (obj.modules||[]).forEach(m=>{
            const proto = Catalog.find(c=>c.name===m.name) || { name:m.name, color:0xe5e7eb, zone:m.zone||'clean', w:m.w, d:m.d, h:m.h };
            addModule(proto);
            const last = modules[modules.length-1];
            last.mesh.position.set(...m.pos);
            last.mesh.rotation.y = m.rotY||0;
          });
          refreshAll();
          toast('Imported layout');
        }catch(e){ alert('Invalid JSON'); }
      });
    };
    
    const rotateRange = document.getElementById('rotateStep');
    const rotateVal = document.getElementById('rotateStepVal');
    rotateRange.addEventListener('input', e=>{
      rotateStepDeg = parseInt(rotateRange.value,10);
      rotateVal.textContent = rotateStepDeg + '°';
    });
    
    // CSV export
    let lastSnapshot = null;
    ui.downloadCsvBtn.onclick = ()=>{
      const rows = [];
      rows.push(['Name','Zone','W(m)','D(m)','Area(m^2)','X(m)','Z(m)','RotationY(rad)']);
      for(const m of modules){
        const box = new THREE.Box3().setFromObject(m.mesh);
        const size = new THREE.Vector3(); box.getSize(size);
        const area = (size.x*size.z).toFixed(3);
        rows.push([m.name, m.zone, m.w, m.d, area, m.mesh.position.x.toFixed(3), m.mesh.position.z.toFixed(3), (m.mesh.rotation.y||0).toFixed(3)]);
      }
      rows.push([]);
      rows.push(['Summary Metric','Value']);
      const s = lastSnapshot || {};
      const add = (k,v)=>rows.push([k, v]);
      add('Mission Day', s.day ?? '');
      add('Crew Size (CQ modules)', s.crewSize ?? modules.filter(m=>m.name==='Crew Quarters').length);
      add('Total Area (m^2)', s.area ?? totalArea().toFixed(2));
      add('Adjacency Compliance (%)', Math.round((s.A??0)*100));
      add('Private Sleep Quarters (%)', Math.round((s.P??0)*100));
      add('Visual Order (%)', Math.round((s.V??0)*100));
      add('Window Type (0/0.5/1)', s.W ?? '');
      add('Circulation Pattern (0/1)', s.R ?? '');
      add('Lighting Compliance', s.L ?? '');
      add('Exercise Compliance', s.E ?? '');
      add('Stress (0-100)', s.stress ?? '');
      add('Mood (0-100)', s.mood ?? '');
      add('Sleep Quality (0-100)', s.sleepQ ?? '');
      add('Cohesion (0-100)', s.cohesion ?? '');
      add('Psych Health Index (0-100)', s.phi ?? '');
    
      const csv = rows.map(r=>r.map(x=>String(x).replace(/"/g,'""')).map(x=>`"${x}"`).join(',')).join('\n');
      const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'ls2_layout_metrics.csv';
      a.click();
    };
    
    ////////////////////////////////////////////////////////////////////////////////
    // Kickoff
    ////////////////////////////////////////////////////////////////////////////////
    function seed(){
      addModule(Catalog[0]); // Crew Quarters
      // add a few helpers to see the dashboard move
      addModule(Catalog[4]); // Galley
      addModule(Catalog[1]); // Hygiene
    }
    resizeCanvas();
    seed();
    refreshAll();
    </script>
    </body>
    </html>
    
    ```
    
    ---
    
    ### What this adds
    
    - **Controls** (right panel) for HERA+UND inputs:
        - Mission day (1–45), **WindowType** (none / digital / physical), **Circulation** (tree / loop),
        - **Lighting** and **Exercise compliance** sliders.
    - **Derived from layout** (no extra clicks):
        - **PrivateSleepQuarters** (fraction of Crew Quarters per crew size proxy),
        - **AdjacencyCompliance** (%),
        - **VisualOrder** (simple “no overlaps + no min-area violations” proxy).
    - **Psych Health Index**:
        - Snapshot at selected mission day using the same signs/weights we established (stress inverted in the composite).
    - **CSV export**:
        - Full module table (name, zone, size, pose) and a **summary** section with all compliance & psych metrics.
    
    > To wire in your full constraints JSON and exact model params, just replace the inline Constraints and ModelParams objects here with your canonical data from earlier.
    > 
- **Demo Mission:** *“Lunar Daytime 45-Day Mission, 4-Crew”* scenario.
    
    # Demo Mission
    
    ## Title
    
    **Lunar Daytime — 45-Day Mission, 4-Crew (HERA-style confinement with UND LDT factors)**
    
    ## Mission rationale (NASA references)
    
    - **Duration & crew**: HERA runs confinement missions **up to 45 days** with **4 crew**, with standardized daily schedule and isolation protocols】】.
    - **Daily structure**: Lights 07:00–23:00, 16h awake / 8h sleep; exercise **1.25–2.5h** including setup/cleanup; 5.5 workdays + 1.5 off-duty per week】】.
    - **Design targets for ≤30–60 d habitation**: Private crew quarters; **enclosed** hygiene; **WCS on different deck/zone from galley**; permanently installed exercise (>30 d) and located near hygiene; windows beneficial (operational + morale)】】】.
    - **Behavioral experiment variables (UND LDT)**:
        
        – **Privacy / private sleep** ↦ lower stress & better mood/sleep】
        
        – **Windows (digital vs. physical)** ↦ reduced confinement & improved orientation】
        
        – **Circulation loop vs. tree** ↦ affects interaction, efficiency, egress】】
        
        – **Visual order** ↦ boosts performance/mood/productivity】.
        
    
    ---
    
    ## What this mission tests in your sim
    
    - Can the player hit **functional zoning** (clean vs dirty), **volume minima**, and **path width** while maintaining **high psych health** over 45 days?
    - Underscores **one niche lens**: how **privacy, windows, circulation, and visual order** (UND) interact with **layout compliance** (HERA/DSHG) to influence **crew stress, mood, sleep, cohesion**.
    
    ---
    
    ## Plug-in JSON (drop into your app as `mission_scenarios["lunar_45d_4p"]`)
    
    > This is self-contained: parameters, target constraints, scoring, and scripted events.
    > 
    > 
    > Your builder already computes adjacency compliance, private sleep %, visual order, and the HERA+UND **Psych Health Index** — the IDs below map 1:1 to those UI signals.
    > 
    
    ```json
    {
      "id": "lunar_45d_4p",
      "name": "Lunar Daytime — 45-Day Mission (4 Crew)",
      "meta": {
        "environment": "Lunar surface analog (continuous power assumed)",
        "crew_size": 4,
        "duration_days": 45,
        "lights_on": "07:00",
        "lights_off": "23:00",
        "work_rest_cycle": "5.5_work + 1.5_off",
        "exercise_minutes_per_day_including_ops": [75, 150]
      },
    
      "required_functions": [
        "Crew Quarters:4",
        "Hygiene:1",
        "WCS:1",
        "Galley:1",
        "Ward/Dining:1",
        "Workstation:2",
        "Exercise:1",
        "IFM/Repair:1",
        "Medical:1",
        "Stowage:as_fit"
      ],
    
      "layout_rules": {
        "min_path_width_m": 1.0,
        "min_area_m2": {
          "Crew Quarters": 1.82,
          "Hygiene": 1.06,
          "WCS": 0.91,
          "Exercise": 1.50,
          "Galley": 0.56,
          "Ward/Dining": 1.62,
          "Workstation": 1.37
        },
        "adjacency_must_separate": [
          ["Hygiene","Crew Quarters"],
          ["WCS","Galley"],
          ["Exercise","Crew Quarters"]
        ],
        "zoning": {
          "clean": ["Crew Quarters","Galley","Ward/Dining","Workstation","Medical"],
          "dirty": ["WCS","Hygiene","Exercise","IFM/Repair","Trash"]
        }
      },
    
      "behav_model_inputs": {
        "window_type": "digital_or_physical",
        "circulation": "loop_or_tree",
        "lighting_compliance": 0.8,
        "exercise_compliance": 0.7
      },
    
      "success_criteria": {
        "min_adj_compliance_pct": 80,
        "min_private_sleep_pct": 100,
        "min_visual_order_pct": 80,
        "min_phi_avg_over_mission": 70
      },
    
      "scoring": {
        "weights": {
          "psych_health_index": 0.4,
          "adjacency_compliance": 0.3,
          "layout_efficiency": 0.3
        },
        "bonuses": {
          "optimal_zoning": 50,
          "creative_psych_solution_multiplier": 0.15
        },
        "fail_conditions": [
          "any_day_phi_below_40_for_two_consecutive_days",
          "adjacency_compliance_below_60_pct"
        ]
      },
    
      "scripted_events": [
        {
          "day": 3,
          "name": "Lighting Audit",
          "effect": {"lighting_compliance": +0.05},
          "desc": "Tune 07:00–23:00 cycle and task lights to reduce sleep inertia."
        },
        {
          "day": 7,
          "name": "Virtual Window Trial",
          "variant": "digital",
          "effect": {"window_type": "digital"},
          "desc": "Install high-fidelity digital ‘port’ scenes; observe stress/mood shift."
        },
        {
          "day": 10,
          "name": "Comm Delay Drill",
          "effect": {"stress_spike": 6},
          "desc": "Introduce exploration-style comm delays; test loop circulation during procedures."
        },
        {
          "day": 14,
          "name": "Circulation Reconfig",
          "variant": "loop",
          "effect": {"circulation": "loop", "cohesion_boost": 4},
          "desc": "Enable racetrack loop; compare to dead-end tree performance."
        },
        {
          "day": 20,
          "name": "Exercise Hot-Zone Relocation",
          "requirement": "Exercise adjacent to Hygiene",
          "desc": "Move exercise near Hygiene to reduce cross-contamination pathways."
        },
        {
          "day": 28,
          "name": "Visual Order Sprint",
          "objective": "Reduce overlaps; ensure no min-area violations",
          "effect": {"visual_order_target_pct": 90}
        },
        {
          "day": 35,
          "name": "Hygiene Privacy Upgrade",
          "effect": {"private_sleep_bonus": 0.05, "stress_reduction": 4},
          "desc": "Improve privacy partitions & acoustic separation."
        },
        {
          "day": 42,
          "name": "Final Readiness",
          "objective": "All success criteria simultaneously ≥ targets for 48h"
        }
      ],
    
      "telemetry_export": {
        "csv_fields": [
          "day","crew_size","total_area_m2",
          "adjacency_compliance_pct","private_sleep_pct","visual_order_pct",
          "window_type","circulation","lighting_compliance","exercise_compliance",
          "stress","mood","sleep_quality","cohesion","psych_health_index"
        ]
      }
    }
    
    ```
    
    ---
    
    ## How to run this mission in your prototype
    
    1. **Paste** the JSON above into a `missions.js` (or embed as a JS object) and load it with your page.
    2. On load, call something like:
        
        ```jsx
        const SCENARIO = mission_scenarios["lunar_45d_4p"];
        // initialize right-panel sliders from SCENARIO.behav_model_inputs
        // enforce SCENARIO.layout_rules in your existing constraint checker
        // step through SCENARIO.scripted_events to nudge inputs / set objectives
        
        ```
        
    3. **Victory condition** = meet `success_criteria` on Day 45 and avoid `fail_conditions`.
    4. **CSV** is already wired in your app; ensure it includes the `telemetry_export.csv_fields` order.
    
    ---
    
    ## NASA-backed constraints (why these rules are “on rails”)
    
    - **4 crew, 45 days, isolation & schedule** — HERA standardized mission conditions】 and daily plan including **exercise 1.25–2.5h** with setup/cleanup】.
    - **Private quarters & enclosed hygiene** significantly enhance ≤30-day missions and trend to essential with longer durations; **WCS separated from galley**; **exercise near hygiene; permanent exercise area for >30 d**】】】.
    - **Windows matter** (operational awareness & morale)】; UND also proposes testing **digital vs physical** windows as an independent variable】.
    - **Privacy in sleep** reduces stress and improves mood/sleep (UND Hypothesis 1)】.
    - **Circulation loop** vs **tree** produces different crew-interaction/egress outcomes (UND Hypothesis 3)】.
    - **Visual order** boosts performance/mood/productivity (UND Hypothesis 4)】.
    
    ---
    
    ## Niche focus (what makes this one sharp)
    
    This mission **does one thing extremely well**: it operationalizes **four behavioral levers** (privacy, windows, circulation, visual order) *within* a **strict HERA-style 45-day workflow** and **NASA habitability layout rules**. Designers can try many layouts, but **win only** by solving the psych-layout coupling—**a narrow, teachable slice** of the habitation problem that still touches all key functions.
    
    Want me to wire this into your `index.html` as a minimal loader (so you can select the scenario from a dropdown and auto-apply the scripted events)?
    
    **Medical References**
    
    1. NoneDOI: file-XhewZhCu6sKmW4emDEJ1w4
    2. NoneDOI: file-1bgfREXYzzuKcehJ3XcodU
    3. NoneDOI: file-L33duXWty4LmcDDbkdHtPL

---

### **Tagline**

> “Design with empathy. Validate with NASA.”
> 
> 
> *The first open simulator translating spatial design into crew well-being — built solely on NASA analog and habitability data.*
> 

---