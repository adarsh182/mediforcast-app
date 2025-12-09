# Deploy to Render.com (Backend) + Netlify (Frontend)

## 🎯 Final URLs

- **Frontend (Netlify)**: https://mediforecast.netlify.app/
- **Backend (Render)**: https://mediforcast-backend.onrender.com/api

---

## 🚀 Step 1: Deploy Backend to Render.com

### 1.1 Create Render Account

1. Go to [Render.com](https://render.com)
2. Click **Sign up**
3. Sign up with GitHub (recommended) or email
4. Connect your GitHub account

### 1.2 Push Backend to GitHub

First, push your code to GitHub:

```powershell
# In your project root
git init
git add .
git commit -m "Initial commit - Mediforcast app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mediforcast.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 1.3 Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** button > **Web Service**
3. Select your **mediforcast** GitHub repository
4. Fill in the form:
   - **Name**: `mediforcast-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (scroll down to see free option)

5. Click **Create Web Service**

### 1.4 Add Environment Variables

1. In Render dashboard, go to your service
2. Click **Environment** tab
3. Add these variables:
   ```
   GEMINI_API_KEY = your_gemini_api_key_here
   GEMINI_API_URL = https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent
   PORT = 5000
   ```
4. Click **Save**

### 1.5 Wait for Deployment

Render will automatically:
- ✅ Build your backend
- ✅ Deploy to the cloud
- ✅ Give you a live URL

It takes ~2-3 minutes. You'll see a green "Live" status when done.

**Copy your backend URL** (looks like: `https://mediforcast-backend.onrender.com`)

---

## 🎨 Step 2: Deploy Frontend to Netlify

### 2.1 Update Backend URL in Code

Update `frontend/netlify.toml`:

```toml
[build.environment]
  REACT_APP_API_URL = "https://YOUR_RENDER_URL/api"
```

Replace `YOUR_RENDER_URL` with your Render backend URL from Step 1.5

### 2.2 Push to GitHub

```powershell
git add .
git commit -m "Update backend URL for Render"
git push
```

### 2.3 Connect to Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Click **Add new site** > **Import an existing project**
3. Select **GitHub** (authorize if needed)
4. Choose **mediforcast** repository
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - Click **Deploy site**

### 2.4 Set Environment Variable

1. In Netlify, go to **Site settings**
2. Click **Build & deploy** > **Environment**
3. Click **Add environment variables**
4. Add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://YOUR_RENDER_URL/api`

5. Click **Deploy site** to rebuild with new variables

### 2.5 Test Your App

1. Go to your Netlify URL: https://mediforecast.netlify.app/
2. Try analyzing symptoms
3. Should work perfectly! ✅

---

## 🔄 How to Update Your App

### Update Backend:
```powershell
# Make changes to backend code
git add backend/
git commit -m "Update backend"
git push

# Render automatically redeploys!
```

### Update Frontend:
```powershell
# Make changes to frontend code
git add frontend/
git commit -m "Update frontend"
git push

# Netlify automatically redeploys!
```

---

## 📊 Monitor Your App

### Backend (Render):
- Go to [Render Dashboard](https://dashboard.render.com)
- Click your service
- View logs in **Logs** tab

### Frontend (Netlify):
- Go to [Netlify Dashboard](https://app.netlify.com)
- Click your site
- View deployment logs in **Deploys** tab

---

## 🐛 Troubleshooting

### "Backend not responding"
- [ ] Check Render dashboard shows "Live" status
- [ ] Check environment variables are set in Render
- [ ] Check Render logs for errors
- [ ] Wait 30 seconds (sometimes slow to start)

### "CORS error"
- [ ] Check backend has CORS enabled (it does by default)
- [ ] Check `REACT_APP_API_URL` in Netlify is correct
- [ ] Open DevTools Console (F12) to see exact error

### "Can't connect to database"
- [ ] Previous checks are stored in memory (not persistent)
- [ ] If you want persistent storage, add MongoDB later

### Frontend shows 404
- [ ] Check `netlify.toml` has redirect rules
- [ ] Rebuild in Netlify (click **Trigger deploy**)

---

## 🎉 You're Done!

Your app is now live:
- **Frontend**: https://mediforecast.netlify.app/
- **Backend**: https://mediforcast-backend.onrender.com/api

Both automatically redeploy when you push to GitHub!

---

## 💡 Next Steps (Optional)

1. Add MongoDB for persistent data storage
2. Add user authentication
3. Add analytics
4. Customize domain names
5. Add CI/CD pipeline

All easy to add later! 🚀
