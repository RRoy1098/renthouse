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


---

## Key AI Features
- **Natural Language Search**: Type any search sentence in the query bar (e.g. "semi-furnished PG in Mumbai with Wifi under 10000"). The query is passed to Claude to structure a clean Mongoose search filter automatically.
- **Smart Listing Descriptions**: Automatically generates formatted description write-ups from room details, furnishing state, location and rules.
- **Optimal Rent Calculator**: Suggests minimum, maximum, and ideal rent prices for owners when listing properties, explaining the reasoning based on similar listings and location specs.
- **Location Summarizer**: Transforms raw addresses and points of interest into brief, user-friendly sentences (e.g. "Located 5 minutes away from Central Metro station, close to local groceries").
- **Personalized Recommendation Agent**: Analyzes tenant budget ranges and room preferences against the catalog to deliver a ranked top 5 recommendation report with tailored reason statements.
