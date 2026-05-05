import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { LayoutDashboard, Users, Activity, Settings, LogOut, Bell, Calendar, Mail, Folder, Navigation, LineChart, Table, BookOpen, Layers, ShieldX, FileText, Syringe, HeartPulse, Stethoscope, PhoneCall, Bot, AlertCircle, X, Sun, Moon, Heart } from 'lucide-react';

export const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    const { isDark, toggleTheme } = useThemeStore();
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [secureMode, setSecureMode] = useState(true);
    const notifRef = useRef(null);
    const settingsRef = useRef(null);

    // Click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
            if (settingsRef.current && !settingsRef.current.contains(event.target)) setShowSettings(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (path) => location.pathname === path;
    const navLinkClass = (path) => 
        `flex items-center gap-3 px-4 py-3 rounded-[--radius-sm] font-semibold text-[13px] transition-all duration-200 ${
            isActive(path)
                ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950 border border-primary-200/60 dark:border-primary-800/60 shadow-sm'
                : 'text-[--text-secondary] hover:text-primary-600 dark:hover:text-primary-400 hover:bg-[--surface-soft]'
        }`;

    return (
        <div className="min-h-screen bg-[--bg] flex overflow-hidden font-sans transition-colors duration-300">
            {/* Left Sidebar */}
            <aside className="w-[272px] bg-[--surface] border-r border-[--border] hidden md:flex flex-col z-20 shrink-0 shadow-[--shadow-sm]">
                {/* Sidebar Header */}
                <div className="h-[68px] flex items-center px-6 shrink-0 border-b border-[--border]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[--radius-sm] bg-primary-600 flex items-center justify-center shadow-md">
                            <Heart className="w-5 h-5 text-white" fill="currentColor" />
                        </div>
                        <div>
                            <span className="font-bold text-[--text-primary] text-[15px] tracking-tight block leading-tight">Pediatric Hub</span>
                            <span className="text-[10px] font-semibold text-[--text-muted] uppercase tracking-wider">{user?.role} Portal</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
                    <nav className="space-y-1 px-4">
                        {/* Dashboard link — always visible */}
                        <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                            <LayoutDashboard size={18} strokeWidth={2} /> Dashboard
                        </Link>
                        
                        <div className="pt-5 text-[10px] uppercase font-bold text-[--text-muted] tracking-widest px-4 mb-2">Clinical Features</div>
                        
                        {/* PARENT FEATURES */}
                        {user?.role === 'PARENT' && (
                            <>
                                <Link to="/child/my-children" className={navLinkClass('/child/my-children')}>
                                    <Activity size={18} /> Child Health Records
                                </Link>
                                <Link to="/appointments" className={navLinkClass('/appointments')}>
                                    <Calendar size={18} /> Book Appointment
                                </Link>
                                <Link to="/vaccines" className={navLinkClass('/vaccines')}>
                                    <Syringe size={18} /> Vaccinations
                                </Link>
                                <Link to="/messages" className={navLinkClass('/messages')}>
                                    <Mail size={18} /> Message Doctor
                                </Link>
                                <Link to="/teleconsult" className={navLinkClass('/teleconsult')}>
                                    <PhoneCall size={18} /> Tele-Consultation
                                </Link>
                                <Link to="/education" className={navLinkClass('/education')}>
                                    <BookOpen size={18} /> Health Education
                                </Link>
                                <Link to="/emergency" className={navLinkClass('/emergency')}>
                                    <AlertCircle size={18} /> Emergency Guidance
                                </Link>
                                <Link to="/chatbot" className={navLinkClass('/chatbot')}>
                                    <Bot size={18} /> AI Chatbot
                                </Link>
                            </>
                        )}

                        {/* DOCTOR FEATURES */}
                        {user?.role === 'DOCTOR' && (
                            <>
                                <Link to="/appointments" className={navLinkClass('/appointments')}>
                                    <Calendar size={18} /> My Schedule
                                </Link>
                                <Link to="/patients" className={navLinkClass('/patients')}>
                                    <HeartPulse size={18} /> Patient Records
                                </Link>
                                <Link to="/messages" className={navLinkClass('/messages')}>
                                    <Mail size={18} /> Parent Messages
                                </Link>
                                <Link to="/teleconsult" className={navLinkClass('/teleconsult')}>
                                    <Stethoscope size={18} /> Provide Consultation
                                </Link>
                            </>
                        )}

                        {/* FACILITY FEATURES */}
                        {user?.role === 'FACILITY' && (
                            <>
                                <Link to="/facility/doctors" className={navLinkClass('/facility/doctors')}>
                                    <Stethoscope size={18} /> My Clinical Staff
                                </Link>
                            </>
                        )}

                        {/* ADMIN FEATURES */}
                        {user?.role === 'ADMIN' && (
                            <>
                                <Link to="/admin/users" className={navLinkClass('/admin/users')}>
                                    <Users size={18} /> Identity Access
                                </Link>
                                <Link to="/admin/doctors" className={navLinkClass('/admin/doctors')}>
                                    <Stethoscope size={18} /> Doctor Registry
                                </Link>
                                <Link to="/admin/facilities" className={navLinkClass('/admin/facilities')}>
                                    <Layers size={18} /> Facility Registry
                                </Link>
                                <Link to="/admin" className={navLinkClass('/admin')}>
                                    <ShieldX size={18} /> System Audit
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                
                {/* Top Header */}
                <header className="h-[68px] bg-[--surface] shrink-0 flex items-center justify-between px-6 lg:px-8 z-10 border-b border-[--border] shadow-[--shadow-sm]">
                    <div className="flex items-center gap-4 text-sm font-bold">
                        <div className="w-10 h-10 rounded-[--radius-sm] bg-primary-600 text-white overflow-hidden flex items-center justify-center font-bold shrink-0 text-lg uppercase shadow-sm">
                             {user?.profile?.firstName?.charAt(0) || user?.profile?.name?.charAt(0) || user?.role?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[14px] text-[--text-primary] leading-tight font-semibold">
                                {user?.profile?.firstName 
                                    ? `${user.role === 'DOCTOR' ? 'Dr. ' : ''}${user.profile.firstName} ${user.profile.lastName}` 
                                    : user?.profile?.name 
                                        ? user.profile.name 
                                        : `${user?.role || 'Authorized'} User`}
                            </span>
                            <span className="text-[10px] font-bold text-success tracking-widest uppercase">{user?.role} Portal</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex px-4 py-2 border border-[--border] rounded-[--radius-sm] text-[11px] font-semibold text-[--text-muted] uppercase tracking-wider items-center gap-3 bg-[--surface] cursor-default">
                           {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} <Calendar size={14} className="text-primary-500"/>
                        </div>
                        <div className="flex gap-1.5 items-center ml-2 border-l border-[--border] pl-4 relative">
                            {/* Theme Toggle */}
                            <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-[--radius-sm] border border-[--border] text-[--text-muted] hover:text-primary-600 hover:border-primary-400 transition-colors" aria-label="Toggle theme">
                                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                            <div ref={settingsRef}>
                                <button onClick={() => setShowSettings(!showSettings)} className="w-9 h-9 flex items-center justify-center rounded-[--radius-sm] border border-[--border] text-[--text-muted] hover:text-primary-600 hover:border-primary-400 transition-colors"><Settings size={16} /></button>
                                
                                {/* Settings Dropdown */}
                                {showSettings && (
                                    <div className="absolute top-[48px] right-20 w-72 bg-[--surface] rounded-[--radius-md] shadow-[--shadow-lg] z-[100] border border-[--border] overflow-hidden animate-fade-in flex flex-col">
                                        <div className="bg-primary-600 p-4 text-white flex justify-between items-center">
                                            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2"><Settings size={14} strokeWidth={3}/> Quick Settings</h2>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <div className="flex items-center justify-between pb-3 border-b border-[--border]">
                                                <div>
                                                    <h4 className="font-bold text-[13px] text-[--text-primary] leading-none">Email Notifications</h4>
                                                </div>
                                                <div onClick={() => setEmailNotifs(!emailNotifs)} className={`w-8 h-4 rounded-full relative cursor-pointer shadow-inner transition-colors ${emailNotifs ? 'bg-success' : 'bg-[--border]'}`}>
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-[2px] shadow-sm transition-all ${emailNotifs ? 'right-0.5' : 'left-0.5'}`}></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-1">
                                                <div>
                                                    <h4 className="font-bold text-[13px] text-[--text-primary] leading-none">Secured Data Mode</h4>
                                                </div>
                                                <div onClick={() => setSecureMode(!secureMode)} className={`w-8 h-4 rounded-full relative cursor-pointer shadow-inner transition-colors ${secureMode ? 'bg-primary-600' : 'bg-[--border]'}`}>
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-[2px] shadow-sm transition-all ${secureMode ? 'right-0.5' : 'left-0.5'}`}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div ref={notifRef}>
                                <button onClick={() => setShowNotifications(!showNotifications)} className="w-9 h-9 flex items-center justify-center rounded-[--radius-sm] border border-[--border] text-[--text-muted] hover:text-danger hover:border-danger transition-colors relative">
                                    <Bell size={16} />
                                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-danger rounded-full ring-2 ring-[--surface]"></span>
                                </button>
                                
                                {/* Notifications Flyout */}
                                {showNotifications && (
                                    <div className="absolute top-[48px] right-10 w-80 bg-[--surface] rounded-[--radius-md] shadow-[--shadow-lg] z-[100] border border-[--border] overflow-hidden animate-fade-in flex flex-col max-h-[400px]">
                                        <div className="bg-[--surface-soft] border-b border-[--border] p-4 flex justify-between items-center z-10">
                                            <div className="text-xs font-bold uppercase tracking-widest text-[--text-primary] flex items-center gap-2"><Bell size={14}/> Notifications</div>
                                            <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded uppercase tracking-widest cursor-pointer hover:bg-primary-600 hover:text-white transition-colors">Mark All Read</div>
                                        </div>
                                        <div className="overflow-y-auto custom-scrollbar">
                                            <div className="p-4 border-b border-[--border] hover:bg-[--surface-soft] cursor-pointer transition-colors relative">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-success"></div>
                                                <h4 className="text-sm font-bold text-[--text-primary] tracking-tight leading-tight mb-1">{user?.role === 'ADMIN' ? 'IAM Hierarchy Updated' : 'New Clinical Endpoint Available'}</h4>
                                                <p className="text-xs text-[--text-secondary] font-medium line-clamp-2">{user?.role === 'ADMIN' ? 'Administrator successfully modified identity registry matrices.' : 'The vaccination tracking subsystem has been successfully synchronized.'}</p>
                                                <span className="text-[10px] font-bold text-[--text-muted] mt-2 block">System • 2 mins ago</span>
                                            </div>
                                            <div className="p-4 border-b border-[--border] hover:bg-[--surface-soft] cursor-pointer transition-colors relative">
                                                <h4 className="text-sm font-bold text-[--text-primary] tracking-tight leading-tight mb-1">Global System Message</h4>
                                                <p className="text-xs text-[--text-secondary] font-medium line-clamp-2">Ensure your local timezone parameters are correctly configured before scheduling procedures.</p>
                                                <span className="text-[10px] font-bold text-[--text-muted] mt-2 block">Reminder • 1 hour ago</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <button onClick={logout} title="Log Out" className="w-9 h-9 flex items-center justify-center rounded-[--radius-sm] border border-[--border] text-[--text-muted] hover:text-danger hover:border-danger transition-colors ml-1"><LogOut size={16} /></button>
                        </div>
                    </div>
                </header>

                {/* Sub Nav (Teal Toolbar) */}
                <div className="h-[48px] bg-primary-600 dark:bg-primary-700 text-white shrink-0 flex items-center justify-between px-6 lg:px-8 shadow-sm">
                    <div className="flex items-center gap-5 h-full">
                        <div className="flex items-center gap-1 border-r border-primary-500 dark:border-primary-600 pr-5 h-full py-2">
                            {user?.role !== 'ADMIN' && (
                                <>
                                    <Link to="/appointments" title="Appointments" className="h-full w-9 flex items-center justify-center hover:bg-primary-500 dark:hover:bg-primary-600 rounded-[--radius-sm] transition-colors"><Calendar size={15} strokeWidth={2.5}/></Link>
                                    <Link to={user?.role === 'DOCTOR' ? "/patients" : "/child/my-children"} title="Health Records" className="h-full w-9 flex items-center justify-center hover:bg-primary-500 dark:hover:bg-primary-600 rounded-[--radius-sm] transition-colors"><Folder size={15} strokeWidth={2.5}/></Link>
                                    <Link to="/teleconsult" title="Teleconsultation" className="h-full w-9 flex items-center justify-center hover:bg-primary-500 dark:hover:bg-primary-600 rounded-[--radius-sm] transition-colors"><Activity size={15} strokeWidth={2.5}/></Link>
                                </>
                            )}
                            {user?.role === 'PARENT' && (
                                <Link to="/chatbot" title="AI Health Assistant" className="h-full w-9 flex items-center justify-center hover:bg-primary-500 dark:hover:bg-primary-600 rounded-[--radius-sm] transition-colors"><Bot size={15} strokeWidth={2.5}/></Link>
                            )}
                            {user?.role === 'ADMIN' && (
                                <Link to="/admin" title="Admin Control Center" className="h-full w-9 flex items-center justify-center bg-primary-500 dark:bg-primary-600 shadow-inner text-white rounded-[--radius-sm] transition-colors"><LayoutDashboard size={15} strokeWidth={2.5}/></Link>
                            )}
                        </div>
                        <div className="flex items-center gap-2.5 tracking-wide">
                            <span className="font-bold text-base tracking-tight">Dashboard</span>
                            <span className="text-primary-200 text-[11px] font-medium ml-1">Home &rsaquo; Main Dashboard</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-[10px] font-bold tracking-widest uppercase text-primary-200">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div> 
                        Secure Session Active
                    </div>
                </div>

                {/* Content Render Pane */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth bg-[--bg]">
                    <div className="w-full max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
