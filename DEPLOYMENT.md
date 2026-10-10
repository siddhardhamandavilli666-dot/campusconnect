# 🚀 CampusConnect Deployment Guide

This guide details the steps to deploy **CampusConnect** using the recommended 100% Free Production Stack:
- **Database**: [TiDB Cloud](https://tidbcloud.com/) or [Aiven for MySQL](https://aiven.io/) (Free Cloud MySQL)
- **Backend API**: [Render](https://render.com/) (Free Node.js Web Service)
- **Frontend SPA**: [Vercel](https://vercel.com/) (Free Global CDN React Hosting)

---

## 📋 Step 1: Set Up Free Cloud MySQL Database

CampusConnect requires a MySQL database. You can get a free managed MySQL database in 2 minutes on **TiDB Cloud** (Free Serverless MySQL) or **Aiven**.

### Option A: TiDB Cloud (Recommended - Free Forever, No Credit Card)
1. Sign up / Log in at [TiDB Cloud](https://tidbcloud.com/).
2. Click **Create Cluster** and choose **Serverless** (Free 25GB).
3. Once the cluster is active, click **Connect**:
   - Choose **Node.js** or **General Connection**.
   - Note down:
     - **Host**: (e.g., `gateway01.us-east-1.prod.aws.tidbcloud.com`)
     - **Port**: `4000` (or `3306`)
     - **User**: (e.g., `xxxx.root`)
     - **Password**: (the password you generated)
     - **Database**: `campusconnect` (or create it in the SQL editor)
4. Open the **SQL Editor** tab in TiDB Cloud:
   - Paste the contents of `database/schema.sql` and run the script to create all required tables (`users`, `service_requests`, `request_attachments`, `quotations`, `orders`, `reviews`).

---

## ⚙️ Step 2: Deploy Backend to Render

1. Push your latest code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure deployment"
   git push origin main
   ```
2. Log in to [Render.com](https://render.com/).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository: `campusconnect`.
5. Configure the Web Service settings:
   - **Name**: `campusconnect-backend`
   - **Region**: Closest to your users (e.g., Oregon, Frankfurt, Singapore)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Scroll down to **Environment Variables** and add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production environment |
| `PORT` | `5000` | Port for Express |
| `DB_HOST` | `gateway01.us-east-1.prod.aws.tidbcloud.com` | Your Cloud MySQL Host |
| `DB_PORT` | `4000` | Cloud MySQL Port (usually 4000 for TiDB, 3306 for Aiven/MySQL) |
| `DB_USER` | `xxxx.root` | Database username |
| `DB_PASSWORD` | `YourSecretPassword` | Database password |
| `DB_NAME` | `campusconnect` | Database name |
| `DB_SSL` | `true` | Enables secure TLS connection for cloud MySQL |
| `JWT_SECRET` | `7f3Kq9Vx2Lm8Rz5Np1Yw6Td4Hs0Qa7Bc9Xe2Ui5Wo8Jk3Pg6Nv4Sr1Mx9Zt2Lf` | Long random string |
| `RAZORPAY_KEY_ID` | `rzp_test_TiiX3ThSUovTdu` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | `EsUGyItgTbalBFvi3cBnLmzO` | Razorpay Key Secret |
| `FRONTEND_URL` | `https://your-app.vercel.app` | (Update after Step 3) |

7. Click **Create Web Service**.
8. Once deployed, Render will provide a public URL:  
   `https://campusconnect-backend.onrender.com`
9. Test the health check endpoint in your browser:  
   `https://campusconnect-backend.onrender.com/api/health`  
   *(Expected response: `{"ok":true,"message":"CampusConnect API and MySQL are working"}`)*

---

## 💻 Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel.com](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`campusconnect`).
4. In the Project Configuration:
   - **Root Directory**: Click **Edit** and select `frontend`.
   - **Framework Preset**: `Vite` (auto-detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://campusconnect-backend.onrender.com/api` |

*(Replace with your actual Render backend URL from Step 2)*

6. Click **Deploy**.
7. Vercel will build and assign your domain (e.g., `https://campusconnect-client.vercel.app`).
8. *(Optional final step)*: Go back to Render -> Backend Service -> **Environment Variables**, update `FRONTEND_URL` with your Vercel domain, and save.

---

## 🔍 Verification Checklist

- [ ] Open frontend URL on Vercel.
- [ ] Register a new Student account.
- [ ] Register a new Vendor account.
- [ ] Student creates a request (test file attachment upload for printing/repair).
- [ ] Vendor sees the request and submits a quotation.
- [ ] Student accepts quotation and triggers Razorpay test payment.
- [ ] Vendor updates status to `COMPLETED` and student writes a review.
