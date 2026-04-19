# ⚡ SkillConnect — LinkedIn-like Job Portal (MERN Stack)

A full-stack, production-ready professional networking and job portal application built with the MERN stack.

---

## 🏗️ Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Frontend     | React 18 + Vite + Tailwind CSS                 |
| Backend      | Node.js + Express.js (MVC pattern)             |
| Database     | MongoDB + Mongoose                              |
| Auth         | Clerk (JWT-based, webhooks for DB sync)        |
| Real-time    | Socket.io (chat, online presence)              |
| File uploads | Cloudinary + Multer                            |
| State mgmt   | React Context API                              |
| Routing      | React Router v6                                |
| PDF export   | jsPDF + html2canvas                            |

---

## 📁 Project Structure

```
skillconnect/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── cloudinary.js          # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── userController.js      # User CRUD
│   │   ├── jobController.js       # Job CRUD + search
│   │   ├── applicationController.js # Job applications
│   │   ├── postController.js      # Feed posts
│   │   └── messageController.js   # Chat + AI chatbot
│   ├── middleware/
│   │   ├── authMiddleware.js      # Clerk JWT verification
│   │   └── errorMiddleware.js     # Global error handler
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Job.js                 # Job schema
│   │   └── index.js               # Application, Post, Message, Conversation
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── postRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── chatRoutes.js          # AI chatbot
│   │   └── webhookRoutes.js       # Clerk webhooks
│   ├── server.js                  # Entry point + Socket.io
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── MainLayout.jsx   # Navbar + layout shell
    │   │   └── chat/
    │   │       └── AIChatbot.jsx    # Floating AI assistant
    │   ├── context/
    │   │   └── AppContext.jsx       # Global state + socket
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── SignInPage.jsx
    │   │   ├── SignUpPage.jsx
    │   │   ├── RoleSelectPage.jsx
    │   │   ├── FeedPage.jsx         # LinkedIn-style posts
    │   │   ├── JobsPage.jsx         # Browse + filter jobs
    │   │   ├── JobDetailPage.jsx    # Job detail + apply
    │   │   ├── DashboardPage.jsx    # Seeker & employer dashboards
    │   │   ├── ProfilePage.jsx      # Edit profile
    │   │   ├── ResumeBuilderPage.jsx # 3 templates + analyzer
    │   │   ├── ChatPage.jsx         # Real-time messaging
    │   │   ├── PostJobPage.jsx      # Employer: post job
    │   │   └── NotFoundPage.jsx
    │   ├── utils/
    │   │   ├── api.js               # Axios instance
    │   │   └── helpers.js           # Date, salary, etc.
    │   ├── App.jsx                  # Routes
    │   ├── main.jsx                 # Entry + Clerk provider
    │   └── index.css                # Tailwind + custom classes
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── .env.example
```

---

## 🚀 Getting Started — Step by Step

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- Clerk account (free tier works)
- Cloudinary account (free tier works)

---

### Step 1 — Clone and install

```bash
# Install backend dependencies
cd skillconnect/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2 — Set up Clerk

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Choose "Email + Password" and/or social logins
3. From your Clerk dashboard → **API Keys**, copy:
   - `Publishable Key` (starts with `pk_test_`)
   - `Secret Key` (starts with `sk_test_`)
4. Go to **Webhooks** → Add endpoint:
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - For local dev, use [ngrok](https://ngrok.com): `ngrok http 5000`
   - Events to subscribe: `user.created`, `user.updated`, `user.deleted`
5. Copy the **Webhook Signing Secret** (starts with `whsec_`)

---

### Step 3 — Set up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and create a free cluster
2. Create a database user with read/write permissions
3. Whitelist your IP (or `0.0.0.0/0` for development)
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/skillconnect`

---

### Step 4 — Set up Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. From your dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

---

### Step 5 — Configure environment variables

**Backend** (`backend/.env`):
```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/skillconnect
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

### Step 6 — Run the app

```bash
# Terminal 1 — Backend
cd skillconnect/backend
npm run dev
# Server starts on http://localhost:5000

