# 🔵 IP TALK — Setup Guide

A real-time IP-based chat app (clone of IPChat). Uses **Node.js + Express + Socket.IO**.

---

## 📁 Project Structure

```
iptalk/
├── server.js          ← Node.js backend (WebSocket server)
├── package.json       ← Dependencies
└── public/
    └── index.html     ← Full frontend (login + chat UI)
```

---

## ⚡ Step-by-Step Setup

### Step 1 — Install Node.js

Download from https://nodejs.org (LTS version recommended).

Verify install:
```bash
node -v
npm -v
```

---

### Step 2 — Set Up the Project

Create a folder and copy all the files into it:

```bash
mkdir iptalk
cd iptalk
```

Place `server.js`, `package.json`, and `public/index.html` (inside a `public/` folder) in this directory.

---

### Step 3 — Install Dependencies

```bash
npm install
```

This installs Express and Socket.IO.

---

### Step 4 — Start the Server

```bash
node server.js
```

You should see:
```
✅ IP Talk server running at http://localhost:3000
```

---

### Step 5 — Open the App

Open your browser and go to:
```
http://localhost:3000
```

---

### Step 6 — Test with Multiple Users

To test real-time chat:
- Open **two browser tabs** at `http://localhost:3000`
- Use the **same IP/room code** in both
- Messages will appear in real-time

Or share your local IP with others on the same network:
```bash
# Find your local IP (Mac/Linux):
ifconfig | grep "inet "

# Windows:
ipconfig
```

Then others on your Wi-Fi can visit:
```
http://YOUR_LOCAL_IP:3000
```

---

## 🔐 Security Notes (Cybersecurity Context)

- This app uses **WebSockets** (Socket.IO) for real-time bidirectional communication.
- There is **no authentication** — anyone who knows the room code can join.
- Messages are **not encrypted in transit** unless you run it behind HTTPS.
- To add HTTPS: use a reverse proxy like **nginx** + **Let's Encrypt**, or deploy to a platform like **Render/Railway** which handles TLS.

---

## 🚀 Optional — Auto-Restart on File Changes

```bash
npm run dev
```

(Uses `nodemon` — auto-restarts server when you edit code)

---

## 🌐 Deploy Online (Optional)

To make it publicly accessible:

1. Push to GitHub
2. Deploy free on **[Railway](https://railway.app)** or **[Render](https://render.com)**
3. Set start command: `node server.js`

---

Happy hacking! 🛡️
