# frontend

React app, built with Stitch + Antigravity. Drop the generated project's
contents directly into this folder and delete its inner `.git` so it is not a
nested repo.

## Local dev

    npm install
    echo VITE_API_BASE_URL=http://localhost:8000 > .env.local
    npm run dev

## Notes

- Base API URL always comes from `import.meta.env.VITE_API_BASE_URL` — never
  hardcode it.
- The Monaco review surface (line selection + marking) is hand-integrated, not
  generated. It must send the `POST /grade` payload from `../CONTRACT.md`:
  `{ exercise_id, selected_lines (1-indexed), explanation }`.
- Screens to build: exercise list, review surface, results screen, weakness
  bar chart.