# Terminal 2 — Frontend
cd skillconnect/frontend
npm run dev
# App opens on http://localhost:5173
```

---

## 🎯 Features Walkthrough

### Authentication Flow
1. User signs up via Clerk
2. Clerk fires a `user.created` webhook → backend creates MongoDB document
3. On first login, user is redirected to `/select-role` to choose Job Seeker or Employer
4. Role can be switched later from Profile page

### Job Seeker Flow
- Browse and filter jobs by location, work type, salary, skills
- Click a job to see details → apply with cover letter
- Track applications in Dashboard (with status updates)
- Build resume with 3 templates, download as PDF
- Get resume score (0–100) with improvement tips
- Chat with employers in real-time
- Post updates on the Feed

### Employer Flow
- Post job listings with full details
- View applicants for each job
- Update application statuses (pending → reviewing → shortlisted → interview → offered/rejected)
- Dashboard shows job metrics (views, applications)
- Chat with candidates

### Real-time Chat
- Socket.io powers live messaging
- Online presence indicators (green dot)
- Typing indicators
- Messages persisted to MongoDB for history

### AI Chatbot
- Floating button on all pages
- Answers questions about resumes, job searching, interviews, salary
- Mock responses (swap with OpenAI API by modifying `messageController.js`)

---

## 🔧 Customization

### Add OpenAI to the AI Chatbot
In `backend/controllers/messageController.js`, replace the `getAIResponse` function:

```js
const OpenAI = require('openai')
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const getAIResponse = asyncHandler(async (req, res) => {
  const { message } = req.body
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful career coach assistant for SkillConnect.' },
      { role: 'user', content: message }
    ],
    max_tokens: 500,
  })
  res.json({ response: completion.choices[0].message.content })
})
```

### Add Email Notifications
Install `nodemailer` and create a notification service to email applicants when their status changes.

### Deploy to Production
- **Backend**: Deploy to Railway, Render, or AWS EC2
- **Frontend**: Deploy to Vercel or Netlify
- **Database**: MongoDB Atlas (already cloud-hosted)
- Update `FRONTEND_URL` in backend env and Vite proxy in production build

---

## 📡 API Reference

| Method | Endpoint                          | Description                    | Auth     |
|--------|-----------------------------------|--------------------------------|----------|
| GET    | /api/health                       | Health check                   | Public   |
| GET    | /api/users/me                     | Get current user               | Private  |
| PUT    | /api/users/me                     | Update profile                 | Private  |
| PUT    | /api/users/role                   | Set role                       | Private  |
| PUT    | /api/users/photo                  | Upload profile photo           | Private  |
| PUT    | /api/users/resume                 | Upload resume PDF              | Private  |
| GET    | /api/users/search?q=name          | Search users                   | Private  |
| GET    | /api/users/:id                    | Get user by ID                 | Public   |
| GET    | /api/jobs                         | List jobs (with filters)       | Public   |
| POST   | /api/jobs                         | Create job                     | Employer |
| GET    | /api/jobs/my-jobs                 | Employer's jobs                | Employer |
| GET    | /api/jobs/:id                     | Job details                    | Public   |
| PUT    | /api/jobs/:id                     | Update job                     | Employer |
| DELETE | /api/jobs/:id                     | Delete job                     | Employer |
| POST   | /api/applications                 | Apply to job                   | Seeker   |
| GET    | /api/applications/my              | My applications                | Seeker   |
| GET    | /api/applications/job/:jobId      | Job applicants                 | Employer |
| PUT    | /api/applications/:id/status      | Update status                  | Employer |
| GET    | /api/posts                        | Get feed                       | Private  |
| POST   | /api/posts                        | Create post                    | Private  |
| PUT    | /api/posts/:id/like               | Like/unlike post               | Private  |
| POST   | /api/posts/:id/comments           | Add comment                    | Private  |
| DELETE | /api/posts/:id                    | Delete post                    | Private  |
| POST   | /api/messages/conversation        | Get or create conversation     | Private  |
| GET    | /api/messages/conversations       | List all conversations         | Private  |
| GET    | /api/messages/:convId             | Get messages in conversation   | Private  |
| POST   | /api/messages/:convId             | Send message (also via socket) | Private  |
| POST   | /api/chat                         | AI chatbot response            | Private  |
| POST   | /api/webhooks/clerk               | Clerk user sync webhook        | Internal |

---

## 🐛 Troubleshooting

**"User not found" after login**
→ The Clerk webhook hasn't fired yet. Make sure your ngrok URL is configured in Clerk webhooks and all 3 events are selected.

**CORS errors**
→ Make sure `FRONTEND_URL` in backend `.env` exactly matches your frontend URL (no trailing slash).

**Socket.io not connecting**
→ Check that `VITE_SOCKET_URL` points to your backend and that your backend's CORS allows the frontend origin.

**Cloudinary upload failing**
→ Verify all 3 Cloudinary credentials are correct in your backend `.env`.

---

## 📄 License

MIT — Free to use, modify, and distribute.

Built with ❤️ using the MERN stack.
