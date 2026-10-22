# UrbanGo Mobile Dashboard

UrbanGo is a responsive bike-share analytics dashboard packaged as a Progressive Web App (PWA).

## Files
- `index.html` — dashboard markup and demo login screen
- `style.css` — dashboard styling and mobile responsive layout
- `script.js` — charts, filters, sample data, CSV upload/export
- `manifest.webmanifest` — installable app metadata
- `service-worker.js` — caches core files for repeat/offline visits
- `icon.svg` — app icon

## Run locally
Open the folder in VS Code and use Live Server. A service worker and PWA installation require `localhost` or HTTPS; opening the file directly with `file://` will not enable those features.

## Deploy to Vercel
1. Upload/push all files to the same GitHub repository/folder.
2. Set Vercel's Root Directory to the folder containing `index.html`.
3. Use Framework Preset `Other` and leave Build Command blank for this static project.
4. Deploy. Vercel provides HTTPS, which is required for PWA installation.

## Install on Android
1. Open the deployed HTTPS URL in Chrome.
2. Open the browser menu (⋮).
3. Tap **Install app** or **Add to Home screen**.
4. Launch UrbanGo from the home screen.

## Login limitation — important
The included login screen is a front-end demo only. It checks email formatting and password length, then opens the dashboard. It does **not** verify credentials and is not secure authentication. 

## Data limitation
The present data are only for the presentation purpose only to understand the working of the app.
The initial dataset is generated sample data. Use a compatible CSV to analyze real data. Do not present sample results as real-world findings.
