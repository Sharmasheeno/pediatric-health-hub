import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/auth/Login';

// Import All Generated Dashboards & Pages
import { ChildProfile } from './pages/dashboard/ChildProfile';
import { GrowthDashboard } from './pages/dashboard/GrowthDashboard';
import { VaccineTracker } from './pages/dashboard/VaccineTracker';
import { GlobalVaccineTracker } from './pages/dashboard/GlobalVaccineTracker';
import { BookingFlow } from './pages/dashboard/BookingFlow';
import { TeleconsultSession } from './pages/dashboard/TeleconsultSession';
import { Chatbot } from './pages/dashboard/Chatbot';
import { AdminDashboard } from './pages/admin/AdminDashboard'; 
import { ManageUsers } from './pages/admin/ManageUsers';
import { MainDashboard } from './pages/dashboard/MainDashboard';
import { 
  PatientListPlaceholder
} from './pages/dashboard/Placeholders';
import { TeleconsultHub } from './pages/dashboard/TeleconsultHub';
import { EmergencyGuidance } from './pages/dashboard/EmergencyGuidance';
import { HealthEducation } from './pages/dashboard/HealthEducation';
import { MyChildren } from './pages/dashboard/MyChildren';
import { DoctorSchedule } from './pages/doctor/DoctorSchedule';
import { PatientRecords } from './pages/doctor/PatientRecords';
import useAuthStore from './store/authStore';

// Conditional Router for Appointment overlap
const AppointmentRouter = () => {
    const userRole = useAuthStore(state => state.user?.role);
    return userRole === 'DOCTOR' ? <DoctorSchedule /> : <BookingFlow />;
};
const PublicLanding = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="max-w-2xl text-center space-y-6">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-2xl shadow-xl mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"></path></svg>
      </div>
      <h1 className="text-5xl sm:text-6xl font-black text-slate-800 tracking-tight">Pediatric Health Hub</h1>
      <p className="text-xl text-slate-500 font-medium">The comprehensive clinical operations platform for Parents, Providers, and Administrators.</p>
      
      <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/login" className="px-8 py-3.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/30 font-bold hover:-translate-y-1 transition-transform">Access Core Dashboard</a>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLanding />} />
        
        {/* Auth Zone */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Navigate to="/login" />} />
        </Route>
        
        {/* Secure Dashboard Core */}
        <Route element={<ProtectedRoute allowedRoles={['PARENT', 'DOCTOR', 'FACILITY', 'ADMIN']} />}>
          <Route element={<DashboardLayout />}>
             <Route path="/dashboard" element={<MainDashboard />} />
             <Route path="/child/my-children" element={<MyChildren />} />
             <Route path="/child/:id" element={<ChildProfile />} />
             <Route path="/child/:id/growth" element={<GrowthDashboard />} />
             <Route path="/child/:id/vaccines" element={<VaccineTracker />} />
             <Route path="/vaccines" element={<GlobalVaccineTracker />} />
             <Route path="/appointments" element={<AppointmentRouter />} />
             <Route path="/teleconsult" element={<TeleconsultHub />} />
             <Route path="/teleconsult/:appointmentId" element={<TeleconsultSession />} />
             <Route path="/chatbot" element={<Chatbot />} />
             <Route path="/admin" element={<AdminDashboard />} />
             <Route path="/admin/users" element={<ManageUsers />} />
             <Route path="/education" element={<HealthEducation />} />
             <Route path="/emergency" element={<EmergencyGuidance />} />
             <Route path="/patients" element={<PatientRecords />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
