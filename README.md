# HomelabARR Mobile Companion

> Manage your HomelabARR CE instance from your phone or tablet.

[![Download on the App Store](https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg)](https://apps.apple.com/us/app/homelabarr-mobile/id6761244772)

Expo SDK 55 WebView wrapper around the existing HomelabARR CE dashboard (which is already mobile-responsive).

## Download

- **iOS**: [App Store](https://apps.apple.com/us/app/homelabarr-mobile/id6761244772) (live)
- **Android**: Coming soon

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

## Setup

1. Download from the [App Store](https://apps.apple.com/us/app/homelabarr-mobile/id6761244772)
2. Enter your HomelabARR CE server URL (e.g. `http://192.168.1.195:8084`)
3. Optionally enter your API key for authenticated access
4. Tap Connect

## Supported Server Connections

- **Local IP**: `http://192.168.1.195:8084`
- **Tailscale**: `https://homelabarr.tailnet-name.ts.net`
- **Public domain**: `https://homelabarr.example.com`
- **Cloudflare Tunnel**: Any HTTPS URL

## Development

```bash
cd homelabarr-mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

## Build

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

The CE dashboard is already fully responsive, so this is intentionally thin: URL setup, WebView, done.

## Related

| Repo | Description |
|------|-------------|
| [imogenlabs/eightly](https://github.com/imogenlabs/eightly) | HomelabARR CE / Eight.ly Container Edition |
| [imogenlabs/eightly-os](https://github.com/imogenlabs/eightly-os) | Eight.ly OS (Professional + OS editions) |
| [imogenlabs/eightly-os-mobile](https://github.com/imogenlabs/eightly-os-mobile) | Eight.ly OS tablet companion app |

---

Built by [Imogen Labs](https://imogenlabs.ai)
