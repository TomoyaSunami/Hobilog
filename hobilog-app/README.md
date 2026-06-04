# HobiLog

HobiLog is a personal habit tracking PWA implemented from `doc/要件定義書v1.0.md` and `doc/ワイヤーフレーム設計v1.0.md`.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run build
```

## GitHub Pages

The app is configured for the repository Pages URL:

```text
https://tomoyasunami.github.io/Hobilog/
```

Push to `master` to run the GitHub Actions workflow and deploy `hobilog-app/out`.

For a local static export that matches GitHub Pages paths in PowerShell:

```powershell
$env:GITHUB_PAGES = "true"
npm run build
Remove-Item Env:\GITHUB_PAGES
```

For bash:

```bash
GITHUB_PAGES=true npm run build
```

This workspace's current bash environment does not provide a working Node.js runtime. Use Node.js 20 or later on Windows or WSL2 to install dependencies and run the app.
