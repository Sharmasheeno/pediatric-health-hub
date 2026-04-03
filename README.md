# Pediatric Health Hub

## 🩺 Overview
Pediatric Health Hub is a comprehensive, production-ready web application designed to streamline pediatric healthcare services. It bridges the gap between parents, doctors, and healthcare administrators by offering a unified platform for appointments, teleconsultations, child health tracking, and role-based management.

## ✨ Features
- **Real-Time Appointment Booking**: Parents can seamlessly discover registered doctors, view their availability, and bind appointments to specific child records.
- **Teleconsultation Hub**: A dedicated interface for live, database-driven virtual consultations.
- **Role-Based Portals**:
  - **Admin Portal**: Fully functional dashboard to oversee operations, verify user accounts, and resolve system complaints.
  - **Doctor Portal**: Efficient scheduling, patient record access, and teleconsultation management.
  - **Parent Portal**: Convenient appointment booking, health tracking, and medical history access for their children.
- **Dynamic UI/UX**: Robust, responsive interfaces built with React, Vite, and Tailwind CSS.
- **Secure Authentication**: JWT-based secure sessions with strictly enforced role-based access control (RBAC).

## 🛠️ Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, Zustand (State Management), React Query, React Hook Form, Recharts.
- **Backend**: Node.js, Express.js, Prisma ORM, JSON Web Tokens (JWT), bcrypt.
- **Database**: Relational Database (SQL-compatible via Prisma).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A relational database (e.g., PostgreSQL, MySQL)

### Installation
1. **Clone the repository:**
   ```bash
   git clone <YOUR_REPO_URL>
   cd pediatric-health-hub
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Configure your environment variables
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:5173` (or the port defined by Vite).

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📄 License
This project is licensed under the ISC License.
