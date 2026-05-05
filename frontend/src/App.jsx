import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Heart, Sun, Moon, ArrowRight, Shield, Users, Stethoscope, Activity, Calendar, Syringe, Phone, Bot, BookOpen, ChevronRight } from 'lucide-react';
import useThemeStore from './store/themeStore';

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
import { AdminDoctors } from './pages/admin/AdminDoctors';
import { AdminFacilities } from './pages/admin/AdminFacilities';
import { MainDashboard } from './pages/dashboard/MainDashboard';
import { FacilityDoctors } from './pages/facility/FacilityDoctors';
import { 
  PatientListPlaceholder
} from './pages/dashboard/Placeholders';
import { TeleconsultHub } from './pages/dashboard/TeleconsultHub';
import { EmergencyGuidance } from './pages/dashboard/EmergencyGuidance';
import { HealthEducation } from './pages/dashboard/HealthEducation';
import { MyChildren } from './pages/dashboard/MyChildren';
import { DoctorSchedule } from './pages/doctor/DoctorSchedule';
import { PatientRecords } from './pages/doctor/PatientRecords';
import { DoctorInbox } from './pages/dashboard/DoctorInbox';
import useAuthStore from './store/authStore';

// Conditional Router for Appointment overlap
const AppointmentRouter = () => {
    const userRole = useAuthStore(state => state.user?.role);
    return userRole === 'DOCTOR' ? <DoctorSchedule /> : <BookingFlow />;
};

/* ============================================================
   PUBLIC LANDING PAGE
   ============================================================ */
