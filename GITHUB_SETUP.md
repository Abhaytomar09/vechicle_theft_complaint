# Quick Guide: Push to GitHub

Follow these simple steps to push your project to GitHub.

## Prerequisites

- GitHub account (create one at https://github.com if you don't have one)
- Git installed on your computer (download from https://git-scm.com/downloads)

## Method 1: Using GitHub Desktop (Easiest)

### Step 1: Install GitHub Desktop
- Download from: https://desktop.github.com/
- Install and login with your GitHub account

### Step 2: Add Your Project
1. Open GitHub Desktop
2. Click **File → Add Local Repository**
3. Click **Choose...** and select your project folder (`vechile_theft_system`)
4. If it says "This is not a Git repository", click **"create a repository"**
   - Name: `vehicle-theft-system` (or any name you like)
   - Leave other options as default
   - Click **"Create Repository"**

### Step 3: Commit and Push
1. In GitHub Desktop, you'll see all your files listed as "changes"
2. At the bottom left, enter a commit message: `"Initial commit: Vehicle Theft Complaint System"`
3. Click **"Commit to main"**
4. Click **"Publish repository"** (top right)
5. Choose a name (or keep the default)
6. Choose if you want it public or private
7. Click **"Publish Repository"**

✅ **Done!** Your code is now on GitHub.

## Method 2: Using Command Line

### Step 1: Open Terminal/Command Prompt
- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac/Linux**: Open Terminal
- Navigate to your project folder:
  ```bash
  cd "C:\Users\abhay\OneDrive\Desktop\atproject\vechile_theft_system"
  ```
  (Replace with your actual path)

### Step 2: Initialize Git
```bash
git init
```

### Step 3: Add All Files
```bash
git add .
```

### Step 4: Create First Commit
```bash
git commit -m "Initial commit: Vehicle Theft Complaint System"
```

### Step 5: Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `vehicle-theft-system` (or any name)
3. Choose **Public** or **Private**
4. **DO NOT** check "Initialize with README"
5. Click **"Create repository"**

### Step 6: Connect and Push
1. Copy the repository URL (GitHub will show it after creating)
2. Run these commands (replace URL with your actual repository URL):
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/vehicle-theft-system.git
   git branch -M main
   git push -u origin main
   ```
3. Enter your GitHub username and password when prompted

✅ **Done!** Your code is now on GitHub.

## Verify It Worked

1. Go to https://github.com/YOUR-USERNAME/vehicle-theft-system
2. You should see all your files there!

## Next Steps

After pushing to GitHub, you can:
1. Deploy to a hosting platform (see [DEPLOYMENT.md](DEPLOYMENT.md))
2. Share the code with others
3. Collaborate with team members
4. Track changes and versions

## Common Issues

**Issue: "fatal: not a git repository"**
- Solution: Run `git init` first (see Step 2)

**Issue: Authentication failed**
- Solution: Use GitHub Personal Access Token instead of password
  - Go to GitHub → Settings → Developer settings → Personal access tokens
  - Generate a new token with `repo` permissions
  - Use the token as password

**Issue: "repository not found"**
- Solution: Make sure the repository exists on GitHub and the URL is correct

## Need Help?

- Git documentation: https://git-scm.com/doc
- GitHub help: https://docs.github.com
- GitHub Desktop help: https://docs.github.com/en/desktop
