# Deploy to GitHub Pages

This command deploys the treasure hunt game to GitHub Pages. The frontend is hosted on GitHub Pages
and the backend API (auth + scores) runs on Vercel with MongoDB Atlas.

## Automated Deployment Process

Claude will automatically handle:
1. Authentication verification and GitHub CLI login
2. Repository creation or validation
3. Remote URL configuration
4. Vite base path + API URL configuration for GitHub Pages
5. Build and deployment

## Command Logic

```bash
# Step 1: Check authentication status
gh auth status

# Step 2: If not authenticated, login
gh auth login

# Step 3: Check current git remote and permissions
git remote -v
gh repo list

# Step 4: Handle repository access issues
# If permission denied to current remote:
# - Check if user owns a repository with same name
# - If not, create new repository: gh repo create REPO_NAME --public
# - Update remote URL: git remote set-url origin https://github.com/USERNAME/REPO_NAME.git

# Step 5: Build with GitHub Pages base path and Vercel API URL
# vite.config.ts uses: base: process.env.VITE_BASE_PATH || '/'
# App.tsx / AuthScreen.tsx use: import.meta.env.VITE_API_URL || ''
VITE_BASE_PATH=/REPO_NAME/ VITE_API_URL=https://YOUR_VERCEL_APP.vercel.app npm run build

# Step 6: Push source code and deploy build to gh-pages branch
npm install --save-dev gh-pages
git add -A && git commit -m "Deploy update"
git push -u origin main
npx gh-pages -d build -b gh-pages

# Step 7: Display completion message
echo "Deployment complete! Your game will be available at:"
echo "https://USERNAME.github.io/REPO_NAME"
echo ""
echo "Note: It may take a few minutes for the site to be live."
```

## Architecture

- **Frontend**: GitHub Pages (`https://USERNAME.github.io/REPO_NAME`)
- **Backend API**: Vercel serverless functions (`https://YOUR_APP.vercel.app/api/...`)
- **Database**: MongoDB Atlas (connected via Vercel env var `MONGODB_URI`)

## Environment Variables Used at Build Time

| Variable | Purpose | Example |
|---|---|---|
| `VITE_BASE_PATH` | Vite base path for GitHub Pages sub-path | `/claude_code_treasure_game/` |
| `VITE_API_URL` | Vercel backend URL for API calls | `https://myapp.vercel.app` |

## What This Does

1. Verifies GitHub authentication and logs in if needed
2. Checks repository access and creates new repo if permission denied
3. Updates git remote URL to match authenticated user
4. Builds with correct base path (`/REPO_NAME/`) and Vercel API URL baked in
5. Pushes source code to main branch
6. Deploys `build/` folder to `gh-pages` branch
7. GitHub Pages serves the static frontend from `gh-pages` branch
8. All `/api/` calls go to the Vercel deployment (MongoDB Atlas backend)

## Common Scenarios Handled

### Authentication Issues
- **Not logged in**: Automatically prompts for `gh auth login`
- **Wrong account**: Creates new repository under authenticated user
- **Permission denied**: Creates new repository and updates remote URL

### Repository Issues
- **No remote**: Sets up remote to new repository
- **Wrong remote**: Updates remote URL to match authenticated user
- **Repository doesn't exist**: Creates new public repository

### Backend Issues
- **Sign-in not working**: Ensure `VITE_API_URL` is set to your Vercel deployment URL
- **CORS errors**: Vercel serverless functions handle CORS automatically

## Troubleshooting

- **404 errors**: GitHub Pages enabled automatically when using gh-pages deployment
- **Site not updating**: GitHub Pages can take 5-10 minutes to reflect changes
- **Assets not loading (blank page)**: Ensure `VITE_BASE_PATH` matches the repo name exactly
- **Browser shows old version**: Hard refresh (Cmd+Shift+R / Ctrl+F5) or try incognito mode
- **Cannot reach server**: Ensure `VITE_API_URL` points to your live Vercel deployment
- **Build fails**: Check that all dependencies are installed with `npm install`

## Manual Override Options

```bash
# Use existing repository (must have push access)
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Build with specific URLs
VITE_BASE_PATH=/my-repo/ VITE_API_URL=https://my-app.vercel.app npm run build
```

## Clean up (Optional)
```bash
gh auth logout
git branch --unset-upstream
```
