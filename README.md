# Dhairya Bhatia — Personal Site

Genesis Cube x NeXT-inspired personal workstation site.

## File structure

```
├── index.html      # Main page
├── style.css       # All styles
├── photo.jpg       # Profile photo
├── _headers        # Cloudflare Pages cache rules
├── _redirects      # Cloudflare Pages routing
└── README.md
```

## Deploy to Cloudflare Pages

### Option A — GitHub (recommended, auto-deploys on push)

1. Push this folder to a GitHub repo (public or private)
2. Go to https://dash.cloudflare.com → Workers & Pages → Create → Pages
3. Connect to Git → select your repo
4. Build settings:
   - Framework preset: **None**
   - Build command: *(leave blank)*
   - Build output directory: `/` (or `.`)
5. Click Deploy

Every `git push` to main will auto-deploy.

### Option B — Direct upload (no Git needed)

1. Go to https://dash.cloudflare.com → Workers & Pages → Create → Pages
2. Click **"Upload assets"**
3. Drag and drop this entire folder
4. Click Deploy

## Updating the site

- Edit `index.html` for content changes
- Edit `style.css` for style changes
- Replace `photo.jpg` to update your photo (keep the same filename)
- If you rename `style.css`, update the `<link>` tag in `index.html` to match

## Custom domain

In Cloudflare Pages → your project → Custom domains → Add domain.
If your domain DNS is already on Cloudflare, it connects in ~1 minute.
