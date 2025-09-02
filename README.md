# CodeMate Frontend

CodeMate is a **social networking and collaboration platform** frontend built with **React**, **Redux**, and **React Router**.  
It enables users to connect, chat, manage requests, and access premium features.  
The application is deployed on **AWS EC2** using **Nginx** as a reverse proxy and **PM2** for process management, with a live domain: **[thecodemate.shop](http://thecodemate.shop)**.

![CodeMate Screenshot](./screenshot.png)  
*(Replace `screenshot.png` with your actual screenshot file in the repo)*

---

## 🚀 Features

- 🔑 **Authentication & Authorization** – Login, session handling, change password, and protected routes with `RequireAuth`.
- 📰 **Feed System** – Personalized feed after authentication.
- 👥 **Connections & Requests** – Manage friend requests, connections, and networking.
- 💬 **Real-time Chat** – Chat feature using `Chat` component with dynamic user IDs.
- 👤 **Profile Management** – Update and manage user profile.
- ⭐ **Premium Access** – Premium services accessible via `/premium` route.
- 🎨 **Theme Support** – Automatic theme loading (light/dark mode) from localStorage【22†source】.
- 🛡️ **Routing Guards** – Protected routes redirect unauthorized users to login.

---

## 📂 Project Structure

```bash
CodeMate-Frontend/
├── public/                # Static assets (favicon, images, etc.)
├── src/
│   ├── components/        # React components (Feed, Login, Profile, Chat, etc.)
│   ├── utils/             # Redux store, state management, and sockets
│   ├── App.jsx            # Main app and router configuration【22†source】
│   ├── main.jsx           # React entry point【21†source】
│   ├── index.css          # Global styles
│   └── index.html         # Root HTML file【20†source】
├── package.json           # Dependencies & npm scripts
└── README.md              # Project documentation
```

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (>= 18)
- npm or yarn

### Steps
```bash
# Clone the repository
git clone https://github.com/your-username/CodeMate-Frontend.git
cd CodeMate-Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
- `npm run dev` – Start development server (Vite/React).  
- `npm run build` – Build for production.  
- `npm run preview` – Preview the production build locally.  

---

## 🌍 Deployment Guide

The frontend is deployed on an **AWS EC2 instance** using **Nginx** and **PM2**.

### 1. Build the project
```bash
npm run build
```

### 2. Serve with PM2
```bash
pm2 serve dist 3000 --spa
```

### 3. Configure Nginx
Sample `/etc/nginx/sites-available/codemate` config:

```nginx
server {
    listen 80;
    server_name thecodemate.shop www.thecodemate.shop;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable config and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/codemate /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### 4. Secure with SSL (optional)
```bash
sudo certbot --nginx -d thecodemate.shop -d www.thecodemate.shop
```

---

## 🔗 Domain

Project is live at:  
👉 [**thecodemate.shop**](http://thecodemate.shop)

---

## 🛣️ Router Table

| Path                 | Component         | Description |
|-----------------------|------------------|-------------|
| `/`                  | `HomeGate`       | Redirects to `/feed` if logged in, otherwise shows Home |
| `/feed`              | `Feed`           | Main user feed (auth required) |
| `/login`             | `Login`          | User login page|
| `/profile`           | `Profile`        | User profile page (auth require) |
| `/requests`          | `Requests`       | Manage incoming connection requests (auth required) |
| `/connections`       | `Connections`    | User’s connections list (auth required)|
| `/change-password`   | `ChangePassword` | Change password modal (auth required) |
| `/premium`           | `Premium`        | Premium membership features (auth required) |
| `/chat/:targetUserId`| `Chat`           | Direct chat with specific user (auth required)|
| `*`                  | `Navigate`       | Redirects to `/` |

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Routing**: React Router DOM
- **State Management**: Redux (`appStore`)
- **Styling**: CSS + Theme support
- **Deployment**: AWS EC2, Nginx, PM2
- **Domain**: thecodemate.shop

---

## 📸 Screenshots

Add screenshots in a `/docs` or `/assets` folder, and link them here.

Example:
```markdown
![Feed Page](./docs/feed.png)
![Chat Page](./docs/chat.png)
```

---

## 👨‍💻 Author

Developed by **[Your Name]**.  
For inquiries, reach out via email or GitHub.

---
