# Review Window Assets — Provenance & Integrity Registry

This directory contains visual and documentation assets for the Happy Duck AI **Repetition Removal Review Window** feature (introduced in extension version 1.11.8, commit `e9cc630`).

In strict compliance with project transparency and integrity rules, every file is classified by its exact generation method:

| File | Classification | Details |
| :--- | :--- | :--- |
| `rv_01_before_cut.png` | **STAGED (Real UI)** | Live CEP extension panel inside Premiere Pro, captured via CDP on port 8889 at 1040x1500 @2x. Real English UI elements, static ready state. |
| `rv_02_review_window_open.png` | **STAGED (Real UI)** | Live CEP extension panel inside Premiere Pro, captured via CDP on port 8889 at 1040x1500 @2x. Real DOM `#rep-review-modal` rendered by the extension's actual CSS/JS, populated with realistic dialect test rows to demonstrate the review list before cut. |
| `rv_03_item_selected.png` | **STAGED (Real UI)** | Live CEP panel via CDP; Row 3 focused with real DOM hover/highlight CSS styling and green glow. |
| `rv_04_user_unchecks_one.png` | **STAGED (Real UI)** | Live CEP panel via CDP; Row 3 restored (`del = false`), metrics and button label recomputed dynamically by the extension's real `updateSummary()` logic. |
| `rv_05_confirm.png` | **STAGED (Real UI)** | Live CEP panel via CDP; confirm button in active focused state. |
| `rv_06_after_apply.png` | **STAGED (Real UI)** | Live CEP panel via CDP; modal dismissed, real toast notification displayed. |
| `rv_tl_before.png` | **HISTORICAL REAL CAPTURE** | Frame extracted from historical project screen recording `media/cut_demo.mp4` (00:00:00) showing full 1920x1080 Premiere Pro workspace before cut. |
| `rv_tl_after.png` | **HISTORICAL REAL CAPTURE** | Frame extracted from historical project screen recording `media/cut_demo.mp4` (00:00:20) showing full 1920x1080 Premiere Pro workspace after cut and ripple delete. |
| `SYNTHETIC_rv_tl_during_review.png` | **COMPOSITE** | Synthetically composited image: the live review modal (`rv_02`) overlaid onto the panel region of `rv_tl_before.png`. Marked with `SYNTHETIC_` prefix. |
| `SYNTHETIC_rv_flow.mp4` | **SYNTHETIC ANIMATION** | Rendered via PIL and FFmpeg (14s @ 30fps) animating an artificial mouse cursor over still UI frames to illustrate the click flow. Marked with `SYNTHETIC_` prefix. NOT a live screen capture. |
| `facts.md` | **DOCUMENTATION** | Rigorous engineering fact sheet directly cited from source code `file:line` references (`smartcut.js`, `main.js`, `index.html`, `captions.css`). |
