# Pediatric Health Hub

![Pediatric Health Hub](https://img.shields.io/badge/Status-Production_Ready-success) ![React](https://img.shields.io/badge/Frontend-React_Vite-blue) ![Node](https://img.shields.io/badge/Backend-Node.js_Express-green) ![MySQL](https://img.shields.io/badge/Database-MySQL_Prisma-blue)

## 🩺 Overview
Pediatric Health Hub is a comprehensive, production-ready web application designed to streamline pediatric healthcare services. It bridges the gap between parents, doctors, clinical facilities, and healthcare administrators by offering a unified platform for appointments, teleconsultations, child health tracking, and role-based management.

## ✨ Core Features & Portals
The platform enforces strict Role-Based Access Control (RBAC) via secure JWT sessions. Upon login, users are routed to their specialized dashboards:

### 1. 👨‍👩‍👧 Parent Portal
Designed for convenience and proactive child health management.
- **Child Health Records**: Track growth charts, medical histories, and clinical notes.
- **Appointment Booking**: Real-time scheduling with registered pediatricians.
- **Vaccine Tracker**: Monitor upcoming and completed immunizations.
- **Teleconsultation**: Join secure virtual meetings with doctors.
- **Messaging & AI**: Direct messaging with doctors and an AI Health Assistant for quick pediatric guidance.

### 2. 👨‍⚕️ Doctor Portal
Designed for clinical efficiency and patient management.
- **My Schedule**: Manage daily appointments and availability.
- **Patient Records**: Access assigned patients' medical histories and growth records.
- **Teleconsultation Provider**: Host virtual appointments.
- **Parent Messages**: Direct inbox to communicate securely with parents.

### 3. 🏥 Facility Portal
Designed for clinical administrators and hospital managers.
- **My Clinical Staff**: Manage the registry of doctors associated with the specific medical facility.
- **Operations Overview**: Monitor facility-level scheduling and resources.

### 4. 🛡️ Admin Portal
Designed for ultimate system oversight and governance.
- **Identity Access**: Manage all system users, roles, and security protocols.
- **Doctor & Facility Registries**: Approve and oversee registered doctors and medical facilities.
- **System Audit**: Monitor platform usage, security events, and system notifications.

## 📸 System Previews

### Secure Authentication
Professional login portal with role-based routing and a comprehensive forgot-password OTP flow.
<img src="Screenshoots/Screenshot%202026-05-06%20013058.png" alt="Login Page" width="800"/>

### Parent Portal: Comprehensive Health Tracking
Parents have access to an intuitive dashboard summarizing their children's appointments, completed teleconsultations, and vaccination tracking.
<img src="Screenshoots/Screenshot%202026-05-06%20012438.png" alt="Parent Dashboard Overview" width="800"/>

### AI Health Assistant
Built-in AI pediatric guidance providing instant, reliable information and health recommendations for parents.
<img src="Screenshoots/Screenshot%202026-05-06%20013251.png" alt="AI Health Assistant" width="800"/>

### Doctor Portal: Tele-Consultation Hub
Real-time, secure video teleconsultation rooms allowing doctors to remotely evaluate patients directly within the platform.
<img src="Screenshoots/Screenshot%202026-05-06%20012644.png" alt="Doctor Tele-Consultation" width="800"/>

### Admin Portal: Telemetry & Analytics
High-level overview for administrators to monitor platform activity, user ingress, and system health in real-time.
<img src="Screenshoots/Screenshot%202026-05-06%20012326.png" alt="Admin Dashboard Telemetry" width="800"/>

### Admin Portal: User & Facility Management
Complete oversight of all registered users (Parents, Doctors, Facilities) with strict access control and auditing.
<img src="Screenshoots/Screenshot%202026-05-06%20012348.png" alt="User Management" width="800"/>
<br/><br/>
<img src="Screenshoots/Screenshot%202026-05-06%20012406.png" alt="Facility Registry" width="800"/>

## 🔑 Default Users & Credentials
When the database is seeded, the following default accounts are created for testing and deployment purposes:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@pediatric-hub.com` | `admin123` |
| **Doctor** | `doctor@pediatric-hub.com` | `doctor123` |
| **Facility** | `facility@pediatric-hub.com` | `facility123` |
| **Parent** | `parent@pediatric-hub.com` | `parent123` |

## 🛠️ Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, Zustand (State Management), React Query, React Hook Form, Recharts, Lucide Icons.
- **Backend**: Node.js, Express.js, Prisma ORM, JSON Web Tokens (JWT), bcrypt.
- **Database**: MySQL (Accessed via Prisma ORM).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Database Server (Ensure `DATABASE_URL` is set in `backend/.env`)

### Easy 1-Click Setup (Windows)
We have provided an automated script that installs all dependencies, configures the database, seeds the default users, and launches the application.
1. Double-click the **`setup-and-run.bat`** file located in the root directory.
2. Wait for the dependencies to install and the servers to boot.
3. Access the application at `http://localhost:5173`.

### Manual Installation
If you prefer to start the servers manually:

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   node prisma/seed.js # Seeds the default users
   npm run dev
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Ensure you adhere to the established ESLint rules and UI/UX design language.

## 📄 License
This project is licensed under the ISC License.
