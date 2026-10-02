# Happy Duck AI — Repetition Removal Review Window (Feature Facts)

> **Document Status:** Authoritative engineering specification & behavioral analysis grounded in real codebase implementation (`extension/js/smartcut.js`, `extension/index.html`, `extension/js/main.js`, `extension/css/captions.css`).
> **Git Commit:** `e9cc6302ca0e9ee675400af37e8c92d5103893cf` ("feat(smartcut): review window before repetition removal deletes anything")
> **Shipped In Extension Version:** `1.11.8` (`extension/CSXS/manifest.xml:2`)

---

## 1. Exact UI Names & Strings (English & Arabic)

Sourced directly from `extension/js/main.js` (lines 482–491 for English, lines 616–625 for Arabic) and `extension/index.html` (lines 940–960):

| UI Element / Key | English String (`i18n.en`) | Arabic String (`i18n.ar`) | Code Location (`main.js` / `index.html`) |
| :--- | :--- | :--- | :--- |
| **Modal Title** (`rep-review-title`) | `Review cuts before applying` | `راجِع الحذف قبل التنفيذ` | `main.js:482`, `main.js:616`, `index.html:942` |
| **Title Icon** | `✂️` (CSS pseudo `::before`) | `✂️` (CSS pseudo `::before`) | `captions.css:358` |
| **Counter Badge** (`rep-review-count`) | `{d} of {t}` (e.g. `3 of 5`) | `{d} من {t}` (e.g. `3 من 5`) | `main.js:483`, `main.js:617`, `smartcut.js:960` |
| **Summary: Deletion** (`rep-review-sum-del`) | `Removing {n} segments · {s}s` | `هيتحذف {n} مقاطع · {s} ث` | `main.js:484`, `main.js:618`, `smartcut.js:961` |
| **Summary: Kept** (`rep-review-sum-keep`) | `Keeping {n} segments · {s}s` | `هيفضل {n} مقاطع · {s} ث` | `main.js:485`, `main.js:619`, `smartcut.js:962` |
| **Instruction Hint** (`rep-review-hint`) | `Click a time to hear that segment` | `اضغط على الوقت عشان تسمع المقطع` | `main.js:486`, `main.js:620`, `index.html:950` |
| **Action Button** (`rep-review-apply`) | `✓ Delete {n} segments` | `✓ احذف {n} مقاطع` | `main.js:487`, `main.js:621`, `smartcut.js:963` |
| **Toggle: Restore Tooltip** (`rep-review-restore`) | `Keep it` (icon: `↩`) | `رجّعه` (icon: `↩`) | `main.js:488`, `main.js:622`, `smartcut.js:967` |
| **Toggle: Remove Tooltip** (`rep-review-remove`) | `Delete it` (icon: `🗑`) | `احذفه` (icon: `🗑`) | `main.js:489`, `main.js:623`, `smartcut.js:967` |
| **Cancel Button** (`rep-review-cancel`) | `✕ Cancel` | `✕ إلغاء` | `index.html:952` (`cancel-btn`) |
| **Toast: User Cancelled** (`rep-review-cancelled`) | `Repetition removal cancelled — no speech was deleted` | `تم إلغاء حذف التكرار — لم يُحذف أي كلام` | `main.js:490`, `main.js:624`, `smartcut.js:1028` |
| **Toast: Stale Timeline** (`rep-review-stale`) | `The timeline changed — run the analysis again` | `التايم لاين اتغيّر — أعد التحليل` | `main.js:491`, `main.js:625`, `smartcut.js:1034` |
| **Toast: Success Deletion** (`sc-clips-deleted`) | `Deleted {n} clips successfully ✓` | `تم حذف {n} كليب بنجاح ✓` | `main.js:447`, `smartcut.js:1162`, `smartcut.js:1360` |

---

## 2. Step-by-Step Workflow & User Controls

### Execution Pipeline (`smartcut.js:1019-1037`):
1. **Triggering Analysis:**
   The user selects a clip on the Premiere timeline, switches to the Smart Cut tab, selects **Repetition Removal** mode (`cut-mode-repetition`), and clicks **"Cut & Clean"** (`#scan-mark-btn`).
2. **Audio Extraction & Cloud Evaluation:**
   The extension extracts audio, splits at lexical Whisper word boundaries, evaluates retakes with cloud AI (`gemini-3.5-flash-lite`), and receives the list of candidate `startsToDelete`.
3. **Modal Gate (`confirmRepetitionDeletes`):**
   - The engine calls `buildRepReviewRows(transcript, startsToDelete, clips)` (`smartcut.js:913`).
   - If no spoken sentences are proposed for deletion (e.g. only silent fragment cleanup), the modal is bypassed and execution proceeds directly (`smartcut.js:1022`).
   - If spoken speech is proposed for deletion, the timeline state is fingerprinted (`_repTimelineSignature()`, `smartcut.js:1024`), the floating Duck chat button is temporarily hidden (`smartcut.js:994`), and the `#rep-review-modal` slides open (`smartcut.js:999`).
