# HomelabARR Mobile Companion

> Manage your HomelabARR CE instance from your phone.

Expo SDK 55 WebView wrapper around the existing HomelabARR CE dashboard (which is already mobile-responsive).

## Features

- **First-launch setup** — enter server URL + optional API key
- **AsyncStorage persistence** — remembers your server across launches
- **Dark/light mode** — follows system theme, syncs with CE dashboard
- **Pull-to-refresh** — swipe down to reload
- **Back navigation** — swipe gesture + header back button
- **External links** — opens in system browser
- **Connection error handling** — retry/change server on failure
- **Haptic feedback** — on connect/disconnect actions
- **NSAllowsLocalNetworking** — works with local IPs (192.168.x.x, Tailscale, etc.)

## Quick Start

```bash
cd homelabarr-mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

## Build for App Store / Google Play

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build
eas build --platform ios
eas build --platform android
```

## Architecture

Single-file app (`App.tsx`). No router needed — the WebView handles all navigation internally.

The CE dashboard is already fully responsive, so this is intentionally thin: URL setup → WebView → done.

## Supported Server Connections

- **Local IP**: `http://192.168.1.195:3000`
- **Tailscale**: `https://homelabarr.tailnet-name.ts.net`
- **Public domain**: `https://homelabarr.example.com`
- **Cloudflare Tunnel**: Any HTTPS URL

---

Built by [Imogen Labs](https://imogenlabs.ai) 🐙
