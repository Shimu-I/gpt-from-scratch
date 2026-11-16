# GPT from Scratch: Project Tracker

A static, backend-free progress tracker for the eight-stage GPT-from-scratch roadmap (101 micro-tasks).

## Structure

```
index.html          entry point (repository root)
css/styles.css      styling
js/state.js         state, localStorage, events, sessions
js/analytics.js     analytics tab
js/tracker.js       stage list, tasks, journal
js/backup.js        export, validated import, backup status
js/main.js          loads data/roadmap.json and starts the app
data/roadmap.json   the static roadmap (never modified by the app)
assets/favicon.svg  icon
```

## Deploy on GitHub Pages

1. Put these files in the repository root on the `main` branch.
2. Settings, Pages, Source: "Deploy from a branch", Branch: `main`, folder `/ (root)`.
3. Open `https://<user>.github.io/<repo>/`.

All paths are relative, so it works under a project subpath. To run locally: `python3 -m http.server`, then open http://localhost:8000. Opening `index.html` straight from disk will not load the roadmap, because browsers block `fetch` on `file://`.

## Where your data lives

- The roadmap is in `data/roadmap.json`. Edit it and push to change tasks. Task progress is keyed by stage and task position, so add new tasks at the end of a stage rather than reordering.
- Your progress is in this browser's localStorage under `gpt-scratch-tracker-v2`: task statuses, journal, activity history, sessions, snapshots, and the last backup time.
- localStorage is per browser and per device. It does not sync, and pushing code to GitHub does not upload your progress. Clearing site data erases it.
- Use Export JSON to back up and Import backup to restore or move to another browser. Imports are validated and need confirmation before they replace anything.
- Do not store passwords or private information in the journal or notes. Backup files are plain text.
