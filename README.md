<div align="center">

# 🏠 HostelHub
### Smart Hostel Management System

Now let me also create a precise, text-based Mermaid ER diagram artifact that you can use in your report (more accurate and editable):
*A production-quality, full-stack web application designed to digitize and streamline every aspect of hostel operations — from room allocation and fee tracking to security gate logs and student grievance management.*

---

![Node.js](https://img.shields.io/badge/Node.js-v16%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-v18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-v8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-v4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/License-Educational-blue?style=for-the-badge)

**Author:** Siddalingesh Karadi &nbsp;|&nbsp; **USN:** 1RV22CS045 &nbsp;|&nbsp; **Dept:** CSE &nbsp;|&nbsp; **Year:** 2025–2026

</div>

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [User Roles & Access Control](#-user-roles--access-control)
4. [Tech Stack](#-tech-stack)
5. [Project Structure](#-project-structure)
6. [Database Schema](#-database-schema--18-tables)
7. [API Routes](#-rest-api-routes)
8. [Setup & Installation](#️-setup--installation)
9. [Environment Variables](#-environment-variables)
10. [Running the Application](#-running-the-application)
11. [Security Architecture](#-security-architecture)
12. [Future Scope](#-future-scope)
13. [License](#-license)

---

## 📌 Project Overview

**HostelHub** replaces fragmented, paper-based hostel administration with a centralized, secure, and fully digital management platform. It follows a **3-tier MVC (Model-View-Controller) architecture**:

```
┌──────────────────────────────────┐
│  CLIENT  —  React.js SPA         │
│  21 Pages | React Router DOM v6  │
│  Axios HTTP Client | JWT Header  │
└──────────────┬───────────────────┘
               │  REST API (JSON over HTTP)
┌──────────────▼───────────────────┐
│  SERVER  —  Node.js + Express.js │
│  17 Route Modules | JWT Middleware│
│  Multer File Uploads | Helmet     │
└──────────────┬───────────────────┘
               │  SQL Queries via mysql2 / Sequelize
┌──────────────▼───────────────────┐
│  DATABASE  —  MySQL v8.0         │
│  18 Relational Tables            │
│  ACID Transactions | FK Cascades │
└──────────────────────────────────┘
```

The system supports **5 distinct user roles**, each with a dedicated dashboard, role-restricted API endpoints, and a tailored feature set — all secured through **JWT-based Role-Based Access Control (RBAC)**.

---

## 🚀 Key Features

### 🔐 Secure Authentication & Authorization
- Login system with **JWT (JSON Web Tokens)** — tokens carry the user's `id`, `name`, `email`, and `role` as a cryptographically signed payload.
- **Bcrypt.js** password hashing with salt rounds — passwords are never stored in plain text.
- Role-specific dashboards rendered immediately after login based on the decoded JWT payload.
- All protected API routes are guarded by a JWT verification middleware that validates the token on every request.

### 📊 Interactive Analytics Dashboard
- Real-time KPI cards displaying: total active students, occupied vs. vacant beds, pending leave requests, unresolved complaint count, total outstanding fee dues, and today's attendance summary.
- All dashboard metrics are fetched from the dedicated `/api/analytics` endpoint which runs aggregation queries (COUNT, SUM, AVG) on the MySQL database.

### 👥 Student Management
- Comprehensive student directory with full CRUD (Create, Read, Update, Delete) operations.
- Each student profile stores: USN, course, branch, academic year, semester, phone, blood group, address, and their currently allocated room.
- Admin can create new student accounts — credentials are auto-generated and the student's profile is linked to their login via a foreign key.

### 🛏️ Room Management
- Visual registry of all hostel rooms showing: room number, block, floor, total capacity, currently occupied beds, and availability status (`available` / `full` / `maintenance`).
- **Overbooking prevention**: Room allocation queries check `occupied < capacity` at the database level before committing any allocation.
- Wardens can update room status and reassign student allocations in real time.

### 🛠️ Complaint Ticketing System
- Students file maintenance complaints with a **title**, **description**, **category** (`electrical`, `plumbing`, `cleaning`, `internet`, `other`), and **priority** (`low`, `medium`, `high`, `critical`).
- Full lifecycle tracking: `pending` → `in-progress` → `resolved` / `rejected`.
- Wardens update ticket status and record resolution remarks, visible to the student in real time.

### 💰 Fee Management & Payment Tracking
- Admins issue fee invoices to students with an amount (`DECIMAL(10,2)`) and a due date.
- Students view their outstanding, partial, and paid invoices from their dashboard.
- Payment proof workflow: students upload a bank receipt image (via **Multer**) with a transaction ID. Wardens/Admins verify and approve/reject the submission.

### 🚪 Leave Management
- Students submit digital leave applications with: reason, destination, start date, and return date.
- Applications enter the warden's approval queue with `pending` status.
- Wardens approve or reject with a single click, and the status update is reflected on the student's dashboard immediately.

### 🔒 Security & Gate Logging
- Security guards log student entry and exit events via QR code scanning (powered by **qrcode.react**).
- Every gate log is timestamped and linked to both the student's ID and the authorizing guard's user ID.
- Guards file real-time incident reports (fire, suspicious activity, emergency) that appear on the admin console as **Security Alerts**.

### 📋 Attendance Tracking
- Wardens mark daily student attendance (present / absent / on_leave) through a structured form.
- A **composite UNIQUE KEY** `(student_id, date)` in the database prevents duplicate attendance records for the same student on the same day.
- Staff (security/housekeeper) record their own shift check-in and check-out times.

### 📢 Notice Board & Broadcasts
- Admins and wardens publish notices visible to all students with timestamps.
- Admins send system-wide **emergency broadcasts** (type: `alert`, `emergency`, `info`) that appear on every dashboard.

### 💬 Private Messaging
- Direct messaging between students, wardens, and administrators.
- Messages store an `is_read` boolean flag for read receipts.
- Role-based filtering allows messages to be directed to all wardens or all admins.

### 📦 Inventory Management
- Tracks all hostel assets (mattresses, chairs, fans, tables) with quantity and description.
- `last_updated` column auto-refreshes via MySQL's `ON UPDATE CURRENT_TIMESTAMP` feature.

### 🍽️ Mess Menu
- Weekly meal schedule (tiffin, lunch, snacks, dinner) for each day of the week.
- Admins/Wardens update the menu; students view it from their dashboard.

---

## 👤 User Roles & Access Control

| Role | Pages Accessible | Core Responsibilities |
|---|---|---|
| 👨‍💼 **Admin** | All 21 pages | Full CRUD on all data, user creation, fee issuance, broadcasts, inventory |
| 👩‍🏫 **Warden** | Dashboard, Rooms, Students, Leave, Complaints, Attendance, Fees, Notices | Hostel oversight, approvals, complaint resolution |
| 🎓 **Student** | Profile, Fees, Leave, Complaints, Notices, Mess, Messages, Network | Self-service portal for daily hostel interactions |
| 🔒 **Security Guard** | SecurityDashboard, SecurityScan, SecurityAlerts | Gate logs, QR scanning, incident reporting |
| 🧹 **Housekeeper** | Attendance, Assigned Tasks | Shift check-in/out, cleaning schedules |

> **How RBAC works:** After login, the server signs a JWT containing the user's `role`. The React frontend decodes this token and conditionally renders navigation items and protects routes. On the backend, Express.js middleware reads the `role` from the verified JWT payload before allowing any route to execute.

---

## 💻 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React.js** | v18.2.0 | Component-based UI library with Virtual DOM |
| **Vite** | v4.4.5 | Lightning-fast build tool with Hot Module Replacement |
| **React Router DOM** | v6.16.0 | Client-side SPA routing & protected route guards |
| **Tailwind CSS** | v3.3.3 | Utility-first CSS with responsive breakpoints & dark mode |
| **Axios** | v1.5.0 | HTTP client with JWT interceptor for all API calls |
| **Framer Motion** | v10.16.4 | Page transition animations and hover micro-effects |
| **React Icons** | v4.11.0 | 50,000+ SVG icons (Font Awesome, Material, Feather) |
| **QRCode.react** | v4.2.0 | Dynamic QR code generation for student gate passes |
| **PostCSS** | v8.4.31 | CSS transformation pipeline |
| **Autoprefixer** | v10.4.16 | Auto-adds vendor prefixes for browser compatibility |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | v16.x+ | JavaScript runtime for server-side execution |
| **Express.js** | v4.18.2 | Lightweight REST API framework |
| **mysql2** | v3.6.1 | High-performance MySQL driver with Promise & pool support |
| **Sequelize** | v6.33.0 | ORM for model-based database operations |
| **jsonwebtoken** | v9.0.2 | JWT signing, verification, and decoding |
| **Bcrypt.js** | v2.4.3 | Password hashing with configurable salt rounds |
| **Multer** | v2.1.1 | Multipart form-data handler for file uploads |
| **Helmet** | v7.0.0 | Sets secure HTTP response headers |
| **CORS** | v2.8.5 | Cross-Origin Resource Sharing configuration |
| **Morgan** | v1.10.0 | HTTP request logger for development |
| **dotenv** | v16.3.1 | Environment variable loader from `.env` file |
| **Nodemon** | v3.0.1 | Auto-restart server on file changes (dev only) |

### Database
| Technology | Version | Details |
|---|---|---|
| **MySQL** | v8.0 | Relational DBMS — 18 tables, ACID transactions, FK constraints |

---

## 📁 Project Structure

```
HostelHub/
├── 📁 frontend/                    # React.js SPA (Vite)
│   ├── 📁 src/
│   │   ├── 📁 pages/               # 21 role-specific page components
│   │   │   ├── Login.jsx           # Authentication entry point
│   │   │   ├── Dashboard.jsx       # Real-time analytics (Admin/Warden)
│   │   │   ├── StudentList.jsx     # Full student directory with CRUD
│   │   │   ├── RoomList.jsx        # Room registry and allocation
│   │   │   ├── FeeList.jsx         # Invoice and payment management
│   │   │   ├── LeaveList.jsx       # Leave applications and approvals
│   │   │   ├── ComplaintList.jsx   # Complaint ticketing system
│   │   │   ├── StudentAttendance.jsx # Daily attendance marking
│   │   │   ├── SecurityDashboard.jsx # Guard shift and duty panel
│   │   │   ├── SecurityScan.jsx    # Gate pass QR scanner
│   │   │   ├── SecurityAlerts.jsx  # Incident report filing
│   │   │   ├── Notices.jsx         # Notice board management
│   │   │   ├── MessMenu.jsx        # Weekly mess schedule
│   │   │   ├── Inventory.jsx       # Hostel asset tracking
│   │   │   ├── AdminMessages.jsx   # System-wide message monitor
│   │   │   ├── Profile.jsx         # Student self-profile
│   │   │   ├── StaffList.jsx       # Staff directory
│   │   │   ├── StaffProfile.jsx    # Staff personal profile
│   │   │   ├── StudentSupport.jsx  # Student → Warden messaging
│   │   │   ├── StudentNetwork.jsx  # Student community directory
│   │   │   └── Register.jsx        # New user registration (Admin)
│   │   ├── 📁 components/          # Reusable UI components
│   │   ├── 📁 context/             # React Context (Auth state)
│   │   ├── 📁 hooks/               # Custom React hooks
│   │   ├── 📁 services/            # Axios API service functions
│   │   ├── 📁 routes/              # Protected route definitions
│   │   ├── 📁 store/               # Global state management
│   │   ├── 📁 utils/               # Helper utilities
│   │   ├── 📁 constants/           # App-wide constants
│   │   ├── 📁 styles/              # Global CSS / Tailwind base
│   │   ├── App.jsx                 # Root component & router setup
│   │   └── main.jsx                # Vite entry point
│   ├── index.html                  # HTML shell
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   └── package.json                # Frontend dependencies
│
├── 📁 backend/                     # Node.js + Express.js Server
│   ├── 📁 src/
│   │   ├── app.js                  # Express app setup & middleware stack
│   │   ├── index.js                # Server entry point (port binding)
│   │   ├── 📁 routes/              # 17 REST API route modules
│   │   │   ├── authRoutes.js       # POST /api/auth/login, /register
│   │   │   ├── studentRoutes.js    # CRUD /api/students
│   │   │   ├── roomRoutes.js       # CRUD /api/rooms
│   │   │   ├── complaintRoutes.js  # CRUD /api/complaints
│   │   │   ├── feeRoutes.js        # CRUD /api/fees + payment proofs
│   │   │   ├── leaveRoutes.js      # CRUD /api/leaves
│   │   │   ├── analyticsRoutes.js  # GET /api/analytics (KPIs)
│   │   │   ├── noticeRoutes.js     # CRUD /api/notices
│   │   │   ├── inventoryRoutes.js  # CRUD /api/inventory
│   │   │   ├── messMenuRoutes.js   # CRUD /api/mess-menu
│   │   │   ├── adminRoutes.js      # Admin-only /api/admin
│   │   │   ├── broadcastRoutes.js  # CRUD /api/broadcasts
│   │   │   ├── securityRoutes.js   # /api/security (shifts, alerts)
│   │   │   ├── messageRoutes.js    # /api/messages (private chat)
│   │   │   ├── staffRoutes.js      # /api/staff (profiles)
│   │   │   ├── attendanceRoutes.js # /api/attendance (check-in/out)
│   │   │   └── gateRoutes.js       # /api/gate (entry/exit logs)
│   │   ├── 📁 controllers/         # Business logic handlers
│   │   ├── 📁 middleware/          # JWT auth guard middleware
│   │   ├── 📁 models/              # Sequelize model definitions
│   │   ├── 📁 config/              # Database connection config
│   │   ├── 📁 services/            # Reusable service functions
│   │   └── 📁 utils/               # Helper utilities
│   ├── 📁 uploads/                 # Uploaded payment proof files
│   ├── .env                        # Environment variables (⚠️ never commit)
│   ├── .env.example                # Environment variable template
│   └── package.json                # Backend dependencies
│
├── 📁 database/
│   ├── 📁 schema/
│   │   ├── init.sql                # Database & user creation script
│   │   └── tables.sql              # All 18 table CREATE statements
│   └── 📁 seeds/                   # Sample data for testing
│
├── 📁 scripts/                     # Utility scripts
├── HostelHub_Project_Report.md     # Full academic project report
├── dbms_sql_queries_cheat_sheet.html # SQL viva cheat sheet
├── .gitignore
└── README.md                       # This file
```

---

## 🗃️ Database Schema — 18 Tables

The entire system is backed by a normalized MySQL database. Here is a summary of all 18 tables and their relationships:

| # | Table | Primary Key | Key Foreign Keys | Purpose |
|---|---|---|---|---|
| 1 | `users` | `id` | — | Login credentials & role for every system actor |
| 2 | `students` | `student_id` | `user_id` → users, `room_id` → rooms | Academic profile & hostel enrollment data |
| 3 | `rooms` | `room_id` | — | Physical room inventory with real-time occupancy |
| 4 | `complaints` | `complaint_id` | `student_id` → students | Maintenance grievance ticketing |
| 5 | `fees` | `fee_id` | `student_id` → students | Fee invoices with due dates |
| 6 | `leave_requests` | `leave_id` | `student_id` → students | Student leave application workflow |
| 7 | `fee_payment_requests` | `request_id` | `fee_id` → fees, `student_id` → students | Digital payment proof upload & audit |
| 8 | `notices` | `id` | `created_by` → users | Admin/warden notice board |
| 9 | `inventory` | `id` | — | Hostel asset & furniture stock tracker |
| 10 | `mess_menu` | `id` | — | Weekly mess meal schedule |
| 11 | `private_messages` | `message_id` | `sender_id` → users, `recipient_id` → users | User-to-user private messaging |
| 12 | `broadcasts` | `id` | `created_by` → users | System-wide emergency alerts |
| 13 | `security_assignments` | `id` | `security_id` → users | Guard shift & gate patrol assignments |
| 14 | `security_alerts` | `id` | `security_id` → users | Incident reports (fire, suspicious, emergency) |
| 15 | `staff_profiles` | `profile_id` | `user_id` → users | Extended profiles for all non-student staff |
| 16 | `gate_logs` | `log_id` | `student_id` → students, `security_id` → users | Timestamped student entry/exit records |
| 17 | `attendance_logs` | `attendance_id` | `user_id` → users | Staff shift check-in/check-out tracker |
| 18 | `student_attendance` | `attendance_id` | `student_id` → students, `marked_by` → users | Daily student attendance register |

### Key Database Constraints Explained

```sql
-- ON DELETE CASCADE: Deleting a user removes their dependent profile automatically
ALTER TABLE students ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ON DELETE SET NULL: Deleting a room keeps the student record; room_id becomes NULL
ALTER TABLE students ADD FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE SET NULL;

-- COMPOSITE UNIQUE KEY: Prevents marking the same student's attendance twice on the same day
ALTER TABLE student_attendance ADD UNIQUE KEY unique_student_date (student_id, date);

-- DECIMAL for fee precision: Avoids floating-point rounding errors in financial calculations
amount DECIMAL(10,2) NOT NULL
```

---

## 🌐 REST API Routes

The backend exposes **17 route modules** covering every domain of the application:

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT token |
| `POST` | `/api/auth/register` | ✅ Admin | Create new user account |
| `GET` | `/api/students` | ✅ | List all students |
| `POST` | `/api/students` | ✅ Admin | Create student profile |
| `PUT` | `/api/students/:id` | ✅ Admin/Warden | Update student details |
| `DELETE` | `/api/students/:id` | ✅ Admin | Delete student |
| `GET` | `/api/rooms` | ✅ | List all rooms with occupancy |
| `PUT` | `/api/rooms/:id/allocate` | ✅ Admin/Warden | Allocate student to room |
| `GET` | `/api/complaints` | ✅ | List complaints (filtered by role) |
| `POST` | `/api/complaints` | ✅ Student | File a new complaint |
| `PUT` | `/api/complaints/:id` | ✅ Warden | Update complaint status |
| `GET` | `/api/fees` | ✅ | List fee invoices |
| `POST` | `/api/fees` | ✅ Admin | Issue new fee invoice |
| `POST` | `/api/fees/payment` | ✅ Student | Upload payment proof |
| `PUT` | `/api/fees/payment/:id` | ✅ Admin/Warden | Approve/reject payment |
| `GET` | `/api/leaves` | ✅ | List leave requests |
| `POST` | `/api/leaves` | ✅ Student | Submit leave application |
| `PUT` | `/api/leaves/:id` | ✅ Warden | Approve/reject leave |
| `GET` | `/api/analytics` | ✅ | Dashboard KPIs and metrics |
| `GET` | `/api/notices` | ✅ | List all notices |
| `POST` | `/api/notices` | ✅ Admin/Warden | Publish a notice |
| `GET` | `/api/inventory` | ✅ | List hostel assets |
| `POST` | `/api/broadcasts` | ✅ Admin | Send system-wide alert |
| `GET` | `/api/mess-menu` | ✅ | Get weekly meal schedule |
| `GET` | `/api/security` | ✅ Security | Get shifts and assignments |
| `POST` | `/api/security/alerts` | ✅ Security | File incident report |
| `POST` | `/api/attendance` | ✅ | Record check-in/check-out |
| `POST` | `/api/gate` | ✅ Security | Log student gate entry/exit |
| `GET/POST` | `/api/messages` | ✅ | Send and receive private messages |
| `GET/PUT` | `/api/staff` | ✅ | View and update staff profiles |

---

## 🛠️ Setup & Installation

### Prerequisites
Ensure the following are installed on your system before proceeding:
- **Node.js** v16.x or higher → [Download](https://nodejs.org/)
- **MySQL Server** v8.0 → [Download](https://dev.mysql.com/downloads/mysql/)
- **NPM** v8.x or higher (bundled with Node.js)
- **Git** → [Download](https://git-scm.com/)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/HostelHub.git
cd HostelHub
```

---

### Step 2 — Database Setup

Open **MySQL Workbench** or your MySQL client and run the following:

```sql
-- 1. Create the database
CREATE DATABASE hostelhub;
USE hostelhub;

-- 2. Import the full schema (all 18 tables)
SOURCE database/schema/tables.sql;

-- 3. (Optional) Load sample seed data for testing
SOURCE database/seeds/seed_data.sql;
```

Or via command line:

```bash
mysql -u root -p hostelhub < database/schema/tables.sql
```

---

### Step 3 — Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install all dependencies
npm install

# Copy the environment template and fill in your credentials
copy .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#-environment-variables) section below).

```bash
# Start the development server (auto-restarts on changes)
npm run dev
```

> The backend server will start on **http://localhost:5000** by default.

---

### Step 4 — Frontend Setup

Open a **new terminal window**:

```bash
# Navigate to the frontend directory
cd frontend

# Install all dependencies
npm install

# Start the Vite development server
npm run dev
```

> The frontend will be available at **http://localhost:5173** by default.

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory using `.env.example` as a template. The required variables are:

```env
# ── Server Configuration ────────────────────────────────
PORT=5000                          # Port the Express server listens on

# ── MySQL Database Configuration ────────────────────────
DB_HOST=localhost                  # MySQL server host
DB_PORT=3306                       # MySQL default port
DB_USER=root                       # Your MySQL username
DB_PASSWORD=your_mysql_password    # Your MySQL password
DB_NAME=hostelhub                  # Database name created in Step 2

# ── JWT Configuration ────────────────────────────────────
JWT_SECRET=your_super_secret_key   # Strong random string for signing JWTs
JWT_EXPIRES_IN=7d                  # Token expiry duration (e.g., 7d, 24h)

# ── File Upload Configuration ────────────────────────────
UPLOAD_PATH=./uploads              # Directory where payment proof files are stored
```

> ⚠️ **Never commit your `.env` file to Git.** It is already listed in `.gitignore`.
> Use a strong, random `JWT_SECRET` in production (minimum 32 characters).

---

## ▶️ Running the Application

Once both servers are running:

| Service | URL | Description |
|---|---|---|
| **Frontend** | http://localhost:5173 | React.js SPA — open in your browser |
| **Backend API** | http://localhost:5000 | Express.js REST API server |
| **API Health Check** | http://localhost:5000/api/test | Verifies backend is running |

### Default Login Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@hostelhub.com | admin123 |
| Warden | warden@hostelhub.com | warden123 |
| Student | student@hostelhub.com | student123 |
| Security | security@hostelhub.com | security123 |

> 💡 Change all default passwords immediately after first login in a production environment.

---

## 🔒 Security Architecture

HostelHub implements a multi-layered security model:

```
Request Flow:
Browser → Axios (adds JWT header) → Express Server
                                          │
                          ┌───────────────▼────────────────┐
                          │   helmet()  — Secure HTTP headers│
                          │   cors()    — Origin whitelisting │
                          │   morgan()  — Request logging     │
                          └───────────────┬────────────────┘
                                          │
                          ┌───────────────▼────────────────┐
                          │  JWT Middleware                  │
                          │  → Verify token signature        │
                          │  → Decode role from payload      │
                          │  → Reject if expired/invalid     │
                          └───────────────┬────────────────┘
                                          │
                          ┌───────────────▼────────────────┐
                          │  Role Check Middleware           │
                          │  → Allow only authorized roles  │
                          │  → 403 Forbidden if mismatch    │
                          └───────────────┬────────────────┘
                                          │
                          ┌───────────────▼────────────────┐
                          │  Controller → MySQL Query        │
                          │  → Execute & return JSON         │
                          └────────────────────────────────┘
```

| Security Layer | Technology | What It Protects |
|---|---|---|
| **Password Storage** | Bcrypt.js (salt + hash) | Passwords never stored in plain text |
| **Session Management** | JWT (RS256 / HS256) | Stateless, tamper-proof authentication |
| **HTTP Headers** | Helmet.js | XSS, clickjacking, MIME sniffing |
| **CORS Policy** | cors middleware | Restricts allowed request origins |
| **Env Secrets** | dotenv + .gitignore | DB creds & JWT secret kept out of code |
| **File Uploads** | Multer (type + size validation) | Restricts uploaded file types and sizes |
| **DB Integrity** | FK Constraints + ENUM | Prevents invalid or orphaned data |

---

## 🔮 Future Scope

The following enhancements are planned for future versions:

1. **💳 Online Payment Gateway** — Integrate Razorpay, Stripe, or UPI APIs to allow students to pay fees directly through the application, eliminating manual payment proof uploads.

2. **🤞 Biometric Integration** — Connect the gate log system to fingerprint scanners or facial recognition cameras. Gate passes would be validated biometrically, removing the need for manual QR scanning.

3. **📡 IoT Utility Monitoring** — Deploy smart meters and IoT sensors to monitor real-time electricity and water consumption per room/block, displayed as live usage graphs on the admin dashboard.

4. **📱 Mobile Application** — Build a companion **React Native** app for students and wardens to receive push notifications for leave approvals, complaint updates, fee reminders, and emergency broadcasts.

5. **📊 Automated PDF Reports** — Generate and email scheduled reports (weekly attendance, monthly fee collections, complaint resolution metrics) automatically to the institution administration.

6. **🤖 AI Chatbot Assistant** — Integrate an NLP-powered chatbot in the student portal to answer questions about hostel rules, mess timings, fee deadlines, and complaint status without warden intervention.

---

## 📄 License

This project is developed for **educational purposes** as part of a DBMS & Full-Stack Development Laboratory project at the undergraduate level.

```
Author:       Siddalingesh Karadi
USN:          1RV22CS045
Department:   Computer Science and Engineering
Institution:  RV College of Engineering
University:   Visvesvaraya Technological University (VTU)
Academic Year: 2025 – 2026
```

---

<div align="center">

*Built with ❤️ using React.js, Node.js, Express.js, MySQL, and Tailwind CSS*

**HostelHub** — *Turning hostel chaos into organized, digital harmony.*

</div>
