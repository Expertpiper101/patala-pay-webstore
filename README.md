# Simple Python POS Webstore

React/Vite customer webstore for the Simple Python POS system.

## Local Development

```powershell
npm install
$env:VITE_API_BASE="http://127.0.0.1:8090"
npm run dev
```

## Vercel

Use these Vercel settings:

- Framework preset: `Vite`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

Set this Vercel environment variable before deploying:

```text
VITE_API_BASE=https://your-public-pos-api-url
```

Use a permanent public API URL for products, customer login, order creation, and PayFast redirects.
