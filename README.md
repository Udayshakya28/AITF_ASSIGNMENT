# 🌐 AITF Assignment – WebDesignGen Chatbot  

An AI-powered **multilingual chatbot** project built with **Django (Backend)** and **React (Frontend)**.  
Supports **English 🇬🇧 + Japanese 🇯🇵** for interactive conversations.  

---

## ✨ Features
- 💬 **Multilingual Support** → English + Japanese chatbot interactions  
- ⚡ **Django Backend** → API endpoints, chatbot logic, database support  
- 🎨 **React Frontend** → Modern, responsive UI for chat experience  
- 🔐 **Secure Setup** → `.env` for secrets (ignored by Git)  
- 🧹 **Clean Project** → `.gitignore` excludes `.env` and `.venv/`  

---

## 📂 Project Structure
backend/ # Django backend (API, chatbot logic, DB models)
frontend/ # React frontend (chat UI + multilingual interface)
.env # Environment variables (ignored)
.venv/ # Virtual environment (ignored)

yaml
Copy code

---

## ⚡ Getting Started

### 1️⃣ Clone the Repo
```bash
git clone https://github.com/Udayshakya28/AITF_ASSIGNMENT.git
cd AITF_ASSIGNMENT
2️⃣ Backend Setup (Django)
bash
Copy code
cd backend
python -m venv .venv
.venv\Scripts\activate   # 👉 On Windows
source .venv/bin/activate  # 👉 On Mac/Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
👉 Backend runs at: http://127.0.0.1:8000/

3️⃣ Frontend Setup (React)
bash
Copy code
cd frontend
npm install
npm start
👉 Frontend runs at: http://localhost:3000/

🛠️ Tech Stack
Frontend: React.js ⚛️, TailwindCSS 🎨

Backend: Django 🐍, Django REST Framework

Languages Supported: English 🇬🇧 + Japanese 🇯🇵

🔐 Environment Variables
Create a .env file in both backend/ and frontend/ (⚠️ never commit it):

env
Copy code
OPENAI_API_KEY=your_api_key_here
🌟 Future Improvements
🚀 Deploy frontend (Vercel/Netlify) + backend (Render/Heroku)

🎭 Improve chatbot UI/UX with animations and better design

🌍 Add support for more languages

📜 License
This project is for educational purposes (AITF assignment).

👨‍💻 Developed by Uday Shakya

yaml
Copy code

---
