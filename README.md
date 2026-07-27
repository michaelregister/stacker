<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Stacker Pro

This contains everything you need to run your app locally.

Live app: https://slstacker-be1ef.web.app/

View your app in AI Studio: https://ai.studio/apps/drive/1zP15b3hOg4EXfLhfFGp6v8V4g7TEv10t

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key (used for parsing item descriptions when adding to your stack)
3. Add a Firebase service account key as `service-account-key.json` in the project root (used by the Express backend to read/write your stack to Firestore — generate one from Project Settings > Service Accounts in the [Firebase console](https://console.firebase.google.com/project/slstacker-be1ef/settings/serviceaccounts/adminsdk))
4. Run the backend API:
   `npm run server`
5. In a separate terminal, run the frontend:
   `npm run dev`
6. Open the app at the URL printed by Vite (defaults to http://localhost:3001) and sign in with Google to start adding items

Note: gold and silver spot prices are fetched directly from [gold-api.com](https://gold-api.com) and don't require an API key.

## Deploy

The app is hosted on Firebase Hosting + Cloud Functions (project `slstacker-be1ef`) at https://slstacker-be1ef.web.app/.

1. Build the frontend: `npm run build` (outputs to `public/`, per `vite.config.ts`)
2. Deploy: `firebase deploy`
