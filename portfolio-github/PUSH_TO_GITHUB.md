# How to Push This Repository to GitHub

Follow these step-by-step instructions to push this portfolio to your GitHub account.

## Prerequisites

- Git installed on your computer
- GitHub account: https://github.com/PriyankaSaha01

## Step 1: Create a New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `priyanka-portfolio` (or any name you prefer)
3. Description: "My personal 3D portfolio website"
4. Set to **Public**
5. **DO NOT** initialize with README, .gitignore, or License (we already have them)
6. Click **Create repository**

## Step 2: Extract This Zip File

Extract the zip file to a folder on your computer (e.g., Desktop/priyanka-portfolio)

## Step 3: Open Terminal/Command Prompt

Navigate to the extracted folder:

```bash
cd path/to/priyanka-portfolio
```

## Step 4: Initialize Git and Push

Run these commands one by one:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: 3D Portfolio Website"

# Set main branch
git branch -M main

# Add GitHub remote (replace URL with YOUR repo URL)
git remote add origin https://github.com/PriyankaSaha01/priyanka-portfolio.git

# Push to GitHub
git push -u origin main
```

## Step 5: Authentication

When prompted, you'll need to authenticate:

### Option A: Using Personal Access Token (Recommended)

1. Go to https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Give it a name like "Portfolio Push"
4. Select scope: **repo** (full control of private repositories)
5. Click **Generate token**
6. **Copy the token** (you won't see it again!)
7. When git asks for password, **paste the token** (not your GitHub password)

### Option B: Using GitHub Desktop (Easier for beginners)

1. Download GitHub Desktop: https://desktop.github.com/
2. Open it and sign in with your GitHub account
3. Click "Add Existing Repository"
4. Select the extracted folder
5. Click "Publish repository"

## Step 6: Verify

Go to https://github.com/PriyankaSaha01 and you'll see your new repository!

## Next: Deploy to Live Website

Once your code is on GitHub, you can deploy it for free:

### Vercel (Easiest)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Import Project"
4. Select your repository
5. Click "Deploy"

Your portfolio will be live in 1-2 minutes!

### Netlify
1. Go to https://netlify.com
2. Sign in with GitHub
3. Click "Add new site" -> "Import an existing project"
4. Select your repository
5. Build command: `yarn build`
6. Publish directory: `build`
7. Click "Deploy"

## Troubleshooting

### "Permission denied" error
- Make sure you're using a Personal Access Token, not your password
- Ensure the token has `repo` scope

### "Remote already exists" error
- Run: `git remote remove origin` then try again

### "Branch main does not exist"
- Run: `git branch -M main` before pushing

## Need Help?

Contact: priyanka.riya2003@gmail.com

---

Good luck with your portfolio!
