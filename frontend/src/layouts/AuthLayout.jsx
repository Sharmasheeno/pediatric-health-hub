import { Outlet, useLocation } from 'react-router-dom';
import { Heart, Shield, Users, Activity, Stethoscope, Sun, Moon } from 'lucide-react';
import useThemeStore from '../store/themeStore';

export const AuthLayout = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const location = useLocation();
  const isForgotPassword = location.pathname === '/forgot-password';

  return (
    <div className="min-h-screen flex bg-[--bg] transition-colors duration-300">
      
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 35%, #1E40AF 65%, #1E3A8A 100%)'
        }} />
        
        {/* Decorative orbs */}
        <div className="absolute top-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.5) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-120px] left-[-40px] w-[450px] h-[450px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(147,197,253,0.4) 0%, transparent 70%)' }} />
        <div className="absolute top-[45%] left-[55%] w-[180px] h-[180px] rounded-full opacity-15 animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />
        
        {/* Pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' fill='%23fff' fill-opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />
        
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[--radius-md] flex items-center justify-center shadow-lg"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Pediatric Health Hub</span>
          </div>
          
          {/* Hero */}
          <div className="max-w-md space-y-7">
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.12] tracking-tight">
              Care for every
              <span className="block text-primary-200">child, every day.</span>
            </h1>
            <p className="text-blue-100/80 text-base xl:text-lg leading-relaxed font-medium">
              Empowering better pediatric care through trusted technology, seamless collaboration, and compassionate experiences for every child.
            </p>
            
            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                { icon: Shield, label: 'Secure & Private' },
                { icon: Users, label: '4 Portals' },
                { icon: Stethoscope, label: 'Teleconsult' },
                { icon: Activity, label: 'Growth Tracking' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-white/90"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <item.icon size={14} strokeWidth={2.5} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-blue-200/40 text-xs font-medium">
            © 2026 Pediatric Health Hub · All rights reserved
          </p>
        </div>
      </div>
      
      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-6 sm:px-10 py-5">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-9 h-9 rounded-[--radius-sm] bg-primary-600 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-[--text-primary] text-lg tracking-tight">Pediatric Health Hub</span>
          </div>
          <div className="hidden lg:block" />
          
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-[--radius-sm] flex items-center justify-center transition-all duration-200 shadow-sm border border-[--border] bg-[--surface] text-[--text-muted] hover:text-primary-600 hover:border-primary-300"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 pb-12">
          <div className="w-full max-w-[420px] space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-[--text-primary] tracking-tight">
                {isForgotPassword ? 'Account Recovery' : 'Welcome back'}
              </h2>
              <p className="text-[--text-secondary] font-medium">
                {isForgotPassword 
                  ? 'Securely reset your password using email verification.' 
                  : 'Sign in to access your secure clinical dashboard.'}
              </p>
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
