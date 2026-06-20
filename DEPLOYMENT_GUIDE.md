# 🎒 Campus Lost & Found — Complete Deployment Guide

## What You're Building
A full-stack React web app with Firebase backend and Netlify hosting.  
**Live 24/7, free tier, real users.**

---

## STEP 1 — Install prerequisites

You need Node.js on your machine.

1. Go to **https://nodejs.org** → Download **LTS version**
2. Install it (click Next → Next → Finish)
3. Open terminal (cmd / Git Bash / VS Code terminal) and verify:
   ```
   node -v   # should print v18 or higher
   npm -v    # should print 9 or higher
   ```

---

## STEP 2 — Set up Firebase project

### 2a. Create Firebase project
1. Go to **https://console.firebase.google.com**
2. Click **"Add project"**
3. Name it: `campus-lost-found` (or anything you like)
4. Disable Google Analytics (not needed) → **Create project**

### 2b. Enable Authentication
1. Left sidebar → **Build → Authentication**
2. Click **"Get started"**
3. Click **"Email/Password"** → Toggle **Enable** → Save

### 2c. Create Firestore database
1. Left sidebar → **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** → Next
4. Select region: `asia-south1` (Mumbai, closest to India) → Enable

### 2d. Enable Storage
1. Left sidebar → **Build → Storage**
2. Click **"Get started"**
3. Choose **"Start in test mode"** → Next → Done

### 2e. Register a Web App & get config
1. Left sidebar → ⚙️ **Project settings** (gear icon)
2. Scroll down to **"Your apps"** → click **</>** (Web)
3. App nickname: `campus-lost-found-web` → **Register app**
4. Copy the `firebaseConfig` object — you'll need it in Step 4

---

## STEP 3 — Get the project files

You have two options:

### Option A: Use the files you already have (from Claude)
The project folder is `lost-found/` — place it somewhere like `C:\Projects\lost-found` or `~/projects/lost-found`

### Option B: Create fresh (copy-paste all files from Claude's output)
```
mkdir campus-lost-found
cd campus-lost-found
```
Then create all files as shown.

---

## STEP 4 — Configure environment variables

In the project root, create a file called **`.env.local`** (not `.env.example`, a new file):

```env
VITE_FIREBASE_API_KEY=AIzaSy...your_key...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Your email(s) that will have admin access — comma separated
VITE_ADMIN_EMAILS=youremail@gmail.com,admin@yourcollege.edu
```

> **Where to find these values:**  
> Firebase Console → Project Settings → Your apps → SDK setup and configuration → choose "Config"

---

## STEP 5 — Set Firestore Security Rules

In Firebase Console → **Firestore → Rules** tab, replace everything with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Items: anyone can read approved items; authenticated users can create;
    //        only owner or admin can update/delete
    match /items/{itemId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.token.email in ['youremail@gmail.com']);
    }

    // Claims: authenticated users can create and read
    match /claims/{claimId} {
      allow read, create: if request.auth != null;
    }
  }
}
```

> ⚠️ Replace `'youremail@gmail.com'` with your actual admin email(s).  
> Click **Publish**.

---

## STEP 6 — Set Firebase Storage Rules

In Firebase Console → **Storage → Rules** tab:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /items/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

Click **Publish**.

---

## STEP 7 — Install dependencies & run locally

```bash
# In your project folder:
cd campus-lost-found

npm install

npm run dev
```

Open **http://localhost:5173** in your browser.  
You should see the Lost & Found portal! 🎉

**Test it:**
- Register an account with the email you put in `VITE_ADMIN_EMAILS`
- Report a lost item
- Log out, register another account
- Log back in as admin → go to `/admin`
- Approve the item

---

## STEP 8 — Deploy to Netlify (free, 24/7)

### 8a. Push code to GitHub
1. Go to **https://github.com** → New repository → name it `campus-lost-found` → Create
2. In your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/campus-lost-found.git
   git push -u origin main
   ```

> ⚠️ Make sure `.env.local` is in `.gitignore` (it should be by default) — never push secrets to GitHub!

### 8b. Deploy on Netlify
1. Go to **https://netlify.com** → Sign up (free) → **"Add new site" → "Import from Git"**
2. Connect GitHub → select your repo
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **"Show advanced"** → **"New variable"** for each env variable:

   | Key | Value |
   |-----|-------|
   | `VITE_FIREBASE_API_KEY` | your value |
   | `VITE_FIREBASE_AUTH_DOMAIN` | your value |
   | `VITE_FIREBASE_PROJECT_ID` | your value |
   | `VITE_FIREBASE_STORAGE_BUCKET` | your value |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | your value |
   | `VITE_FIREBASE_APP_ID` | your value |
   | `VITE_ADMIN_EMAILS` | your admin emails |

5. Click **"Deploy site"**

Done! In ~2 minutes you'll get a live URL like `https://random-name-123.netlify.app`

### 8c. Add custom domain (optional)
In Netlify → Domain settings → Add custom domain → follow instructions.

---

## STEP 9 — Add Authorized Domain in Firebase

For Firebase Auth to work on your live URL:

1. Firebase Console → **Authentication → Settings → Authorized domains**
2. Click **"Add domain"**
3. Enter your Netlify URL: `random-name-123.netlify.app`
4. Save

---

## STEP 10 — Future deployments

Every time you push to GitHub:
```bash
git add .
git commit -m "Your message"
git push
```
Netlify auto-deploys within ~1 minute. ✅

---

## Project Structure

```
campus-lost-found/
├── public/
│   ├── icon.svg
│   └── _redirects          ← Netlify SPA routing fix
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── items/
│   │   │   └── ItemCard.jsx
│   │   └── shared/
│   │       └── Navbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Report.jsx
│   │   ├── ItemDetail.jsx
│   │   ├── MyItems.jsx
│   │   └── Admin.jsx
│   ├── utils/
│   │   ├── constants.js
│   │   └── db.js
│   ├── App.jsx
│   ├── main.jsx
│   ├── firebase.js
│   └── index.css
├── .env.example
├── .env.local              ← YOU CREATE THIS (not committed to git)
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## Feature Summary

| Feature | Where |
|---------|-------|
| Register / Login | `/register`, `/login` |
| Browse all approved items | `/` (Home) |
| Search + filter by type & category | Home page filters |
| Report lost/found item with photo | `/report` |
| View item details + contact info | `/item/:id` |
| Claim a found item | Item detail page |
| My reported items (with delete) | `/my-items` |
| Admin: approve posts | `/admin` → pending tab |
| Admin: delete posts | `/admin` → any tab |
| Admin: mark returned | `/admin` → approved tab |

---

## Making Someone an Admin

Two ways:
1. Add their email to `VITE_ADMIN_EMAILS` in Netlify env vars → redeploy
2. They register/login and their email matches → instantly admin

---

## Troubleshooting

**"Permission denied" error in Firestore**  
→ Check Firestore Rules — make sure you published them correctly.

**Images not uploading**  
→ Check Storage Rules — make sure you published them.

**Auth not working on live site**  
→ Add your Netlify URL to Firebase → Authentication → Authorized domains.

**"Module not found" error**  
→ Run `npm install` again.

**Admin dashboard shows "Access denied"**  
→ Make sure your email exactly matches what's in `VITE_ADMIN_EMAILS`.

---

## Free Tier Limits (Firebase)

| Service | Free limit |
|---------|-----------|
| Firestore reads | 50,000/day |
| Firestore writes | 20,000/day |
| Storage | 5 GB total |
| Auth | Unlimited |

For a campus portal, this is more than enough. 🎓
