# Dhairya Bhatia — Personal Site!!!!!!!

My Personal Website inspired by NeXTSTEP and Sega Genesis

## Features:

- My Portfolio
- Publications (from `data/publications.json`)

## Local preview

```sh
python3 -m http.server   # then open http://localhost:8000
```

The terminal + CTF is a separate site:
[nextcube-terminal](https://github.com/dhairyab0069/nextcube-terminal).

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