const PublicLanding = () => {
  const { isDark, toggleTheme } = useThemeStore();

  const services = [
    { icon: Calendar, title: 'Smart Appointments', desc: 'Book visits with pediatricians instantly. Real-time availability and automated reminders.' , color: 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400' },
    { icon: Phone, title: 'Teleconsultation', desc: 'Secure video calls with your child\'s doctor from the comfort of home.', color: 'bg-teal/10 dark:bg-teal/5 text-teal' },
    { icon: Syringe, title: 'Vaccine Tracking', desc: 'Automated immunization schedules with milestone alerts and compliance monitoring.', color: 'bg-violet/10 dark:bg-violet/5 text-violet' },
    { icon: Activity, title: 'Growth Analytics', desc: 'WHO-standard growth charts with percentile tracking and developmental insights.', color: 'bg-success/10 dark:bg-success/5 text-success' },
    { icon: Bot, title: 'AI Health Assistant', desc: 'Instant pediatric guidance with symptom assessment and care recommendations.', color: 'bg-warning/10 dark:bg-warning/5 text-warning' },
    { icon: BookOpen, title: 'Health Education', desc: 'Curated articles and resources on child nutrition, development, and wellness.', color: 'bg-danger/10 dark:bg-danger/5 text-danger' },
  ];

  const stats = [
    { value: '4', label: 'Secure Portals' },
    { value: '24/7', label: 'Teleconsult Access' },
    { value: '100%', label: 'HIPAA Ready' },
    { value: '∞', label: 'Children Protected' },
  ];

  return (
    <div className="min-h-screen bg-[--bg] transition-colors duration-300">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[--surface]/80 dark:bg-[--bg]/80 backdrop-blur-xl border-b border-[--border]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[--radius-sm] bg-primary-600 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-lg text-[--text-primary] tracking-tight">Pediatric Health Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-[--radius-sm] flex items-center justify-center border border-[--border] bg-[--surface] text-[--text-muted] hover:text-primary-600 hover:border-primary-300 transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a href="/login" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-[--radius-sm] font-semibold text-sm shadow-md hover:shadow-lg transition-all">
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 px-6 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-primary-500/5 dark:bg-primary-400/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-32 right-0 w-72 h-72 bg-teal/10 dark:bg-teal/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-48 left-0 w-56 h-56 bg-violet/10 dark:bg-violet/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
          {/* Left — Text */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Trusted by Clinics & Families
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[--text-primary] tracking-tight leading-[1.1]">
              Smart Healthcare
              <span className="block mt-2" style={{
                background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>for Every Child</span>
            </h1>

            <p className="text-lg text-[--text-secondary] font-medium leading-relaxed max-w-lg">
              The comprehensive clinical platform connecting Parents, Doctors, Facilities, and Administrators — streamlining pediatric care from appointments to teleconsultations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/login" className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-[--radius-md] font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#services" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-[--border] hover:border-primary-400 text-[--text-secondary] hover:text-primary-600 rounded-[--radius-md] font-semibold text-base transition-all">
                Explore Services
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 pt-4">
              {stats.map((s, i) => (
                <div key={i} className="text-center sm:text-left">
                  <div className="text-2xl font-extrabold text-[--text-primary]">{s.value}</div>
                  <div className="text-xs font-medium text-[--text-muted] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Hero Image */}
          <div className="relative animate-slide-up hidden lg:block">
            <div className="relative rounded-[--radius-2xl] overflow-hidden shadow-2xl border border-[--border]">
              <img
                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&q=80"
                alt="Pediatric doctor examining a child"
                className="w-full h-[480px] object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 dark:bg-[--surface-elevated]/90 backdrop-blur-md rounded-[--radius-md] p-4 shadow-lg border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <Shield size={20} className="text-success" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[--text-primary]">Secure & Compliant</div>
                      <div className="text-xs text-[--text-muted]">HIPAA-ready encryption for all patient data</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating card */}
            <div className="absolute -left-8 top-12 bg-[--surface] rounded-[--radius-md] p-4 shadow-xl border border-[--border] animate-float" style={{ animationDelay: '-2s' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <Stethoscope size={18} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[--text-primary]">Dr. Sarah Kim</div>
                  <div className="text-xs text-success font-medium">● Available now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-20 lg:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider">
              Our Services
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight">
              Everything Your Child Needs
            </h2>
            <p className="text-[--text-secondary] font-medium max-w-2xl mx-auto">
              A full-spectrum pediatric management system designed for modern healthcare delivery.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <div key={i} className="group p-6 rounded-[--radius-md] bg-[--surface] border border-[--border] hover:border-primary-300 dark:hover:border-primary-700 shadow-[--shadow-sm] hover:shadow-[--shadow-lg] transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-[--radius-sm] ${s.color} flex items-center justify-center mb-5`}>
                  <s.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-[--text-primary] mb-2">{s.title}</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / CTA SECTION ── */}
      <section className="py-20 lg:py-28 px-6 bg-[--surface-soft]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative rounded-[--radius-2xl] overflow-hidden shadow-xl border border-[--border]">
            <img
              src="https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80"
              alt="Happy mother with healthy child at pediatric clinic"
              className="w-full h-[400px] object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 via-transparent to-transparent" />
          </div>

          {/* Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 text-teal text-xs font-bold uppercase tracking-wider">
              Why Choose Us
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight leading-tight">
              Bringing care closer<br/>to families
            </h2>
            <p className="text-[--text-secondary] font-medium leading-relaxed">
              We combine clinical excellence with modern technology to deliver safe, connected, and compassionate pediatric care. Every feature is designed with your child's wellbeing in mind.
            </p>
            <div className="space-y-4 pt-2">
              {[
                'Role-based portals for Parents, Doctors, Facilities & Admins',
                'Real-time teleconsultation with secure video & messaging',
                'Automated vaccine schedules with smart compliance alerts',
                'WHO-standard growth tracking with visual analytics',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center mt-0.5 shrink-0">
                    <ChevronRight size={12} className="text-success" />
                  </div>
                  <span className="text-sm text-[--text-secondary] font-medium">{item}</span>
                </div>
              ))}
            </div>
            <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-[--radius-sm] font-semibold text-sm shadow-md hover:shadow-lg transition-all mt-4">
              Start Using the Platform <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ── PORTALS OVERVIEW ── */}
      <section className="py-20 lg:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight">
              One Platform, Four Portals
            </h2>
            <p className="text-[--text-secondary] font-medium max-w-2xl mx-auto">
              Each user role gets a tailored experience designed for their specific needs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: 'Parent', icon: Users, desc: 'Manage child profiles, book appointments, track vaccines & growth.', img: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400&q=80' },
              { role: 'Doctor', icon: Stethoscope, desc: 'View patient queues, conduct teleconsults, manage clinical notes.', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80' },
              { role: 'Facility', icon: Activity, desc: 'Oversee staff, manage departments, monitor facility operations.', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80' },
              { role: 'Admin', icon: Shield, desc: 'Control users, permissions, system analytics, and audit logs.', img: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80' },
            ].map((p, i) => (
              <div key={i} className="group rounded-[--radius-lg] overflow-hidden bg-[--surface] border border-[--border] hover:border-primary-300 dark:hover:border-primary-700 shadow-[--shadow-sm] hover:shadow-[--shadow-lg] transition-all duration-300 hover:-translate-y-1">
                <div className="h-40 overflow-hidden">
                  <img src={p.img} alt={`${p.role} portal`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <p.icon size={18} className="text-primary-600 dark:text-primary-400" />
                    <h3 className="font-bold text-[--text-primary]">{p.role} Portal</h3>
                  </div>
                  <p className="text-sm text-[--text-secondary] leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center rounded-[--radius-2xl] p-12 lg:p-16 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #1E3A8A 100%)'
        }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(147,197,253,0.5) 0%, transparent 70%)' }} />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Transform Pediatric Care?
            </h2>
            <p className="text-blue-100/80 text-lg font-medium max-w-xl mx-auto">
              Join families and healthcare providers who trust Pediatric Health Hub for comprehensive child healthcare management.
            </p>
            <a href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-[--radius-md] font-bold text-base shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
              Access Dashboard <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[--border] py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" fill="currentColor" />
                </div>
                <span className="font-bold text-[--text-primary]">Pediatric Health Hub</span>
              </div>
              <p className="text-sm text-[--text-muted] leading-relaxed">
                A unified clinical platform for comprehensive pediatric care management.
              </p>
            </div>
            {/* Links */}
            {[
              { title: 'Platform', links: ['Appointments', 'Teleconsultation', 'Vaccine Tracking', 'Growth Charts'] },
              { title: 'Portals', links: ['Parent Portal', 'Doctor Portal', 'Facility Portal', 'Admin Portal'] },
              { title: 'Support', links: ['Documentation', 'Contact Us', 'Privacy Policy', 'Terms of Service'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold text-[--text-primary] text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link, j) => (
                    <li key={j}><span className="text-sm text-[--text-muted] hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">{link}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[--border]">
            <p className="text-sm text-[--text-muted]">© 2026 Pediatric Health Hub. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs font-bold text-[--text-muted] uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              System Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ============================================================
   APP ROUTER — ALL ROUTES PRESERVED
   ============================================================ */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLanding />} />
        
        {/* Auth Zone */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
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
             <Route path="/admin/doctors" element={<AdminDoctors />} />
             <Route path="/admin/facilities" element={<AdminFacilities />} />
             <Route path="/education" element={<HealthEducation />} />
             <Route path="/emergency" element={<EmergencyGuidance />} />
             <Route path="/patients" element={<PatientRecords />} />
             <Route path="/messages" element={<DoctorInbox />} />
             <Route path="/facility/doctors" element={<FacilityDoctors />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
