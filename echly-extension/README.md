# Echly Chrome Extension

Capture screenshots and submit feedback to the Echly backend with Firebase Auth.

## Setup (required for Google Sign-In)

1. **Chrome OAuth2 Client ID**  
   In [Google Cloud Console](https://console.cloud.google.com/) (same project as Firebase):
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: **Chrome app**
   - Add your extension ID (from `chrome://extensions` when the extension is loaded)
   - Copy the **Client ID** (e.g. `123...abc.apps.googleusercontent.com`)

2. **Update `manifest.json`**  
   Replace the placeholder with your Client ID:
   ```json
   "oauth2": {
     "client_id": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",
     ...
   }
   ```

3. **Build the extension**  
   From the repo root:
   ```bash
   npm run build:extension
   ```

4. **Load in Chrome**  
   `chrome://extensions` → Load unpacked → select the `echly-extension` directory.

## Production

- Backend must validate `Authorization: Bearer <firebase-id-token>` (Firebase Admin Auth).
- Extension sends the Firebase ID token on every API request via `apiFetch()`.
