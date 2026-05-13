# 🏠 HostelHub — Smart Hostel Management System

A production-quality, full-stack management system designed to streamline hostel operations, room allocations, and student services.

## 🚀 Features
- **🔐 Secure Authentication**: Role-based access for Admins, Wardens, and Students using JWT.
- **📊 Interactive Dashboard**: Real-time analytics and overview of hostel occupancy and finances.
- **👥 Student Management**: Comprehensive directory with automated account creation.
- **🛏️ Room Management**: Visual tracking of room availability and one-click student allocation.
- **🛠️ Complaint System**: End-to-end maintenance tracking from reporting to resolution.
- **💰 Fee Management**: Automated invoice generation and payment tracking.
- **🚪 Leave Management**: Digital workflow for student leave applications and staff approvals.

## 💻 Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Axios, React Router.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL.
- **Security**: JWT (JSON Web Tokens), Bcrypt.js hashing.

## 🛠️ Setup Instructions

### 1. Database Setup
- Import the `database/schema/init.sql` file into your local MySQL server.
- Update `backend/.env` with your database credentials.

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📄 License
This project is for educational purposes as part of a DBMS/Full-stack learning track.
