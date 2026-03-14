Deploy this project to Vercel and return the live URL.

Follow these steps carefully:

## 1. Ensure Vercel CLI is available
Run `npx vercel --version` to confirm. If missing, run `npm install -g vercel`.

## 2. Create vercel.json if it doesn't exist
Check for `vercel.json` in the project root. If absent, create it with:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "vite"
}
```

## 3. Check Vercel login status
Run `npx vercel whoami`. If not logged in, run `npx vercel login` and follow the prompts.

## 4. Deploy to production
Run:
```bash
npx vercel --prod --yes
```
If this is the first deploy, Vercel will ask setup questions — accept all defaults (link to existing project or create new, use current directory, keep detected settings).

## 5. Return the URL
After deployment completes, extract and display the production URL from the output (it looks like `https://<project-name>.vercel.app`). Tell the user they can open this URL to see their live project.

## Important note about the backend
This project has an Express + SQLite backend (`server/`) for auth and score saving. Vercel does not support persistent SQLite databases. The deployed app will work in **guest mode only** (no sign-in or score history). To enable full auth on Vercel, the backend would need to be migrated to Vercel serverless functions with a cloud database (e.g., Vercel Postgres or PlanetScale).
