import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { api } from '../lib/axios';
import { BrandLogo } from '../components/BrandLogo';
import { useBranding } from '../contexts/useBranding';
import { LayoutDashboard, Users, Activity, Settings, LogOut, Bell, Calendar, Mail, Folder, Navigation, LineChart, Table, BookOpen, Layers, ShieldX, FileText, Syringe, HeartPulse, Stethoscope, PhoneCall, Bot, AlertCircle, X, Sun, Moon, Menu } from 'lucide-react';

export const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    const branding = useBranding();
    const { isDark, toggleTheme } = useThemeStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showMobileNav, setShowMobileNav] = useState(false);
    const [wideBrandLogo, setWideBrandLogo] = useState(false);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [secureMode, setSecureMode] = useState(true);
    const notifRef = useRef(null);
    const settingsRef = useRef(null);
    const [dismissedIncomingCallId, setDismissedIncomingCallId] = useState(null);

    const { data: incomingDoctorCall } = useQuery({
        queryKey: ['incomingDoctorCall', user?.id],
        enabled: user?.role === 'PARENT',
        queryFn: async () => {
            try {
            const response = await api.get('/appointments/my-schedule', {
                params: { _callPoll: Date.now() },
                headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
            });
            return response.data.data.appointments?.find(appointment =>
                appointment.status === 'CONFIRMED' &&
                appointment.teleconsultation?.initiatedByRole === 'DOCTOR' &&
                appointment.teleconsultation.startedAt &&
                !appointment.teleconsultation.endedAt
            ) || null;
            } catch (error) {
                console.warn('[Teleconsult] Could not refresh incoming-call state:', error);
                return null;
            }
        },
        refetchInterval: 2500,
        refetchIntervalInBackground: true
    });

    const shouldShowIncomingCall = incomingDoctorCall &&
        !location.pathname.match(/^\/teleconsult\/[^/]+$/) &&
        dismissedIncomingCallId !== incomingDoctorCall.id;

    useEffect(() => {
        if (!shouldShowIncomingCall) return undefined;

        let audioContext;
        const ring = async () => {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;
                audioContext ||= new AudioContext();
                if (audioContext.state !== 'running') await audioContext.resume();
                if (audioContext.state !== 'running') return;

                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(520, audioContext.currentTime + 0.18);
                gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.65);
                oscillator.connect(gain);
                gain.connect(audioContext.destination);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.7);
            } catch (error) {
                console.warn('[Teleconsult] Incoming-call audio is unavailable:', error);
            }
        };

        ring();
        const interval = window.setInterval(ring, 2200);
        return () => {
            window.clearInterval(interval);
            audioContext?.close();
        };
    }, [shouldShowIncomingCall]);

    const showWideBrandLogo = Boolean(branding.logoDataUrl && wideBrandLogo);

    // Click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
            if (settingsRef.current && !settingsRef.current.contains(event.target)) setShowSettings(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (path) => location.pathname === path || (
        path !== '/admin' && location.pathname.startsWith(`${path}/`)
    ) || (path === '/child/my-children' && location.pathname.startsWith('/child/'));
    const navLinkClass = (path) =>
        `group relative flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[13px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
            isActive(path)
                ? 'border-primary-700/25 bg-primary-600 font-bold text-[var(--color-primary-foreground)] shadow-[0_8px_20px_-12px_var(--color-primary-600)] before:absolute before:bottom-2 before:left-0 before:top-2 before:w-1 before:rounded-r-full before:bg-[var(--color-primary-foreground)]'
                : 'border-transparent font-semibold text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] hover:shadow-sm'
        }`;

    return (
        <div className="min-h-screen bg-[var(--bg)] flex overflow-hidden font-sans transition-colors duration-300">
            {/* Left Sidebar */}
            <aside className="z-20 hidden w-[284px] shrink-0 flex-col border-r border-[var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,var(--surface-soft)_100%)] shadow-[var(--shadow-sm)] md:flex">
                {/* Sidebar Header */}
                <div className="flex h-[76px] shrink-0 items-center border-b border-[var(--border)] bg-[var(--surface)] px-4">
                    <div className={`flex w-full items-center ${showWideBrandLogo ? 'justify-center' : 'gap-3'}`}>
                        <BrandLogo
                            className={showWideBrandLogo ? 'h-[52px] w-full max-w-[220px]' : 'h-11 w-11'}
                            iconSize={24}
                            onImageLoad={aspectRatio => setWideBrandLogo(aspectRatio >= 2.3)}
                        />
                        {!showWideBrandLogo && (
                            <div className="min-w-0">
                                <span className="block truncate text-[15px] font-bold leading-tight tracking-tight text-[var(--text-primary)]">{branding.shortName}</span>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{user?.role} Portal</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="custom-scrollbar flex-1 overflow-y-auto py-5">
                    <nav aria-label="Primary navigation" className="space-y-1 px-3">
                        <div className="mb-2 flex items-center gap-2 px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            <span>Workspace</span><span className="h-px flex-1 bg-[var(--border)]" />
                        </div>
                        <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                            <LayoutDashboard size={18} strokeWidth={2} /> Dashboard
                        </Link>

                        <div className="mb-2 mt-6 flex items-center gap-2 px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            <span>{user?.role === 'ADMIN' ? 'Administration' : user?.role === 'DOCTOR' ? 'Clinical workspace' : 'Care & communication'}</span>
                            <span className="h-px flex-1 bg-[var(--border)]" />
                        </div>

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
                                <Link to="/admin/settings" className={navLinkClass('/admin/settings')}>
                                    <Settings size={18} /> Organization Settings
                                </Link>
                                <Link to="/admin/assistant-knowledge" className={navLinkClass('/admin/assistant-knowledge')}>
                                    <Bot size={18} /> Assistant Knowledge
                                </Link>
                                <Link to="/admin" className={navLinkClass('/admin')}>
                                    <ShieldX size={18} /> System Audit
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
                <div className="shrink-0 border-t border-[var(--border)] p-3">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200"><HeartPulse size={15} /></span>
                            <span className="min-w-0 truncate">{branding.shortName}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[var(--text-muted)]">{branding.tagline}</p>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Top Header */}
                <header className="h-[64px] sm:h-[68px] bg-[var(--surface)] shrink-0 flex items-center justify-between px-3 sm:px-6 lg:px-8 z-10 border-b border-[var(--border)] shadow-[var(--shadow-sm)]">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-4 text-sm font-bold">
                        <button onClick={() => setShowMobileNav(true)} className="md:hidden w-10 h-10 shrink-0 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-secondary)]" aria-label="Open navigation menu">
                            <Menu size={19} />
                        </button>
                        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-primary-600 text-[var(--color-primary-foreground)] overflow-hidden flex items-center justify-center font-bold shrink-0 text-lg uppercase shadow-sm">
                             {user?.profile?.firstName?.charAt(0) || user?.profile?.name?.charAt(0) || user?.role?.charAt(0) || 'U'}
                        </div>
                        <div className="flex min-w-0 flex-col justify-center">
                            <span className="max-w-[35vw] truncate text-[13px] sm:max-w-none sm:text-[14px] text-[var(--text-primary)] leading-tight font-semibold">
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
                        <div className="hidden sm:flex px-4 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider items-center gap-3 bg-[var(--surface)] cursor-default">
                           {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: branding.timezone })} <Calendar size={14} className="text-primary-500"/>
                        </div>
                        <div className="flex shrink-0 gap-1 sm:gap-1.5 items-center ml-1 sm:ml-2 border-l border-[var(--border)] pl-2 sm:pl-4 relative">
                            {/* Theme Toggle */}
                            <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-muted)] hover:text-primary-600 hover:border-primary-400 transition-colors" aria-label="Toggle theme">
                                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                            <div ref={settingsRef}>
                                <button onClick={() => setShowSettings(!showSettings)} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-muted)] hover:text-primary-600 hover:border-primary-400 transition-colors"><Settings size={16} /></button>

                                {/* Settings Dropdown */}
                                {showSettings && (
                                    <div className="absolute top-[48px] right-20 w-72 bg-[var(--surface)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] z-[100] border border-[var(--border)] overflow-hidden animate-fade-in flex flex-col">
                                        <div className="bg-primary-600 p-4 text-[var(--color-primary-foreground)] flex justify-between items-center">
                                            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2"><Settings size={14} strokeWidth={3}/> Quick Settings</h2>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                                                <div>
                                                    <h4 className="font-bold text-[13px] text-[var(--text-primary)] leading-none">Email Notifications</h4>
                                                </div>
                                                <div onClick={() => setEmailNotifs(!emailNotifs)} className={`w-8 h-4 rounded-full relative cursor-pointer shadow-inner transition-colors ${emailNotifs ? 'bg-success' : 'bg-[var(--border)]'}`}>
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-[2px] shadow-sm transition-all ${emailNotifs ? 'right-0.5' : 'left-0.5'}`}></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-1">
                                                <div>
                                                    <h4 className="font-bold text-[13px] text-[var(--text-primary)] leading-none">Secured Data Mode</h4>
                                                </div>
                                                <div onClick={() => setSecureMode(!secureMode)} className={`w-8 h-4 rounded-full relative cursor-pointer shadow-inner transition-colors ${secureMode ? 'bg-primary-600' : 'bg-[var(--border)]'}`}>
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-[2px] shadow-sm transition-all ${secureMode ? 'right-0.5' : 'left-0.5'}`}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div ref={notifRef}>
                                <button onClick={() => setShowNotifications(!showNotifications)} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-muted)] hover:text-danger hover:border-danger transition-colors relative">
                                    <Bell size={16} />
                                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-danger rounded-full ring-2 ring-[var(--surface)]"></span>
                                </button>

                                {/* Notifications Flyout */}
                                {showNotifications && (
                                    <div className="absolute top-[48px] right-10 w-80 bg-[var(--surface)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] z-[100] border border-[var(--border)] overflow-hidden animate-fade-in flex flex-col max-h-[400px]">
                                        <div className="bg-[var(--surface-soft)] border-b border-[var(--border)] p-4 flex justify-between items-center z-10">
                                            <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] flex items-center gap-2"><Bell size={14}/> Notifications</div>
                                            <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded uppercase tracking-widest cursor-pointer hover:bg-primary-600 hover:text-[var(--color-primary-foreground)] transition-colors">Mark All Read</div>
                                        </div>
                                        <div className="overflow-y-auto custom-scrollbar">
                                            <div className="p-4 border-b border-[var(--border)] hover:bg-[var(--surface-soft)] cursor-pointer transition-colors relative">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-success"></div>
                                                <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-1">{user?.role === 'ADMIN' ? 'IAM Hierarchy Updated' : 'New Clinical Endpoint Available'}</h4>
                                                <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-2">{user?.role === 'ADMIN' ? 'Administrator successfully modified identity registry matrices.' : 'The vaccination tracking subsystem has been successfully synchronized.'}</p>
                                                <span className="text-[10px] font-bold text-[var(--text-muted)] mt-2 block">System • 2 mins ago</span>
                                            </div>
                                            <div className="p-4 border-b border-[var(--border)] hover:bg-[var(--surface-soft)] cursor-pointer transition-colors relative">
                                                <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-1">Global System Message</h4>
                                                <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-2">Ensure your local timezone parameters are correctly configured before scheduling procedures.</p>
                                                <span className="text-[10px] font-bold text-[var(--text-muted)] mt-2 block">Reminder • 1 hour ago</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button onClick={logout} title="Log Out" className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-muted)] hover:text-danger hover:border-danger transition-colors ml-1"><LogOut size={16} /></button>
                        </div>
                    </div>
                </header>

                {/* Context toolbar */}
                <div className="h-11 sm:h-[52px] bg-[var(--surface)] text-[var(--text-secondary)] shrink-0 flex items-center justify-between px-3 sm:px-6 lg:px-8 border-b border-[var(--border)]">
                    <div className="flex items-center gap-5 h-full">
                        <div className="hidden sm:flex items-center gap-1 border-r border-[var(--border)] pr-5 h-full py-2">
                            {user?.role !== 'ADMIN' && (
                                <>
                                    <Link to="/appointments" title="Appointments" className="h-full w-9 flex items-center justify-center hover:bg-[var(--surface-soft)] hover:text-primary-600 rounded-[var(--radius-sm)] transition-colors"><Calendar size={15} strokeWidth={2.5}/></Link>
                                    <Link to={user?.role === 'DOCTOR' ? "/patients" : "/child/my-children"} title="Health Records" className="h-full w-9 flex items-center justify-center hover:bg-[var(--surface-soft)] hover:text-primary-600 rounded-[var(--radius-sm)] transition-colors"><Folder size={15} strokeWidth={2.5}/></Link>
                                    <Link to="/teleconsult" title="Teleconsultation" className="h-full w-9 flex items-center justify-center hover:bg-[var(--surface-soft)] hover:text-primary-600 rounded-[var(--radius-sm)] transition-colors"><Activity size={15} strokeWidth={2.5}/></Link>
                                </>
                            )}
                            {user?.role === 'PARENT' && (
                                <Link to="/chatbot" title="AI Health Assistant" className="h-full w-9 flex items-center justify-center hover:bg-[var(--surface-soft)] hover:text-primary-600 rounded-[var(--radius-sm)] transition-colors"><Bot size={15} strokeWidth={2.5}/></Link>
                            )}
                            {user?.role === 'ADMIN' && (
                                <Link to="/admin" title="Admin Control Center" className="h-full w-9 flex items-center justify-center bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 rounded-[var(--radius-sm)] transition-colors"><LayoutDashboard size={15} strokeWidth={2.5}/></Link>
                            )}
                        </div>
                        <div className="flex items-center gap-2.5 tracking-wide">
                            <span className="font-bold text-sm sm:text-base tracking-tight">Dashboard</span>
                            <span className="hidden sm:inline text-[var(--text-muted)] text-[11px] font-medium ml-1">Home &rsaquo; Main Dashboard</span>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2.5 text-[10px] font-bold tracking-widest uppercase text-success">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                        Secure Session Active
                    </div>
                </div>

                {/* Content Render Pane */}
                <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-4 lg:p-8 scroll-smooth bg-[var(--bg)]">
                    <div className="w-full min-w-0 max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
            {showMobileNav && (
                <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
                    <button className="absolute inset-0 bg-slate-950/45" onClick={() => setShowMobileNav(false)} aria-label="Close navigation menu" />
                    <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,340px)] flex-col border-r border-[var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,var(--surface-soft)_100%)] shadow-2xl">
                        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <BrandLogo className={showWideBrandLogo ? 'h-10 w-40' : 'h-10 w-10'} iconSize={22} />
                                {!showWideBrandLogo && <span className="truncate text-sm font-bold text-[var(--text-primary)]">{branding.shortName}</span>}
                            </div>
                            <button onClick={() => setShowMobileNav(false)} className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)]" aria-label="Close navigation menu"><X size={19} /></button>
                        </div>
                        <nav aria-label="Primary navigation" className="flex-1 space-y-1 overflow-y-auto p-3">
                            <div className="mb-2 flex items-center gap-2 px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]"><span>Workspace</span><span className="h-px flex-1 bg-[var(--border)]" /></div>
                            <Link onClick={() => setShowMobileNav(false)} to="/dashboard" className={navLinkClass('/dashboard')}><LayoutDashboard size={18} /> Dashboard</Link>
                            <div className="mb-2 mt-6 flex items-center gap-2 px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]"><span>{user?.role === 'ADMIN' ? 'Administration' : user?.role === 'DOCTOR' ? 'Clinical workspace' : 'Care & communication'}</span><span className="h-px flex-1 bg-[var(--border)]" /></div>
                            {user?.role === 'PARENT' && <>
                                <Link onClick={() => setShowMobileNav(false)} to="/child/my-children" className={navLinkClass('/child/my-children')}><Activity size={18} /> Child Health Records</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/appointments" className={navLinkClass('/appointments')}><Calendar size={18} /> Book Appointment</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/vaccines" className={navLinkClass('/vaccines')}><Syringe size={18} /> Vaccinations</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/messages" className={navLinkClass('/messages')}><Mail size={18} /> Message Doctor</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/teleconsult" className={navLinkClass('/teleconsult')}><PhoneCall size={18} /> Tele-Consultation</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/education" className={navLinkClass('/education')}><BookOpen size={18} /> Health Education</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/emergency" className={navLinkClass('/emergency')}><AlertCircle size={18} /> Emergency Guidance</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/chatbot" className={navLinkClass('/chatbot')}><Bot size={18} /> AI Chatbot</Link>
                            </>}
                            {user?.role === 'DOCTOR' && <>
                                <Link onClick={() => setShowMobileNav(false)} to="/appointments" className={navLinkClass('/appointments')}><Calendar size={18} /> My Schedule</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/patients" className={navLinkClass('/patients')}><HeartPulse size={18} /> Patient Records</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/messages" className={navLinkClass('/messages')}><Mail size={18} /> Parent Messages</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/teleconsult" className={navLinkClass('/teleconsult')}><Stethoscope size={18} /> Provide Consultation</Link>
                            </>}
                            {user?.role === 'FACILITY' && <Link onClick={() => setShowMobileNav(false)} to="/facility/doctors" className={navLinkClass('/facility/doctors')}><Stethoscope size={18} /> My Clinical Staff</Link>}
                            {user?.role === 'ADMIN' && <>
                                <Link onClick={() => setShowMobileNav(false)} to="/admin/users" className={navLinkClass('/admin/users')}><Users size={18} /> Identity Access</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/admin/doctors" className={navLinkClass('/admin/doctors')}><Stethoscope size={18} /> Doctor Registry</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/admin/facilities" className={navLinkClass('/admin/facilities')}><Layers size={18} /> Facility Registry</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/admin/settings" className={navLinkClass('/admin/settings')}><Settings size={18} /> Organization Settings</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/admin/assistant-knowledge" className={navLinkClass('/admin/assistant-knowledge')}><Bot size={18} /> Assistant Knowledge</Link>
                                <Link onClick={() => setShowMobileNav(false)} to="/admin" className={navLinkClass('/admin')}><ShieldX size={18} /> System Audit</Link>
                            </>}
                        </nav>
                        <div className="shrink-0 border-t border-[var(--border)] p-3"><div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200"><HeartPulse size={15} /></span><span className="truncate">{branding.shortName}</span></div><p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[var(--text-muted)]">{branding.tagline}</p></div></div>
                    </aside>
                </div>
            )}
            {shouldShowIncomingCall && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="incoming-doctor-call-title">
                    <section className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-7 text-center text-white shadow-2xl">
                        <div className="absolute inset-x-0 top-0 h-1.5 animate-pulse bg-primary-500" />
                        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/20 text-primary-300">
                            <span className="absolute inset-0 animate-ping rounded-full border-2 border-primary-300/50" />
                            <PhoneCall size={34} aria-hidden="true" />
                        </div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-200">Incoming video call</p>
                        <h2 id="incoming-doctor-call-title" className="text-2xl font-bold">Dr. {incomingDoctorCall.doctor?.lastName || 'your doctor'} is calling</h2>
                        <p className="mt-2 text-sm text-slate-300">For {incomingDoctorCall.child?.firstName} {incomingDoctorCall.child?.lastName}</p>
                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setDismissedIncomingCallId(incomingDoctorCall.id)}
                                className="min-h-12 rounded-xl border border-white/15 px-4 font-semibold text-slate-200 hover:bg-white/10"
                            >
                                Dismiss
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(`/teleconsult/${incomingDoctorCall.id}`)}
                                className="min-h-12 rounded-xl bg-primary-600 px-4 font-bold text-white shadow-lg hover:bg-primary-500"
                            >
                                Answer call
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};
