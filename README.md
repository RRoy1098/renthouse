# RentHouse - AI-Powered House Rental Platform

RentHouse is a full-stack, AI-powered housing rental platform featuring separate dashboards and experiences for **Owners** and **Tenants**, a secure **Admin Panel**, real-time socket communication, and deep Anthropic Claude API integrations for natural language search, automated listing descriptions, location summaries, rent suggestions, and tenant recommendations.

---

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS, React Router, Axios, Socket.io-client, react-hot-toast, react-dropzone, Lucide Icons, @react-google-maps/api
- **Backend**: Node.js + Express.js (ES modules)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **Image Storage**: Cloudinary
- **Real-Time Communication**: Socket.io
- **AI Integrations**: Anthropic Claude API (`@anthropic-ai/sdk`)

---

## Directory Structure

```text
/rent                  (Root Workspace)
├── client/            (React frontend)
│   ├── public/
│   ├── src/           (Components, Pages, Context, Hooks)
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.js
├── server/            (Node/Express backend)
│   ├── config/        (Mongoose & Cloudinary setup)
│   ├── controllers/   (Auth, Listing, Inquiry, AI, Admin)
│   ├── models/        (User, Listing, Inquiry schemas)
│   ├── routes/        (API routing files)
│   ├── middleware/    (Protected route handlers)
│   ├── utils/         (Socket.io, Anthropic AI helper)
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── README.md          (This file)
```

---

## Setup & Configuration Guide

### 1. MongoDB Atlas Setup (Free Tier)
1. Sign up/log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 Cluster. Select your preferred provider and region.
3. Under **Database Access**, create a user with "Read and write to any database" privileges. Save the password.
4. Under **Network Access**, click "Add IP Address" and select **Allow Access from Anywhere** (0.0.0.0/0) or add your current IP.
5. Click **Connect** on your cluster, select **Drivers** (Node.js), and copy the connection string.
6. Replace `<password>` with your database user password and specify the database name (e.g., `renthouse`) before the query parameters.
7. Save this in your server `.env` as `MONGO_URI`.

### 2. Cloudinary Setup (Free Tier)
1. Sign up/log in at [Cloudinary](https://cloudinary.com).
2. Go to your **Console Dashboard** to view your Cloud name, API Key, and API Secret.
3. Save these in your server `.env` as:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### 3. Anthropic Claude API Setup
1. Create an account at [Anthropic Console](https://console.anthropic.com/).
2. Deposit trial credits or link a payment method to generate an API key.
3. Under the **API Keys** tab, create a new key.
4. Save this in your server `.env` as `ANTHROPIC_API_KEY`.
5. Set `ANTHROPIC_MODEL` to `claude-3-5-sonnet-20241022` (or your preferred Claude model).

### 4. Google Maps API Setup (Free Tier)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Search for and enable the **Maps JavaScript API** and **Places API** (if needed for map searching).
4. Go to **APIs & Services > Credentials** and click **Create Credentials > API Key**.
5. Copy the generated key. It is recommended to restrict this key to referrers/APIs in production.
6. Save this in your client `.env` as `VITE_GOOGLE_MAPS_API_KEY`.

---

## Installation & Running Locally

### Backend Setup
1. Open a terminal and navigate to the `/server` directory:
   ```bash
   cd server
   ```
2. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server in development mode (nodemon):
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

### Frontend Setup
1. Open a new terminal and navigate to the `/client` directory:
   ```bash
   cd ../client
   ```
2. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the React development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## Environment Variables

### Backend `.env` Variables
```env
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_signing_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ANTHROPIC_API_KEY=your_anthropic_claude_api_key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ADMIN_EMAIL=admin@renthouse.com
```

### Frontend `.env` Variables
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## Key AI Features
- **Natural Language Search**: Type any search sentence in the query bar (e.g. "semi-furnished PG in Mumbai with Wifi under 10000"). The query is passed to Claude to structure a clean Mongoose search filter automatically.
- **Smart Listing Descriptions**: Automatically generates formatted description write-ups from room details, furnishing state, location and rules.
- **Optimal Rent Calculator**: Suggests minimum, maximum, and ideal rent prices for owners when listing properties, explaining the reasoning based on similar listings and location specs.
- **Location Summarizer**: Transforms raw addresses and points of interest into brief, user-friendly sentences (e.g. "Located 5 minutes away from Central Metro station, close to local groceries").
- **Personalized Recommendation Agent**: Analyzes tenant budget ranges and room preferences against the catalog to deliver a ranked top 5 recommendation report with tailored reason statements.
