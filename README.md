# Simple Python POS Webstore

React/Vite customer webstore for the Simple Python POS system.

Live site:

```text
https://patala-pay-webstore.vercel.app/
```

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
VITE_API_BASE=https://patala-pay-pos-api.vercel.app
```

Use a permanent public API URL for products, customer login, order creation, and PayFast redirects.

When the POS API is deployed, set its `PUBLIC_STORE_URL` to:

```text
https://patala-pay-webstore.vercel.app
```