4. **What the User Can Change:**
   - **Keep/Delete Per Row:** The user can click the toggle button on any row.
     - If marked for deletion (`r.del = true`): styled with line-through, soft red background (`rgba(255,77,77,.07)`), toggle shows `↩` ("Keep it").
     - Clicking `↩` restores the take (`r.del = false`): line-through removed, background restored, toggle shows `🗑` ("Delete it").
   - **Live Audio Audition (Playhead Jump):**
     Clicking any time chip (`.cap-review-time`) triggers `runJSX('setPlayhead', { seconds: r.start })` (`smartcut.js:976`). Premiere Pro immediately seeks its playhead to that exact frame so the editor can press spacebar and listen before deciding!
   - **Live Metric Updates:** Every toggle click immediately re-calculates deleted count, kept count, deleted duration (seconds), kept duration (seconds), and updates the apply button label (`smartcut.js:955-965`).
   - **Boundary Editing:** Text and cut boundaries are read-only in this modal (not editable inline), because cut positions are strictly tied to Whisper word timestamps and audio waveforms.
5. **Is it ALWAYS shown or optional?**
   - **Always active (Mandatory Guard):** There is NO setting to disable it. It is hardcoded as an architectural invariant gate in both Phase 2 engines (`runPhase2RepetitionRemoval`, `smartcut.js:1156` and `runPhase2RepetitionRemovalV3`, `smartcut.js:1354`).
   - **Conditional Display:** It only appears if there is at least one spoken sentence proposed for deletion (`rows.some(r => r.del)`). If the server proposes 0 speech deletions, it does not pop up unnecessarily.

---

## 3. Strict Guarantees & Silence Cut Behavior

### A. Repetition Removal Guarantee:
> **"Nothing is deleted from the timeline before the user explicitly clicks the apply button."**
- **Strictly 100% True:** In `smartcut.js:1019-1037`, the JSX deletion call `runJSX('deleteClipsByTimelineStart', { starts: finalStarts })` is gated strictly behind `await reviewRepetitionDeletes(rows, fixedDeletes)`.
- If the user clicks **Cancel** or presses Escape: `resolve(null)` is returned. The engine logs `Review: cancelled by user — nothing deleted`, shows toast `rep-review-cancelled`, and returns `0`. Not a single razor cut or ripple delete touches the timeline.
- **Timeline Stale Protection:** The timeline signature (`_repTimelineSignature()`, `smartcut.js:1009`) compares clip count and timeline boundary timestamps before opening and after user confirmation. If the user trimmed, shifted, or added clips in Premiere while the review modal was sitting open, deletion is **refused** (`smartcut.js:1032-1036`) to prevent cutting the wrong clips!

### B. Silence Mode (Phase 1) Contrast:
- **Silence Cut does NOT show a review window.**
- Silence cutting runs 100% locally via embedded Silero V4 VAD and FFmpeg. Because silence detection is an exact acoustic threshold (dB + minimum duration) rather than a probabilistic linguistic judgment, Phase 1 executes its razor cuts and ripple deletes directly upon analysis completion.
- The review window was engineered specifically for **Phase 2 (Repetition Removal)**.

---

## 4. Version History, Cancellation & Undo Behavior

- **Introduced In:** Extension version `1.11.8` (commit `e9cc6302ca0e9ee675400af37e8c92d5103893cf`, Oct 1, 2026).
- **Cancellation Result:**
  - Modal smoothly animates out (`modal.classList.remove('active')`, `smartcut.js:987`).
  - Floating Duck Chat restored (`smartcut.js:986`).
  - Zero timeline modifications.
  - Toast displayed: *"Repetition removal cancelled — no speech was deleted"*.
- **Undo Behavior:**
  - If applied, the deletion is executed as an atomic Premiere Pro history transaction (`deleteClipsByTimelineStart`).
  - Pressing `Ctrl+Z` (`Cmd+Z` on macOS) in Premiere Pro undoes the ripple deletion cleanly in a single step, restoring all cuts.

---

## 5. Language Support, Row Merging & Limits

- **Languages:** Fully supports both **Arabic** and **English** (with bidirectional UI: RTL for Arabic, LTR for English).
  - Text rendered with `dir="auto"` (`smartcut.js:977`) so mixed Arabic/English dialect takes render with correct typography.
- **Row Merging & Word Limit (`REP_REVIEW_ROW_MAX_WORDS = 10`, `smartcut.js:911`):**
  - Consecutive speech clips sharing the same deletion decision are merged into a single coherent sentence row to prevent visual clutter from fragmented razor cuts.
  - However, rows are strictly capped at **10 words maximum**. Why? If a long 40-word monologue take was merged into one single row, restoring a sentence would be "all-or-nothing". The 10-word ceiling ensures fine-grained user control over multi-sentence takes.
- **Silent Fragment Handling:**
  - Clips with zero speech (`text.trim() === ''`) are not listed in the UI; the server's acoustic decision on them is grouped in `fixedDeletes` (`smartcut.js:916, 936`) and executed only if the user confirms the review.
- **Clip Length Limits:**
  - No artificial row ceiling; handles projects up to extension quota (e.g. 15-minute sequence processing).

---

## 6. Original Problem & Rationale (From Commit Log `e9cc630`)

Direct excerpt from engineering commit `e9cc630`:
> *"Repetition removal used to delete the moment the server's decision arrived.*
> *That decision is a probabilistic judgment over a transcript (measured: 29 of 30 real videos give a different result on re-run, and a customer lost real sentences on a badly-transcribed dialect), so every mistake silently cost content.*
> *The decision is now a proposal: it is shown, the user can restore or remove rows, and only then is the deletion applied.*
> *- unchanged review == exactly the server's list (verified on real fixtures)*
> *- the timeline is fingerprinted before/after the review; if it changed the deletion is refused instead of hitting the wrong clips."*

This review window transforms repetition removal from an opaque, destructive AI operation into a transparent, user-supervised workflow where the editor maintains 100% artistic control.
