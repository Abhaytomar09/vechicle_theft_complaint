# Deployment Guide

This guide will help you deploy your Vehicle Theft Complaint System to GitHub and a hosting platform.

## Important Note

⚠️ **GitHub Pages won't work** for this project because:
- This is a **Node.js application** with a backend server
- GitHub Pages only hosts **static websites** (HTML, CSS, JS without a server)
- You need a platform that supports **Node.js backend**

## Step 1: Push to GitHub

### Option A: Using GitHub Desktop (Easiest)

1. Download and install [GitHub Desktop](https://desktop.github.com/)
2. Open GitHub Desktop
3. Click **File → Add Local Repository**
4. Select your project folder (`vechile_theft_system`)
5. Click **Publish repository** in GitHub Desktop
6. Choose a repository name (e.g., `vehicle-theft-system`)
7. Click **Publish Repository**

### Option B: Using Git Command Line

1. **Install Git** (if not already installed):
   - Download from: https://git-scm.com/downloads

2. **Open Terminal/Command Prompt** in your project folder

3. **Initialize Git repository**:
   ```bash
   git init
   ```

4. **Add all files**:
   ```bash
   git add .
   ```

5. **Create initial commit**:
   ```bash
   git commit -m "Initial commit: Vehicle Theft Complaint System"
   ```

6. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Create a new repository (don't initialize with README)
   - Copy the repository URL (e.g., `https://github.com/yourusername/vehicle-theft-system.git`)

7. **Add remote and push**:
   ```bash
   git remote add origin https://github.com/yourusername/vehicle-theft-system.git
   git branch -M main
   git push -u origin main
   ```

8. **Enter your GitHub credentials** when prompted

## Step 2: Deploy to Hosting Platform

Since this is a Node.js application, you need a hosting platform that supports Node.js. Here are the best options:

### Option 1: Render (Recommended - Free Tier Available)

**Pros:** Free tier, easy setup, automatic deployments

1. **Sign up** at https://render.com (use GitHub to sign up)

2. **Create a new Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure the service**:
   - **Name:** `vehicle-theft-system` (or any name)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

4. **Set Environment Variables** (in Environment tab):
   ```
   PORT=10000
   JWT_SECRET=your-super-secret-key-change-this-in-production
   NODE_ENV=production
   ```

5. **Click "Create Web Service"**

6. **Your app will be live** at: `https://your-app-name.onrender.com`

**Note:** Free tier apps sleep after 15 minutes of inactivity. First request may take ~30 seconds to wake up.

### Option 2: Railway (Easy Deployment)

**Pros:** Simple, good free tier, PostgreSQL available

1. **Sign up** at https://railway.app (use GitHub to sign up)

2. **Create a new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure**:
   - Railway auto-detects Node.js
   - Set environment variables:
     ```
     PORT=${{PORT}}
     JWT_SECRET=your-super-secret-key
     NODE_ENV=production
     ```

4. **Deploy** - Railway will automatically deploy

5. **Your app will be live** at: `https://your-app-name.up.railway.app`

**Note:** Free tier includes $5 credit monthly.

### Option 3: Heroku (Popular, Paid)

**Pros:** Very popular, lots of add-ons

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create app**:
   ```bash
   heroku create your-app-name
   ```

4. **Set environment variables**:
   ```bash
   heroku config:set JWT_SECRET=your-super-secret-key
   heroku config:set NODE_ENV=production
   ```

5. **Push to Heroku**:
   ```bash
   git push heroku main
   ```

**Note:** Heroku free tier was discontinued. Paid plans start at $5/month.

### Option 4: Vercel (Free Tier)

**Pros:** Great for Node.js, automatic deployments, global CDN

1. **Sign up** at https://vercel.com (use GitHub to sign up)

2. **Import project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository

3. **Configure**:
   - Framework Preset: Other
   - Build Command: Leave empty (or `npm install`)
   - Output Directory: Leave empty
   - Install Command: `npm install`
   - Development Command: Leave empty

4. **Set Environment Variables**:
   ```
   JWT_SECRET=your-super-secret-key
   NODE_ENV=production
   ```

5. **Deploy**

**Note:** Vercel works well but may need adjustments for SQLite file storage.

### Option 5: Fly.io (Free Tier)

**Pros:** Good for databases, global distribution

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**:
   ```bash
   fly auth login
   ```

3. **Create app**:
   ```bash
   fly launch
   ```

4. **Deploy**:
   ```bash
   fly deploy
   ```

## Step 3: Environment Variables Setup

Create a `.env` file in your hosting platform (or set via their dashboard):

```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=production
```

**Important:** Never commit `.env` file to GitHub! It's already in `.gitignore`.

## Step 4: Database Considerations

**SQLite in Production:**
- SQLite works for small-scale deployments
- For production with many users, consider:
  - **PostgreSQL** (Railway, Render)
  - **MySQL** (various hosts)
  - **MongoDB** (MongoDB Atlas - free tier)

**For SQLite on cloud:**
- Make sure the platform supports file storage
- Consider using cloud storage (S3, etc.) for uploads folder

## Step 5: Post-Deployment Steps

1. **Access your live application**
2. **Create admin user**:
   - Run the admin creation script on the server, or
   - Use the database management tool on your hosting platform

3. **Test the application**:
   - Register a new user
   - File a complaint
   - Test admin features

4. **Set up a custom domain** (optional):
   - Most platforms allow custom domain setup
   - Update DNS records as per platform instructions

## Troubleshooting

### Common Issues

**Issue: App not starting**
- Check environment variables are set correctly
- Verify `PORT` matches platform requirements
- Check logs in hosting platform dashboard

**Issue: Database errors**
- Ensure SQLite database file has write permissions
- Some platforms may need database migration

**Issue: File uploads not working**
- Verify `uploads/` directory has write permissions
- Consider using cloud storage (AWS S3, Cloudinary) for production

**Issue: CORS errors**
- Update CORS settings in `server.js` if needed
- Add your domain to allowed origins

## Quick Start Commands

```bash
# Clone repository
git clone https://github.com/yourusername/vehicle-theft-system.git
cd vehicle-theft-system

# Install dependencies
npm install

# Start locally
npm start

# Development mode (with auto-reload)
npm run dev
```

## Support

For issues or questions, please:
1. Check the main README.md
2. Open an issue on GitHub
3. Check hosting platform documentation

## Recommended Hosting Platforms (Summary)

| Platform | Free Tier | Ease of Use | Best For |
|----------|-----------|-------------|----------|
| Render | ✅ Yes | ⭐⭐⭐⭐⭐ | Beginners, small projects |
| Railway | ✅ Yes ($5 credit) | ⭐⭐⭐⭐⭐ | Quick deployment |
| Heroku | ❌ Paid | ⭐⭐⭐⭐ | Established projects |
| Vercel | ✅ Yes | ⭐⭐⭐⭐ | Node.js apps |
| Fly.io | ✅ Yes | ⭐⭐⭐ | Advanced users |

**For this project, we recommend Render or Railway for the easiest deployment experience.**
