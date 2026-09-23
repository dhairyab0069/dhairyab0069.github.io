# Dhairya Bhatia — Personal Site!!!!!!!

My Personal Website inspired by NeXTSTEP and Sega Genesis

## Features:

- My Portfolio
- miniCTF challenge (terminal: [nextcube-terminal](https://github.com/dhairyab0069/nextcube-terminal))
- Publications (from `data/publications.json`)

## Local preview

The Workbench terminal lives in its own repo,
[nextcube-terminal](https://github.com/dhairyab0069/nextcube-terminal). In
production it's served at `/nextcube-terminal/` and embedded in an iframe. To
preview both together, clone it next to this repo and run:

```sh
scripts/dev.sh           # then open http://localhost:8000
```

Plain `python3 -m http.server` still works for everything except the terminal.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to Pages on
every push to `main`. Pull requests run the same checks without deploying.

`node .github/scripts/build.mjs` builds `_site/`. It:
- cache-busts CSS and every ES module import with `?v=<sha>`
- writes `version.json`
- fails if any local file or import is missing, a module has a syntax error,
  or a JSON file is invalid

CI also runs `html-validate` (blocking) and a lychee external link check
(report only). Other workflows can trigger a redeploy with a
`repository_dispatch` event of type `rebuild`.
