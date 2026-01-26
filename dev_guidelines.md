# Development & Versioning Guidelines

## 1. Versioning Strategy (Semantic Versioning)
We strictly follow SemVer (X.Y.Z). Update `package.json` based on the change type:
* **Major (X.0.0):** Breaking changes / New Architecture.
* **Minor (0.X.0):** New features (New game logic, levels, medals).
* **Patch (0.0.X):** Bug fixes, UI tweaks, text corrections.

## 2. Changelog Protocol
Always update `CHANGELOG.md` when a task is completed.
* **Format:** "Keep a Changelog" format.
* **Language:** The section headers (Added, Fixed) can remain in English, but the **content descriptions MUST be in Hebrew**.
* **Structure:**
    ```markdown
    ## [Version] - YYYY-MM-DD
    ### Added
    - פירוט הפיצ'רים החדשים בעברית...
    ### Fixed
    - פירוט התיקונים בעברית...
    ```

## 3. Workflow Rule (The "Auto-Run" Trigger)
**Definition of Done:**
Every time you complete a coding task, you **MUST automatically**:
1. Determine the SemVer bump.
2. Update `package.json`.
3. Update `CHANGELOG.md` in Hebrew.
4. **Do not ask for permission** to update these files—just do it as part of the task completion.
