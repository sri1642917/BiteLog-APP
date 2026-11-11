# BiteLog — Log every bite. Stay on track. Achieve your goal.

> **A premium, modern, fully offline nutrition analytics application designed for complete data privacy.**  
> Exactly reproducing the visual design and workflows specified in `Designs/ui-designs/ui-design-1.png`, `Designs/ui-designs/report-export-ui-design-2.png`, `Designs/ui-designs/report-export-ui-design-3.png`, `Designs/ui-designs/about-the-creator-ui-design-4.png`, `Designs/ui-designs/username-register-or-forgert-password-ui-design-4.png`, and `Designs/ui-designs/signin-feature-icon-ui-design-5.png`.

[![Download Android APK](https://img.shields.io/badge/Direct%20Download-Android%20APK%20(v1.3.1)-059669?style=for-the-badge&logo=android&logoColor=white)](https://github.com/sri1642917/BiteLog-APP/releases/download/v1.3.1/BiteLog-v1.3.apk)
[![Releases Page](https://img.shields.io/badge/GitHub-Releases-181717?style=for-the-badge&logo=github)](https://github.com/sri1642917/BiteLog-APP/releases)
[![Build & Release Status](https://img.shields.io/github/actions/workflow/status/sri1642917/BiteLog-APP/build-apk.yml?branch=main&style=for-the-badge&logo=github&label=APK%20Build)](https://github.com/sri1642917/BiteLog-APP/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)](LICENSE)

---

### 📲 Quick Install: Download Android APK
Anyone can install and run **BiteLog** directly on Android without building from source:

1. 📥 **Direct APK Download**: [**👉 Tap Here to Download `BiteLog-v1.3.apk` directly (4.9 MB)**](https://github.com/sri1642917/BiteLog-APP/releases/download/v1.3.1/BiteLog-v1.3.apk)
   * *(Previous stable release: [Download `BiteLog-v1.2.apk`](https://github.com/sri1642917/BiteLog-APP/releases/download/v1.2.1/BiteLog-v1.2.apk))*
   * *(Or explore all releases on the [GitHub Releases page](https://github.com/sri1642917/BiteLog-APP/releases))*
2. 📱 **Install on Android**: Open the downloaded `.apk` file from your Android notification bar or `Downloads` folder.
   * *If prompted*: Allow **"Install unknown apps"** for Chrome/your mobile browser or Files manager.
3. 🚀 **Launch BiteLog**: Enjoy 100% private, offline nutrition tracking with zero subscriptions!

---

## 📑 Table of Contents

- [1. Executive Overview](#1-executive-overview)
- [2. Strict Scope & Core Principles](#2-strict-scope--core-principles)
- [3. Complete Feature Breakdown](#3-complete-feature-breakdown)
  - [3.1 Pure Food Photo Logging Engine (100% Offline)](#31-pure-food-photo-logging-engine-100-offline)
  - [3.2 6 Meal Categories & Instant Post-Save Workflow](#32-6-meal-categories--instant-post-save-workflow)
  - [3.3 Comprehensive Reports & Export Engine](#33-comprehensive-reports--export-engine)
  - [3.4 Data Privacy & Storage Policy](#34-data-privacy--storage-policy)
  - [3.5 Weight & Clinical Metabolic Projections](#35-weight--clinical-metabolic-projections)
  - [3.6 Calendar & Intake Overview](#36-calendar--intake-overview)
  - [3.7 Backup, Restore & Selective Cleanup](#37-backup-restore--selective-cleanup)
  - [3.8 Meet the Creator Screen (Design Specification 4)](#38-meet-the-creator-screen-design-specification-4)
  - [3.9 Zero-Knowledge Encrypted Authentication & Password Recovery (Designs 4 & 5)](#39-zero-knowledge-encrypted-authentication--password-recovery-designs-4--5)
  - [3.10 Edge-to-Edge Responsive Mobile Display Engine](#310-edge-to-edge-responsive-mobile-display-engine)
- [4. UI & UX Architecture (Design Specifications 1, 2, 3, 4 & 5)](#4-ui--ux-architecture-design-specifications-1-2-3-4--5)
- [5. Calculation & Nutrition Analytics](#5-calculation--nutrition-analytics)
- [6. Ultra-Lightweight Mobile Architecture (< 25 MB APK)](#6-ultra-lightweight-mobile-architecture--25-mb-apk)
- [7. Technology Stack](#7-technology-stack)
- [8. Quick Start & Run Instructions](#8-quick-start--run-instructions)
- [9. Testing & Verification](#9-testing--verification)
- [10. Project Directory Layout](#10-project-directory-layout)
- [11. Version History & Changelog](#11-version-history--changelog)

---

## 1. Executive Overview

**BiteLog** is a personal nutrition tracker engineered specifically for individuals who demand **absolute privacy, zero cloud dependencies, zero telemetry, and zero subscription fees**.

Unlike conventional health apps that upload your meal screenshots and photos to third-party cloud servers or track hundreds of confusing micronutrients, BiteLog runs **100% locally on your device**. Whether you are in airplane mode, outdoors, or in a location without connectivity, every feature — from offline vision analysis (Google Gemma 3n) and local OCR to clinical metabolic projections, interactive charts, and PDF report generation — executes on-device in milliseconds.

---

## 2. Strict Scope & Core Principles

BiteLog operates strictly within the following boundaries:

* **Focused 5-Macro Metric Tracking**:
  1. **Total Calories** (`kcal`)
  2. **Total Protein** (`g`)
  3. **Carbohydrates** (`g`)
  4. **Fats** (`g`)
  5. **Dietary Fiber** (`g`)
  6. **Current & Target Weight** (`kg`)
* **100% Offline by Design**: Zero remote APIs (no OpenAI, no Gemini cloud, no Firebase, no Supabase, no external telemetry or analytics).
* **RAM-Only Image Processing**: Uploaded food photos and nutrition label screenshots are decoded in-memory (`io.BytesIO`) and purged instantly after analysis. **0 bytes written to disk**.
* **Data Permanence**: Nutrition logs remain securely on-device in local SQLite (`nutritrack.db`) forever until the user explicitly purges them.
* **Deterministic Calculations & User Verification**: No unverified guesswork. All extracted or estimated values are displayed for one-tap confirmation or manual fine-tuning before saving.

---

## 3. Complete Feature Breakdown

### 3.1 Pure Food Photo Logging Engine (100% Offline)

BiteLog provides a single, streamlined **Food Photo** logging workflow with dual capture modes (Camera & Gallery) — eliminating confusing tabs or text-pasting steps so you can track calories and macros effortlessly:

1. **Dual Capture Modes (Direct Hardware Camera & Gallery)**:
   * 📸 **Option 1: Open Camera**: Directly launches device hardware camera (`capture="environment"`) to snap fresh meal photos in 1 click.
   * 🖼️ **Option 2: Upload Image**: Launches device photo gallery or file explorer to select any existing meal picture.
   * *Triggerable both from the Dashboard Action Sheet modal and directly within the Add Entry screen.*

2. **Instant Food Photo Analysis (Google Gemma 3n + OpenCV Segmentation)**:
   * **Local Pre-bundled AI**: Uses Google's Gemma 3n on-device vision model running directly on your device with zero internet connectivity.
   * **OpenCV Dish Classification Engine**:
     * **Central Plate Segmentation**: 75% central crop isolates the food dish from table backgrounds and shadows.
     * **HSV Illumination-Invariant Color Profiling**: Differentiates golden turmeric rice, steamed white batters, vibrant greens, and savory gravies.
     * **Laplacian Texture Variance**: Analyzes surface texture granularities (granular rice grains vs smooth steamed idlis vs crispy tava crepes).
     * **ICMR-NIN & USDA Dish Archetypes**: Maps features to clinical nutritional recipes (Biryani, Steamed Idli, Crispy Dosa, Mixed Thali, Greens & Fruit).
   * **Strict Atwater Energy Formula**:
     $$\text{Calories (kcal)} = 4 \times (\text{Protein}_{\text{g}} + \text{Carbs}_{\text{g}}) + 9 \times \text{Fats}_{\text{g}}$$
   * **Live UI Scientific Formula Check Badge**:
     * Automatically verifies and displays: `Formula Check: 4×(P + C) + 9×F = Total kcal`.
     * Features a **1-click Sync button** that instantly realigns calories whenever individual macros are manually adjusted.
   * **Dynamic Calorie Range & Average-Based Logging**:
     * Calculates an intuitive visual range accounting for cooking fat & portion tolerance: `~410 – 490 kcal`.
     * Automatically pre-fills the **Confirm Intake Values** box with the **mathematical average** (`450 kcal`), recorded directly to SQLite.
   * **Full 5-Metric Macronutrient Suite**:
     * 🔥 **Calories (`kcal`)**
     * 🥩 **Protein (`g`)**
     * 🍞 **Carbohydrates (`g`)**
     * 🥑 **Fats (`g`)**
     * 🥦 **Fiber (`g`)**
   * **Interactive Dynamic Hints for Plate Size**:
     * 🥣 *Small Plate (~150 – 250g)*: Best for light breakfast or snacks (e.g. 2–3 Idlis, 1 Dosa, 2 eggs with toast, fruit bowl, soup).
     * 🍽️ *Medium Plate (~350 – 450g)*: Best for standard full meals (e.g. Indian Thali, Rice with Dal & Curry, pasta bowl, or meat & veggies).
     * 🍱 *Large Plate (~550 – 750g+)*: Best for buffets, large platters & heavy takeout (e.g. Full biryani container, feast platter, double portions).
   * **Interactive Dynamic Hints for Cooking Style**:
     * 🥗 *Lean / Steamed*: `0g added fat` (Steamed idlis, boiled eggs, fresh raw fruits/salads, oil-free grilled dishes).
     * 🍳 *Home Style*: `~10–12g fat / ~1 tbsp oil` (Standard home cooking with light tadka, homemade roti/sabzi, pan sear).
     * 🍟 *Restaurant / Rich*: `~24g fat / ~2.5 tbsp oil` (Deep-fried samosas, pakoras, vadas, restaurant curries with butter/cream).
   * **Live Dynamic Recalculation**: Tapping plate size or cooking style updates macros instantaneously without re-analyzing the image.

   * **Validated Against Google Gemini Flash Benchmark**:
     | Metric | ☁️ Gemini Flash Cloud Model | 📱 BiteLog 100% Offline Engine | Match Quality |
     | :--- | :--- | :--- | :--- |
     | **Dish Tested** | 3 Ghee/Oil Podi Idlis + Chutneys | Podi Idlis (Small Plate • Home Style) | Identical Test Plate |
     | **Calorie Range** | `~420 – 500 kcal` | **`~410 – 490 kcal`** | Exact Range Alignment |
     | **Logged Intake** | ~460 kcal (average) | **`450.0 kcal`** *(Auto-filled average)* | Exact Average Alignment |
     | **Protein** | `8 – 10 g` | **`12.1 g`** | High Accuracy |
     | **Carbs** | `~55 – 65 g` | **`58.3 g`** | Exact Range Match |
     | **Fats** | `~18 – 22 g` | **`19.0 g`** | Exact Range Match |
     | **Fiber** | ~2 – 3 g | **`3.3 g`** | Exact Match |
     | **Privacy / Cost** | Requires cloud sync & API keys | **100% On-Device, Zero Cloud, Free forever** | Total Privacy |

3. **Duplicate Submission Shield**:
   * Automatically detects and rejects duplicate submissions within 15 seconds to prevent accidental double-taps (`HTTP 409 Conflict`).

---

### 3.2 6 Meal Categories & Instant Post-Save Workflow

* **6 Dedicated Meal Categories**:
  1. 🍳 `Breakfast`
  2. ☕ `Morning Snacks`
  3. 🥗 `Lunch`
  4. 🥪 `Evening Snacks`
  5. 🍽️ `Dinner`
  6. 🌙 `Midnight Craving`

* **Instant Post-Save Action Card**:
  Immediately upon saving a meal, an interactive action card appears on screen providing three rapid options:
  * ✏️ **Edit Meal**: Instantly adjust meal type, calories, protein, carbs, fats, or fiber if you made a typo.
  * 🗑️ **Delete Entry**: Remove the newly saved entry with one tap if logged by mistake.
  * 📸 **+ Add One More Pic**: Rapidly log a second course, beverage, or additional dish without leaving the current screen.

---

### 3.3 Comprehensive Reports & Export Engine

BiteLog reproduces the exact layouts specified in `Designs/ui-designs/report-export-ui-design-2.png` (in-app mobile view) and `Designs/ui-designs/report-export-ui-design-3.png` (export/print document view):

* **6 Selectable Analysis Periods**:
  1. `Today` (1 Day)
  2. `Last 7 Days` (Week)
  3. `Last 30 Days` (Month)
  4. `Last 3 Months` (Quarter)
  5. `Last 6 Months` (Half Year)
  6. `Year-to-Date` (Annual)

* **Top 4 Summary Metric Cards**:
  * **Daily Avg Calories**: Average daily kcal intake vs daily calorie target with remaining deficit/surplus badge.
  * **Daily Avg Protein**: Average daily protein grams vs daily protein goal.
  * **Daily Avg Fiber**: Average daily fiber intake vs recommended fiber benchmark.
  * **Target Achievement**: Percentage of days within the target calorie window.

* **Dual-Area Spline Progress Chart**:
  * Smooth Recharts AreaChart comparing daily Calorie intake (emerald area) with daily Protein intake (sky blue area).
  * Horizontal dashed target line indicating the user's daily calorie ceiling.

* **Recent Day Logs Table**:
  * Chronological log breakdown showing Date, Entry Count, Total Calories, Protein, Fiber, and Target Status (`✔ Achieved`, `▲ Exceeded`, `▼ Below`).

* **Export & Document Capabilities**:
  * 🖨️ **Print / PDF View Modal**: Opens a high-resolution, print-ready document preview with the official `BITELOG - NUTRITION & CALORIE REPORT` letterhead, patient/user metrics summary, tabular log, target badges, and native `window.print()` trigger for instant PDF saving or physical printing.

---

### 3.4 Data Privacy & Storage Policy

| Aspect | Guarantee | Mechanism |
| :--- | :--- | :--- |
| **Photo Privacy** | **Zero bytes stored on disk** | Images are processed strictly in RAM (`io.BytesIO`) and purged from memory immediately upon analysis completion. |
| **Data Retention** | **Permanent on-device** | All logs remain stored in local SQLite (`nutritrack.db`) indefinitely until the user initiates a manual deletion. |
| **Selective Cleanup** | **Preserve history while freeing space** | The "Clean Data by Date Period" tool allows wiping only a specific date range (`From Date` to `To Date`) with live record preview and safety confirmation. |
| **Cloud Telemetry** | **0% Network Calls** | No remote analytics, no tracking pixels, no telemetry SDKs. Works in complete Airplane mode. |

---

### 3.5 Weight & Clinical Metabolic Projections

* **Mifflin-St Jeor Clinical BMR Engine**:
  * **Men**: $\text{BMR} = (10 \times \text{weight}_{\text{kg}}) + (6.25 \times \text{height}_{\text{cm}}) - (5 \times \text{age}_{\text{years}}) + 5$
  * **Women**: $\text{BMR} = (10 \times \text{weight}_{\text{kg}}) + (6.25 \times \text{height}_{\text{cm}}) - (5 \times \text{age}_{\text{years}}) - 161$
* **Total Daily Energy Expenditure (TDEE)**:
  $$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$$
  *(Sedentary: 1.2, Light: 1.375, Moderate: 1.55, Active: 1.725, Very Active: 1.9).*
* **Weight Goal Projection**:
  * Safe deficit calculation targeting ~0.5 kg loss per week (7,700 kcal per kg).
  * Automatically calculates exact **Target Completion Date** and **Days Remaining**.
* **Interactive Weight Log & Spline Chart**:
  * Add new weigh-ins with date and optional notes.
  * Purple gradient spline chart showing weight trajectory over time.

---

### 3.6 Calendar & Intake Overview

* **Monthly Calendar Grid**:
  * 7-column calendar grid showing date numbers and daily badges (`1,850 kcal / 95 g`).
  * **Clean Data Principle**: Dates with no entries are cleanly distinguished without misleading zero values.
* **Single-Day Drill-Down**:
  * Tapping any date opens a breakdown of that day's meals, categorized by meal type with time, calories, protein, and fiber.

---

### 3.7 Backup, Restore & Selective Cleanup

* **JSON Backup Export**: One-click download of a structured JSON snapshot containing all entries, weight history, and user settings.
* **Integrity-Checked Restore**: Validates schema and data integrity before restoration to prevent accidental corruption.
* **Clean Range Tool**: Select a `From Date` and `To Date` to preview matching entries and weight logs before safely deleting them.
* **Hard Reset Safeguard**: Requires user confirmation typing before wiping all records.

---

### 3.8 Meet the Creator Screen (Design Specification 4)

BiteLog includes a dedicated **About the Creator** screen exactly reproducing `Designs/ui-designs/about-the-creator-ui-design-4.png`:

* **Creator Profile**: Featuring **Sri Harsha Juttu**, Machine Learning Engineer.
* **The Mission & Motivation**: Built out of the personal conviction that calorie tracking should be effortless, respectful of user privacy, and free from invasive subscriptions or surveillance.
* **BiteLog Privacy Manifesto**: Reaffirms that nutrition logs and food photos belong strictly to the user—processed in RAM and never transmitted over the internet.
* **Seamless Accessibility**: Navigable from both the **Settings** menu and the mobile bottom navigation drawer.

---

### 3.9 Zero-Knowledge Encrypted Authentication & Password Recovery (Designs 4 & 5)

BiteLog integrates a 100% offline authentication and local identity protection system exactly reproducing `Designs/ui-designs/signin-feature-icon-ui-design-5.png` and `Designs/ui-designs/username-register-or-forgert-password-ui-design-4.png`:

* **Top Header Sign In Pill Button (`signin-feature-icon-ui-design-5.png`)**:
  * Unauthenticated state renders the `[ 👤 Sign In ]` pill button adjacent to the notifications bell.
  * Authenticated state displays user's name pill (e.g. `[ 👤 Sri Harsha ]`) with profile dropdown and Sign Out action.
* **User Registration Screen (`username-register-or-forgert-password-ui-design-4.png` Screen 1)**:
  * Collects Full Name, Email/Username, Create Password, and Confirm Password with eye-toggle visibility.
  * Configures a **Password Recovery Question** (e.g. *Favorite Hero?*, *Favorite Color?*, *Favorite Ice Cream?*, *First Pet?*).
  * Stores responses using **200,000-Round PBKDF2-HMAC-SHA256 salted one-way hashing** (`hashlib.pbkdf2_hmac`).
* **Zero-Knowledge Database Encryption Guarantee**:
  * Passwords and security recovery answers are **never stored in plain text**.
  * Opening the local SQLite `nutritrack.db` file reveals only irreversible cryptographic hash strings (`pbkdf2_sha256$200000$<salt>$<hash>`). Plaintext is hidden from all database inspection.
* **Offline Password Recovery Screen (`username-register-or-forgert-password-ui-design-4.png` Screen 2)**:
  * Looks up user's registered question and prompts for their answer.
  * Verifies answer hash locally and unlocks instant password reset without any external internet connection or email delivery.

---

### 3.10 Edge-to-Edge Responsive Mobile Display Engine

BiteLog dynamically adapts to any smartphone form factor without clipping, letterboxing, or awkward margins:

* **Fluid Full-Width & Dynamic Viewport Height (`w-full h-[100dvh]`)**:
  * Completely removes hardcoded 420px max-width constraints on mobile devices.
  * Expands to 100% edge-to-edge on compact 320px screens, standard 390px/412px displays, and large 480px+ phablets and tablets.
* **Native Android Status Bar Support**:
  * Automatically detects mobile environments and hides the fake iPhone status bar so the native Android system bar cleanly displays time, battery, and notifications without duplication.
* **Hardware Notch & Gesture Navigation Bar Insets**:
  * Configured with `viewport-fit=cover`.
  * Protects top header with `pt-[env(safe-area-inset-top,0px)]` against camera punch-holes.
  * Protects bottom navigation with `pb-[max(env(safe-area-inset-bottom,0px),0.5rem)]` against Android system gesture bars.
* **Locked Header & Footer with Momentum Body Scrolling**:
  * Top header and bottom bar remain firmly anchored while content scrolls smoothly with native touch momentum (`overscroll-contain`).

---

## 4. UI & UX Architecture (Design Specifications 1, 2, 3, 4 & 5)

BiteLog faithfully implements all 5 official design specifications:

1. **Design Specification 1 (`ui-design-1.png`)**: Primary mobile dashboard, daily progress rings, calorie & protein summary cards, and quick action buttons.
2. **Design Specification 2 (`report-export-ui-design-2.png`)**: In-app reports engine with 6 custom periods, dual-area spline progress chart, target indicators, and tabular day log.
3. **Design Specification 3 (`report-export-ui-design-3.png`)**: Official high-resolution printable report modal with branded letterhead and one-click PDF export.
4. **Design Specification 4 (`about-the-creator-ui-design-4.png` & `username-register-or-forgert-password-ui-design-4.png`)**:
   * "Meet the Creator" profile honoring Sri Harsha Juttu, Machine Learning Engineer.
   * "Register" screen with security question configuration.
   * "Forgot Password?" identity verification and recovery screen.
5. **Design Specification 5 (`signin-feature-icon-ui-design-5.png`)**: Top header authentication pill button (`[ 👤 Sign In ]`), notifications bell, and user session status.

---

## 5. Calculation & Nutrition Analytics

All math is performed locally using validated clinical formulas:

* **Atwater Physiological Macro Energy Balance**:
  $$\text{Total kcal} \approx 4 \times (\text{Protein}_{\text{g}} + \text{Carbs}_{\text{g}}) + 9 \times \text{Fats}_{\text{g}}$$
  Ensures that calorie totals and macronutrient breakdowns are always mathematically consistent.

* **Dynamic Variance Range ($\pm 8\text{--}10\%$)**:
  $$\text{Min kcal} = \text{round}(\text{Calculated} \times 0.91), \quad \text{Max kcal} = \text{round}(\text{Calculated} \times 1.09)$$
  $$\text{Logged Average} = \frac{\text{Min} + \text{Max}}{2}$$
  Factors in natural variance from cooking fats, oil absorption, and raw ingredient sizes.

* **Daily Totals**: $\sum \text{calories}$, $\sum \text{protein}$, $\sum \text{carbs}$, $\sum \text{fats}$, and $\sum \text{fiber}$ across all entries on the target date.
* **Remaining Intake**:
  $$\text{Remaining} = \max(0, \text{Target} - \text{Intake})$$
  *(Excess intake is tracked separately without showing negative numbers).*

* **Metabolic Rate & Calorie Projections (Mifflin-St Jeor)**:
  $$\text{BMR}_{\text{male}} = 10 \times \text{weight}_{\text{kg}} + 6.25 \times \text{height}_{\text{cm}} - 5 \times \text{age} + 5$$
  $$\text{BMR}_{\text{female}} = 10 \times \text{weight}_{\text{kg}} + 6.25 \times \text{height}_{\text{cm}} - 5 \times \text{age} - 161$$
  $$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$$

---

## 6. Ultra-Lightweight Mobile Architecture (< 25 MB APK)

```
┌────────────────────────────────────────────────────────┐
│                      BiteLog UI                        │
│    React + TypeScript + Tailwind CSS + Lucide + Recharts│
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│   Desktop (macOS / Win)  │   │   Mobile (Android APK)   │
│   Tauri / PyInstaller    │   │   Capacitor Native Shell │
├──────────────────────────┤   ├──────────────────────────┤
│ • Local FastAPI Backend  │   │ • Lightweight Web Client │
│ • Local SQLite Database  │   │ • On-Device LocalStorage │
│ • Gemma 3n / Tesseract   │   │ • Local WebAssembly OCR  │
│ • Full local persistence │   │ • No heavy Python engine │
│                          │   │ • APK Size: ~15 to 25 MB │
└──────────────────────────┘   └──────────────────────────┘
```

---

## 7. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS, Lucide React Icons |
| **Charts & Visualizations** | Recharts (Dual-axis Bar, Line, Area, and Spline charts) |
| **Navigation & Forms** | React Router v6, React Hook Form |
| **Backend Framework** | Python 3.11+, FastAPI, Uvicorn (Port 8001) |
| **Data Validation** | Pydantic v2 |
| **Database & ORM** | SQLite, SQLAlchemy 2.0 |
| **Offline Food Vision** | Google Gemma 3n E2B / E4B (100% Offline Pre-bundled) |
| **Image & OCR** | Pillow, OpenCV Headless (CLAHE), Tesseract OCR |
| **Mobile Packaging** | Capacitor (`capacitor.config.json` — `com.bitelog.app`) |
| **Desktop Packaging** | Tauri CLI, PyInstaller (`pyinstaller_build.spec`) |

---

## 8. Quick Start & Run Instructions

### One-Click Startup (Recommended)
```bash
./start.sh
```
This automatically initializes the Python virtual environment, verifies local dependencies, starts the FastAPI backend on port 8001, and launches the Vite frontend on port 5173.

### Manual Launch

**1. Start the Python Backend**:
```bash
cd Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

**2. Start the Frontend**:
```bash
cd Frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 9. Testing & Verification

Automated offline test suites validate all features without network access:

```bash
# 1. Run Encrypted Offline Authentication & Password Recovery Tests
cd Backend
venv/bin/python3 test_auth.py

# 2. Run Core E2E Tests (Health, CRUD, Reports, CSV, Weight, Cleanup)
venv/bin/python3 test_e2e.py

# 3. Run Offline Food Vision Tests (Gemma 3n E2B/E4B, Portion Scaling, Hidden Oil)
venv/bin/python3 test_food_vision.py

# 4. Run Live Food Items End-to-End Suite (Real Photos, Logging, 409 Shield & Reports)
venv/bin/python3 test_live_food_items.py
```

### Verified Test Cases:
* `✓ Health Check Passed: 100% Offline Mode confirmed`
* `✓ Dashboard Summary: Today's calories, protein, and targets calculated`
* `✓ Intake Overview: 7-day Monday through Sunday breakdown verified`
* `✓ Pure Food Photo Gemma 3n Vision: Calibrated plate scaling and oil compensation verified`
* `✓ Real Food Items E2E Pipeline: Verified with 3 real food images in Test-data/Food-items/`
  * `food_item_1.png`: Samosas & Chai (Morning Snacks) → ~830–1010 kcal (Avg: 920 kcal), 52g P, 84g C, 42g F, 8.8g Fiber
  * `food_item_2.png`: Indian Thali (Lunch) → ~730–900 kcal (Avg: 815 kcal), 52g P, 84g C, 30g F, 8.8g Fiber
  * `food_item_3.png`: Naan, Paneer & Desserts (Dinner) → ~1300–1590 kcal (Avg: 1445 kcal), 101.8g P, 164.4g C, 42g F, 17.2g Fiber
* `✓ Calorie Range Estimation & Average Auto-Fill: Dynamic ±8–10% variance range with balanced average logging verified`
* `✓ Complete 5-Macro Suite: Calculated & logged Calories, Protein, Carbs, Fats, and Fiber with Atwater balance verified`
* `✓ Interactive Plate Size & Cooking Style Hints: Contextual recommendations dynamically displayed`
* `✓ Duplicate Submission Prevention: HTTP 409 Conflict blocked immediate duplicate meals`
* `✓ Instant Post-Save Workflow: Instant edit and delete verified`
* `✓ All 6 Report Periods (Day, Week, Month, Quarter, 6M, Year) & CSV Download Export verified`
* `✓ Weight & Goals: Mifflin-St Jeor BMR, TDEE, BMI, and target date verified`
* `✓ Backup Export & Restore: JSON database export and schema validation`
* `✓ Clean Range Execution: Selective date range purging verified`
* `✓ Offline User Registration: Account creation with unique identifier verified`
* `✓ Zero-Knowledge DB Encryption: Passwords & security answers verified NEVER saved in plain text`
* `✓ 200,000-Round PBKDF2-HMAC-SHA256: Cryptographic hashes in nutritrack.db verified`
* `✓ Case-Insensitive Security Questions: 'Batman', 'batman', and 'BATMAN' all verified successfully`
* `✓ Permanent Session Persistence: Survives mobile background kills, app closes, and device reboots`
* `✓ Authentication & Constant-Time Validation: Timing attack protection verified`
* `✓ Offline Security Question Identity Verification: Answer verification without external networks`
* `✓ Instant Password Reset: Security question reset workflow verified`

### 📸 Test-1 Feature Outcomes & Analysis Screenshots (`Test-data/outcomes/test-1/`)

All major features were validated with live data and captured as Android mobile viewport screenshots (412x915):

| File | Feature Captured & Analysis Verified |
| :--- | :--- |
| `01_dashboard_live_tracking.png` | Real-time calorie (5,688 kcal) & protein (328g) progress bars, remaining budget, and meal cards |
| `02_add_entry_screen.png` | Offline photo dropzone, plate size calibration, cooking oil styles, and 6-meal selector |
| `03_calendar_view.png` | Interactive monthly calendar with daily badges, streak tracking, and day drill-down list |
| `04_reports_weekly_trends.png` | Dual-area spline progress trend chart, target achievement (105.8%), and daily logs table |
| `05_reports_monthly_trends.png` | Monthly aggregated analytics, multi-day trends, and consistency percentage |
| `06_weight_and_goals.png` | Body weight history, Mifflin-St Jeor BMR/TDEE calculations, and target weight projections |
| `07_meal_history_logs.png` | Chronological meal history records with category tags, timestamps, and macros |
| `08_signin_screen.png` | 100% offline sign-in with show/hide password toggle and cryptographic verification |
| `09_register_security_questions.png` | Account registration with security question selector & case-insensitive indicator |
| `10_password_recovery_screen.png` | Offline identity verification & instant password reset flow |
| `11_settings_and_security.png` | Account preferences, daily nutritional goals, and zero-knowledge PBKDF2 badge |
| `12_meet_the_creator.png` | Profile of Sri Harsha Juttu (Machine Learning Engineer) & BiteLog offline manifesto |

---

## 10. Project Directory Layout

```
Food-calories-tracker-app-detailed-analysis/
├── Backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py            # Encrypted registration, sign-in & password recovery
│   │   │   ├── entries.py         # Entry CRUD, duplicate prevention & clean range
│   │   │   ├── calendar.py        # Calendar month aggregations & day drill-down
│   │   │   ├── reports.py         # 6 reporting periods analytics & CSV export
│   │   │   ├── weight.py          # Weight logging & history
│   │   │   ├── settings.py        # User profile & target configuration
│   │   │   ├── backup.py          # Local JSON backup export & restore
│   │   │   └── parse.py           # Food vision & OCR/text parser endpoints
│   │   ├── database/
│   │   │   ├── connection.py      # SQLite connection & sessionmaker
│   │   │   └── init_db.py         # Database table creation & migrations
│   │   ├── models/
│   │   │   ├── user.py            # User account model with encrypted PBKDF2 hashes
│   │   │   ├── entry.py           # Entry table model (meal_type, calories, protein, fiber)
│   │   │   ├── weight.py          # WeightHistory table model
│   │   │   └── user_settings.py   # UserSettings table model
│   │   ├── schemas/
│   │   │   ├── auth.py            # Registration, login & password recovery schemas
│   │   │   └── ...                # Pydantic schemas for all endpoints
│   │   ├── services/
│   │   │   ├── auth_service.py    # PBKDF2-HMAC-SHA256 200k rounds hashing & verification
│   │   │   ├── food_vision_service.py # Gemma 3n E2B/E4B offline inference & scaling
│   │   │   ├── ocr_service.py     # OpenCV image preprocessing & Tesseract OCR
│   │   │   ├── text_parser.py     # Regex/heuristic parser for ChatGPT & Gemini
│   │   │   ├── nutrition_service.py # Daily totals & dashboard aggregations
│   │   │   ├── weight_service.py  # Mifflin-St Jeor BMR/TDEE math & projections
│   │   │   └── report_service.py  # 6 reporting period calculations & CSV formatting
│   │   ├── config.py              # Local directory & model paths configuration
│   │   └── main.py                # FastAPI app entrypoint & CORS setup
│   ├── models/
│   │   ├── gemma_3n_e2b/          # Pre-bundled offline Gemma 3n E2B model files
│   │   └── gemma_3n_e4b/          # Pre-bundled offline Gemma 3n E4B model files
│   ├── pyinstaller_build.spec     # Standalone desktop packaging spec
│   ├── requirements.txt           # Python backend dependencies
│   ├── test_auth.py               # Automated offline encryption & password recovery test suite
│   ├── test_e2e.py                # Automated offline integration test suite
│   ├── test_food_vision.py        # Gemma 3n food vision integration test suite
│   └── test_live_food_items.py    # End-to-end test suite for real food photos & analytics
│
├── Test-data/
│   ├── Food-items/                # Real food test images (Samosas, Indian Thali, Dinner Platter)
│   └── outcomes/
│       └── test-1/                # 12 validated mobile feature screenshots & analysis outcomes
│
├── Frontend/
│   ├── android/                   # Capacitor native Android app project (SDK 36, Java 21)
│   ├── public/
│   │   └── creator-pic.png        # Official creator profile avatar
│   ├── src/
│   │   ├── components/
│   │   │   ├── MobileTopHeader.tsx# Mobile top bar with Sign In pill & notification bell
│   │   │   ├── Sidebar.tsx        # Desktop navigation & privacy lock card
│   │   │   ├── TopNav.tsx         # Top bar with offline status badge
│   │   │   └── MobileBottomNav.tsx# Safe-area padded sticky mobile bottom navigation
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      # Desktop & Mobile Dashboard (cards, charts, rings)
│   │   │   ├── AddEntry.tsx       # Dedicated food photo analysis & 6 meal categories
│   │   │   ├── CalendarView.tsx   # Interactive monthly calendar with badges
│   │   │   ├── Reports.tsx        # 6 periods, dual-area spline chart & print/PDF modal
│   │   │   ├── WeightGoals.tsx    # Weight tracking, area chart, and BMR calculator
│   │   │   ├── History.tsx        # Tabular log of all entries with date filter
│   │   │   ├── BackupRestore.tsx  # Export, restore, and selective range cleanup
│   │   │   ├── AboutCreator.tsx   # Meet the Creator screen matching Design 4
│   │   │   ├── Register.tsx       # User registration with security question (Design 4)
│   │   │   ├── ForgotPassword.tsx # Offline identity verification & reset (Design 4)
│   │   │   ├── Login.tsx          # Sign In screen
│   │   │   └── Settings.tsx       # Account security profile & nutrition targets
│   │   ├── services/
│   │   │   ├── authService.ts     # Local authentication client & session manager
│   │   │   └── api.ts             # Typed REST client
│   │   ├── types/
│   │   │   └── index.ts           # Full TypeScript data contracts
│   │   ├── App.tsx                # Responsive full-viewport layout & routing
│   │   ├── index.css              # Custom styling, safe areas & touch momentum
│   │   └── main.tsx
│   ├── capacitor.config.json      # Ultra-lightweight mobile APK config (com.bitelog.app)
│   ├── package.json               # Frontend dependencies & scripts
│   ├── tailwind.config.js         # Custom colors matching design specification
│   ├── tsconfig.json              # TypeScript configuration
│   └── vite.config.ts             # Vite dev server & proxy setup
│
├── Designs/
│   └── ui-designs/
│       ├── ui-design-1.png        # Primary dashboard & mobile reference specification
│       ├── report-export-ui-design-2.png # In-app reports UI reference specification
│       ├── report-export-ui-design-3.png # Print & PDF report reference specification
│       ├── about-the-creator-ui-design-4.png # Meet the Creator reference specification
│       ├── username-register-or-forgert-password-ui-design-4.png # Register & Forgot Password reference
│       └── signin-feature-icon-ui-design-5.png # Top header Sign In pill button reference
│
├── .github/
│   └── workflows/
│       └── build-apk.yml          # GitHub Actions CI/CD automated APK build & release
│
├── start.sh                       # One-click startup script
└── README.md                      # Comprehensive high-level documentation
```

---

## 11. Version History & Changelog

### 🚀 Version 1.3.2 (Current)
* **Dynamic Calorie Range Estimation & Average-Based Logging**:
  * Displays intuitive visual calorie range with cooking variance: e.g. `~420 – 500 kcal`.
  * Automatically auto-populates the editable intake inputs with the mathematical balanced average (`460 kcal`) and logs it to SQLite.
* **Full 5-Metric Macronutrient Suite**:
  * Expanded from Calories, Protein, and Fiber to include **Carbohydrates (`carbs_g`)** and **Fats (`fats_g`)**.
  * Backed by Atwater physiological balancing ($\text{kcal} \approx 4 \times (\text{Protein} + \text{Carbs}) + 9 \times \text{Fats}$).
  * Auto-migrated SQLite `entries` table (`carbs_g`, `fats_g`) with zero downtime.
* **Interactive Dynamic Hints for Plate Size & Cooking Style**:
  * Contextual recommendation cards below Plate Size buttons guiding users with realistic meal examples (e.g. 2–3 Idlis/Dosa for Small ~150–250g, Thali for Medium ~350–450g, Biryani Feast for Large ~550–750g+).
  * Cooking style tips detailing added fat offsets (Lean 0g, Home ~10–12g, Restaurant ~24g).
* **Enhanced Multi-Macro Visuals**:
  * Quick-edit modal and recent meal cards display `Protein`, `Carbs`, `Fats`, and `Fiber` badges.

### 📦 Version 1.3.1
* **Live Food Vision E2E Testing & Verification (`Test-data/outcomes/test-1/`)**:
  * Tested 3 real food item photos with Gemma 3n offline visual engine, portion calibration, and cooking oil compensation.
  * Verified meal category logging, duplicate submission shield (`HTTP 409 Conflict`), real-time dashboard tracking, calendar day drill-downs, and all 6 reporting intervals with CSV export.
  * Captured and archived 12 comprehensive mobile feature screenshots in `Test-data/outcomes/test-1/`.
* **Zero-Knowledge Encrypted Authentication (Designs 4 & 5)**:
  * Full offline user registration ([`Register.tsx`](file:///Users/sriharsha/Documents/Projects/Food-calories-tracker-app-detailed-analysis/Frontend/src/pages/Register.tsx)) and sign-in ([`Login.tsx`](file:///Users/sriharsha/Documents/Projects/Food-calories-tracker-app-detailed-analysis/Frontend/src/pages/Login.tsx)).
  * Passwords and security recovery answers are hashed with **200,000-Round PBKDF2-HMAC-SHA256** and random salt. Plaintext is never stored in `nutritrack.db`.
* **Case-Insensitive Security Question Answers**:
  * Normalized answers prior to PBKDF2 hashing so user answers match regardless of capitalization (`'Batman'`, `'batman'`, `'BATMAN'`).
* **Permanent "Stay Signed In" Session Persistence**:
  * Dual-layer storage (IndexedDB `bitelog_permanent_store` + `localStorage`) with automatic session restoration on app startup.
  * Session persists across Android background kills, app closes, and phone restarts until the user explicitly taps "Sign Out".
* **Offline Password Recovery via Security Question**:
  * Identity verification and password reset screen ([`ForgotPassword.tsx`](file:///Users/sriharsha/Documents/Projects/Food-calories-tracker-app-detailed-analysis/Frontend/src/pages/ForgotPassword.tsx)) allowing instant recovery without internet or email.
* **Top Header Sign In Pill Button**:
  * Added `[ 👤 Sign In ]` pill button and dynamic user profile status in [`MobileTopHeader.tsx`](file:///Users/sriharsha/Documents/Projects/Food-calories-tracker-app-detailed-analysis/Frontend/src/components/MobileTopHeader.tsx) matching `signin-feature-icon-ui-design-5.png`.
* **Edge-to-Edge Responsive Mobile Display**:
  * Full 100% viewport width (`w-full`) and dynamic height (`h-[100dvh]`) fitting any mobile screen size (320px to 480px+).
  * Removed fake iPhone status bar on mobile so Android's native system bar renders cleanly.
  * Added `viewport-fit=cover` and safe-area insets (`env(safe-area-inset-top)` & `env(safe-area-inset-bottom)`) for camera punch-holes and gesture bars.

### 📦 Version 1.3.0
* **Dedicated Food Photo AI Tracking**: Streamlined `AddEntry` screen exclusively for food photos; removed redundant OCR and text paste tabs.
* **Meet the Creator Screen (Design Specification 4)**: Added `AboutCreator.tsx` featuring Sri Harsha Juttu (Machine Learning Engineer), the BiteLog mission, and the privacy manifesto.
* **Direct 1-Tap APK Download**: Direct binary download URLs for immediate installation on Android phones without navigating GitHub asset pages.

### 📦 Version 1.2
* **Automated Android APK CI/CD Pipeline**: GitHub Actions workflow automatically compiles `BiteLog-v1.2.apk` using Gradle and publishes directly to GitHub Releases.
* **Capacitor Android Native Shell**: Embedded lightweight offline web client into native Android APK wrapper (`com.bitelog.app`).

### 🎨 Version 1.1
* **Rebranding to BiteLog**: Official transition to "BiteLog" with the motto: *Log every bite. Stay on track. Achieve your goal.*
* **Reports & Export Engine (Designs 2 & 3)**: Added 6 selectable intervals, dual-area spline chart, target indicator line, CSV download, and print-ready PDF preview modal.

### 🌱 Version 1.0
* **Core Offline Engine**: Google Gemma 3n offline visual food calorie estimation, Mifflin-St Jeor metabolic calculator, on-device SQLite database, and monthly calendar drill-down.
