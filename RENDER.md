# #4471 split: page and render

- Page: `src/routes/kb/incidents/4471-problems/+page.svx` (signed; ends with `<RenderStamp {signature} />`).
- Its logic: `src/lib/kb/problems.ts` and `src/lib/kb/ProblemTable.svelte`.
- The page as the desk sees it: `build/kb/incidents/4471-problems.html` (from `npm run build`), and `rendered/4471-problems-top.jpg`.
- Tickets: issues #4 (`parser`), #5 (`hint`), #6 (`one-day`).

Everything else is the kb export of 4 October, unchanged, plus a minimal SvelteKit + mdsvex frame
(`package.json`, `svelte.config.js`, `vite.config.js`, `src/app.html`, `src/routes/+layout.js`) to render it.
Build: `npm install && npm run build`.
