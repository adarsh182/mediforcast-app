# Quick Deploy Guide - Render + Netlify

## ✅ Setup Complete!

Your app is ready to deploy. Here's the fast version:

---

## 🚀 Step 1: Push Code to GitHub (5 min)

```powershell
git init
git add .
git commit -m "Mediforcast - Symptom Healthcare Guidance"
git remote add origin https://github.com/YOUR_USERNAME/mediforcast.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username.**

---

## 🚀 Step 2: Deploy Backend to Render (5 min)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **New +** > **Web Service**
4. Choose your **mediforcast** repository
5. Fill in:
   - Name: `mediforcast-backend`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Choose **Free** plan
6. Click **Create Web Service**
7. Add environment variables:
   - `GEMINI_API_KEY` = your key
   - `GEMINI_API_URL` = https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent
8. **Copy your Render URL** (looks like: `https://mediforcast-backend.onrender.com`)

---

## 🚀 Step 3: Deploy Frontend to Netlify (5 min)

1. Update `frontend/netlify.toml`:
   ```toml
   REACT_APP_API_URL = "https://YOUR_RENDER_URL/api"
   ```
   (Replace with your actual Render URL)

2. Push to GitHub:
   ```powershell
   git add frontend/netlify.toml
   git commit -m "Update Render URL"
   git push
   ```

3. Go to [netlify.com](https://netlify.com)
4. Click **Add new site** > **Import an existing project**
5. Choose **GitHub** and **mediforcast** repo
6. Set:
   - Base directory: `frontend`
   - Build: `npm run build`
   - Publish: `frontend/dist`
7. Click **Deploy**
8. Add environment variable:
   - `REACT_APP_API_URL` = your Render URL
9. Trigger rebuild

---

## ✨ Done!

Your app is live at:
- **Frontend**: https://mediforecast.netlify.app/
- **Backend**: https://YOUR_RENDER_URL

Both auto-redeploy on every git push! 🎉

---

## 📝 Detailed Guide

See **RENDER_NETLIFY_DEPLOYMENT.md** for complete step-by-step instructions with screenshots.

---

## 🔑 Remember

Your Gemini API Key MUST be set in Render environment variables (not in git).
