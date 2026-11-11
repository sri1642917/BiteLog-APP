# BiteLog — Log every bite. Stay on track. Achieve your goal.

> **A premium, modern, fully offline nutrition analytics application designed for complete data privacy.**  
> Exactly reproducing the visual design and workflows specified in `Designs/ui-designs/ui-design-1.png`, `Designs/ui-designs/report-export-ui-design-2.png`, `Designs/ui-designs/report-export-ui-design-3.png`, and `Designs/ui-designs/about-the-creator-ui-design-4.png`.

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
  - [3.9 Encrypted Offline Authentication & Password Recovery (Designs 4 & 5)](#39-encrypted-offline-authentication--password-recovery-designs-4--5)
- [4. UI & UX Architecture (Design Specifications 1, 2, 3, 4 & 5)](#4-ui--ux-architecture-design-specifications-1-2-3-4--5)
  - [Mobile Smartphone Viewport (`max-w-[420px]`)](#mobile-smartphone-viewport-max-w-420px)
  - [Desktop Dashboard Viewport](#desktop-dashboard-viewport)
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

* **Focused Metric Tracking**:
  1. **Total Calories** (`kcal`)
  2. **Total Protein** (`g`)
  3. **Dietary Fiber** (`g`)
  4. **Current & Target Weight** (`kg`)
* **100% Offline by Design**: Zero remote APIs (no OpenAI, no Gemini cloud, no Firebase, no Supabase, no external telemetry or analytics).
* **RAM-Only Image Processing**: Uploaded food photos and nutrition label screenshots are decoded in-memory (`io.BytesIO`) and purged instantly after analysis. **0 bytes written to disk**.
* **Data Permanence**: Nutrition logs remain securely on-device in local SQLite (`nutritrack.db`) forever until the user explicitly purges them.
* **Deterministic Calculations & User Verification**: No unverified guesswork. All extracted or estimated values are displayed for one-tap confirmation or manual fine-tuning before saving.

---

## 3. Complete Feature Breakdown

### 3.1 Pure Food Photo Logging Engine (100% Offline)

BiteLog provides a single, streamlined **Food Photo** logging workflow — eliminating confusing tabs or text-pasting steps so you can track calories and macros effortlessly:

1. **Instant Food Photo Upload (Google Gemma 3n E2B / E4B)**:
   * **Single Focused Interface**: Snap or upload any meal photo (breakfast, snacks, lunch, dinner, midnight treats).
   * **Local Pre-bundled AI**: Uses Google's Gemma 3n on-device vision model running directly on your device with zero internet connectivity.
   * **Scale & Portion Calibration**: Solves 2D photo scale ambiguity with interactive portion presets:
     * *Small Plate / Bowl*: `0.75x`
     * *Medium Standard Plate*: `1.00x` (Default)
     * *Large Platter / Takeout Box*: `1.30x`
   * **Hidden Oil & Cooking Style Compensation**: Corrects the #1 error in visual calorie estimation:
     * *Lean / Steamed*: Boiled, grilled, air-fried (`0g added oil / +0 kcal`)
     * *Home Style*: Normal home cooking (`~1 tbsp oil / +110 kcal` — Default)
     * *Restaurant / Rich*: Gravies, curries, deep-fried (`~2.5 tbsp oil / +260 kcal`)
   * **Live Dynamic Recalculation**: Tapping plate size or cooking style updates macros instantaneously without re-analyzing the image.

2. **Duplicate Submission Shield**:
   * Automatically detects and rejects duplicate submissions within 15 seconds to prevent accidental double-taps.

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
  * ✏️ **Edit Meal**: Instantly adjust meal type, calories, protein, or fiber if you made a typo.
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

* **Dual Export Capabilities**:
  * 📥 **Download CSV**: Instant one-click generation of a clean spreadsheet named `BiteLog_Report_<period>_<date>.csv` containing the complete audit trail.
  * 🖨️ **Print / PDF View Modal**: Opens a high-resolution, print-ready document preview with the official `BITELOG - NUTRITION & CALORIE REPORT` letterhead, patient/user metrics summary, tabular log, target badges, and native `window.print()` trigger.

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

### 3.9 Encrypted Offline Authentication & Password Recovery (Designs 4 & 5)

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

## 4. UI & UX Architecture (Design Specifications 1, 2, 3 & 4)

### Mobile Smartphone Viewport (`max-w-[420px]`)
* Engineered specifically for modern smartphone frames (`390px` to `420px` width) with iOS-style status bar and rounded device chassis.
* **Top App Bar**: BiteLog brand title + Tagline: `Log every bite. Stay on track. Achieve your goal.`
* **Bottom Navigation**: Quick one-thumb access to *Dashboard*, *Add Entry*, *Calendar*, *Reports*, and *More* drawer.

### Desktop Dashboard Viewport
* Responsive two-column layout featuring a left sidebar with quick links, daily progress rings, intake bar charts, and tabular entry logs.

---

## 5. Calculation & Nutrition Analytics

All math is performed locally using validated clinical formulas:

* **Daily Totals**: $\sum \text{calories}$, $\sum \text{protein}$, and $\sum \text{fiber}$ across all entries on the target date.
* **Remaining Intake**:
  $$\text{Remaining} = \max(0, \text{Target} - \text{Intake})$$
  *(Excess intake is tracked separately without showing negative numbers).*

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
# 1. Run Core E2E Tests (Health, CRUD, Reports, CSV, Weight, Cleanup)
cd Backend
venv/bin/python3 test_e2e.py

# 2. Run Offline Food Vision Tests (Gemma 3n E2B/E4B, Portion Scaling, Hidden Oil)
venv/bin/python3 test_food_vision.py
```

### Verified Test Cases:
* `✓ Health Check Passed: 100% Offline Mode confirmed`
* `✓ Dashboard Summary: Today's calories, protein, and targets calculated`
* `✓ Intake Overview: 7-day Monday through Sunday breakdown verified`
* `✓ ChatGPT Text Parsing: Exact extraction of kcal, protein, and fiber`
* `✓ Screenshot Offline OCR: Tesseract extraction from synthetic test images`
* `✓ Add Entry: Creation, meal categorization, and timestamp recording`
* `✓ Duplicate Submission Prevention: HTTP 409 Conflict blocked duplicate double-clicks`
* `✓ Calendar Month Summary: Monthly aggregation without fake zeros`
* `✓ All 6 Report Periods (Day, Week, Month, Quarter, 6M, Year) & CSV Download Export verified`
* `✓ Weight & Goals: Mifflin-St Jeor BMR, TDEE, BMI, and target date verified`
* `✓ Backup Export & Restore: JSON database export and schema validation`
* `✓ Clean Range Execution: Selective date range purging verified`
* `✓ Gemma 3n E2B & E4B Vision: Calibrated plate scaling and oil compensation verified`
* `✓ Instant Post-Save Workflow: Instant edit and delete verified`

---

## 10. Project Directory Layout

```
Food-calories-tracker-app-detailed-analysis/
├── Backend/
│   ├── app/
│   │   ├── api/
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
│   │   │   ├── entry.py           # Entry table model (meal_type, calories, protein, fiber)
│   │   │   ├── weight.py          # WeightHistory table model
│   │   │   └── user_settings.py   # UserSettings table model
│   │   ├── schemas/               # Pydantic schemas for all endpoints
│   │   ├── services/
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
│   ├── test_e2e.py                # Automated offline integration test suite
│   └── test_food_vision.py        # Gemma 3n food vision integration test suite
│
├── Frontend/
│   ├── android/                   # Capacitor native Android app project (SDK 36, Java 21)
│   ├── public/
│   │   └── creator-pic.png        # Official creator profile avatar
│   ├── src/
│   │   ├── components/
│   │   │   ├── MobileTopHeader.tsx# Mobile top bar with BiteLog brand & tagline
│   │   │   ├── Sidebar.tsx        # Desktop navigation & privacy lock card
│   │   │   ├── TopNav.tsx         # Top bar with offline status badge
│   │   │   └── MobileBottomNav.tsx# Sticky mobile bottom navigation
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      # Desktop & Mobile Dashboard (cards, charts, rings)
│   │   │   ├── AddEntry.tsx       # Dedicated food photo analysis & 6 meal categories
│   │   │   ├── CalendarView.tsx   # Interactive monthly calendar with badges
│   │   │   ├── Reports.tsx        # 6 periods, dual-area spline chart & print/PDF modal
│   │   │   ├── WeightGoals.tsx    # Weight tracking, area chart, and BMR calculator
│   │   │   ├── History.tsx        # Tabular log of all entries with date filter
│   │   │   ├── BackupRestore.tsx  # Export, restore, and selective range cleanup
│   │   │   ├── AboutCreator.tsx   # Meet the Creator screen matching Design 4
│   │   │   └── Settings.tsx       # Personal profile & target configurations
│   │   ├── services/
│   │   │   └── api.ts             # Typed REST client
│   │   ├── types/
│   │   │   └── index.ts           # Full TypeScript data contracts
│   │   ├── App.tsx                # Routing and mobile drawer layout
│   │   ├── index.css              # Custom styling & scrollbars
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
│       └── about-the-creator-ui-design-4.png # Meet the Creator reference specification
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

### 🚀 Version 1.3 (Current)
* **Dedicated Food Photo AI Tracking**: Streamlined the `AddEntry` screen exclusively for food photos; removed redundant screenshot OCR and text paste tabs for a simpler, zero-friction logging experience.
* **Meet the Creator Screen (Design Specification 4)**: Added `AboutCreator.tsx` featuring Sri Harsha Juttu (Machine Learning Engineer), the BiteLog mission, and the privacy manifesto.
* **Direct 1-Tap APK Download**: Replaced repository release links with direct binary download URLs for immediate installation on Android phones without navigating GitHub asset pages.
* **Optimized CI/CD Release Pipeline**: Updated GitHub Actions automated build workflow to package and publish `BiteLog-v1.3.apk` on demand with Java JDK 21 and Android SDK 36.

### 📦 Version 1.2
* **Automated Android APK CI/CD Pipeline**: GitHub Actions workflow automatically compiles `BiteLog-v1.2.apk` using Gradle and publishes directly to GitHub Releases.
* **Capacitor Android Native Shell**: Embedded lightweight offline web client into native Android APK wrapper (`com.bitelog.app`).

### 🎨 Version 1.1
* **Rebranding to BiteLog**: Official transition to "BiteLog" with the motto: *Log every bite. Stay on track. Achieve your goal.*
* **Reports & Export Engine (Designs 2 & 3)**: Added 6 selectable intervals, dual-area spline chart, target indicator line, CSV download, and print-ready PDF preview modal.

### 🌱 Version 1.0
* **Core Offline Engine**: Google Gemma 3n offline visual food calorie estimation, Mifflin-St Jeor metabolic calculator, on-device SQLite database, and monthly calendar drill-down.
