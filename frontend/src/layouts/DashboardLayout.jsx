import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LayoutDashboard, Users, Activity, Settings, LogOut, Bell, Calendar, Mail, Folder, Navigation, LineChart, Table, BookOpen, Layers, ShieldX, FileText, Syringe, HeartPulse, Stethoscope, PhoneCall, Bot, AlertCircle, X } from 'lucide-react';

export const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
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

    return (
        <div className="min-h-screen bg-[#f3f7f9] flex overflow-hidden font-sans">
            {/* Left Sidebar */}
            <aside className="w-[280px] bg-white shadow-[2px_0_20px_rgba(0,0,0,0.04)] hidden md:flex flex-col z-20 shrink-0">
                <div className="h-[72px] bg-[#8244e0] text-white flex items-center px-6 font-black text-xl tracking-tight shrink-0 shadow-sm relative">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#8244e0] font-black pb-0.5 shadow-inner">P</div>
                        PolluxUI
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto py-8 custom-scrollbar">
                    <nav className="space-y-1.5 px-4">
                        <Link to="/dashboard" className="flex items-center justify-between px-4 py-3.5 text-[#8244e0] bg-[#f8f5ff] rounded-md font-bold text-[13px] transition-all relative border border-[#8244e0]/10 shadow-sm">
                            <div className="flex items-center gap-3"><LayoutDashboard size={18} strokeWidth={2.5}/> Dashboard</div>
                        </Link>
                        
                        <div className="pt-4 text-[10px] uppercase font-bold text-slate-400 tracking-widest px-4 mb-2">Clinical Features</div>
                        
                        {/* PARENT FEATURES */}
                        {user?.role === 'PARENT' && (
                            <>
                                <Link to="/child/my-children" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:text-[#8244e0] hover:bg-slate-50 rounded-md font-semibold text-[13px] transition-colors">
                                    <div className="flex items-center gap-3"><Activity size={18} /> Child Health Records</div>
                                </Link>
                                <Link to="/appointments" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:text-[#8244e0] hover:bg-slate-50 rounded-md font-semibold text-[13px] transition-colors">
                                    <div className="flex items-center gap-3"><Calendar size={18} /> Book Appointment</div>
                                </Link>
                                <Link to="/vaccines" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:text-[#8244e0] hover:bg-slate-50 rounded-md font-semibold text-[13px] transition-colors">
                                    <div className="flex items-center gap-3"><Syringe size={18} /> Vaccinations</div>
                                </Link>
                                <Link to="/teleconsult" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:text-[#8244e0] hover:bg-slate-50 rounded-md font-semibold text-[13px] transition-colors">
                                    <div className="flex items-center gap-3"><PhoneCall size={18} /> Tele-Consultation</div>
                                </Link>
                                <Link to="/education" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:text-[#8244e0] hover:bg-slate-50 rounded-md font-semibold text-[13px] transition-colors">
                                    <div className="flex items-center gap-3"><BookOpen size={18} /> Health Education</div>
                                </Link>
                                <Link to="/emergency" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:text-[#8244e0] hover:bg-slate-50 rounded-md font-semibold text-[13px] transition-colors">
                                    <div className="flex items-center gap-3"><AlertCircle size={18} /> Emergency Guidance</div>
                                </Link>
                                <Link to="/chatbot" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:text-[#8244e0] hover:bg-slate-50 rounded-md font-semibold text-[13px] transition-colors mb-6">
                                    <div className="flex items-center gap-3"><Bot size={18} /> AI Chatbot</div>
                                </Link>
                            </>
                        )}

                        {/* DOCTOR FEATURES */}
                        {user?.role === 'DOCTOR' && (
                            <>
                                <Link to="/appointments" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:text-[#8244e0] hover:bg-slate-50 rounded-md font-semibold text-[13px] transition-colors">
                                    <div className="flex items-center gap-3"><Calendar size={18} /> My Schedule</div>
                                </Link>
                                <Link to="/patients" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:text-[#8244e0] hover:bg-slate-50 rounded-md font-semibold text-[13px] transition-colors">
                                    <div className="flex items-center gap-3"><HeartPulse size={18} /> Patient Records</div>
                                </Link>
                                <Link to="/teleconsult" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:text-[#8244e0] hover:bg-slate-50 rounded-md font-semibold text-[13px] transition-colors mb-6">
                                    <div className="flex items-center gap-3"><Stethoscope size={18} /> Provide Consultation</div>
                                </Link>
                            </>
                        )}

                        {/* ADMIN FEATURES */}
                        {user?.role === 'ADMIN' && (
                            <>
                                <Link to="/admin/users" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:text-[#8244e0] hover:bg-slate-50 rounded-md font-semibold text-[13px] transition-colors">
                                    <div className="flex items-center gap-3"><Users size={18} /> Manage Users</div>
                                </Link>
                                <Link to="/admin" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:text-[#8244e0] hover:bg-slate-50 rounded-md font-semibold text-[13px] transition-colors mb-6">
                                    <div className="flex items-center gap-3"><ShieldX size={18} /> Monitor Security</div>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                
                {/* Top Nav (White) */}
                <header className="h-[72px] bg-white shrink-0 flex items-center justify-between px-8 z-10 border-b border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-4 text-slate-700 text-sm font-bold">
                        <div className="w-10 h-10 rounded bg-[#8244e0] text-white overflow-hidden shadow-inner flex items-center justify-center font-black shrink-0 text-lg uppercase">
                             {user?.profile?.firstName?.charAt(0) || user?.role?.charAt(0) || 'U'}
                        </div>
                        <div className="tracking-tight flex flex-col justify-center">
                            <span className="text-[14px] leading-tight">{user?.profile?.firstName || 'Authorized'} {user?.profile?.lastName || 'User'}</span>
                            <span className="text-[10px] font-black text-[#14c39a] tracking-widest uppercase truncate">{user?.role} Portal</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 border border-slate-200 rounded text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white">
                           {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} <Calendar size={14} className="text-[#8244e0]"/>
                        </div>
                        <div className="flex gap-2 items-center ml-2 border-l border-slate-100 pl-4 relative">
                            <div ref={settingsRef}>
                                <button onClick={() => setShowSettings(!showSettings)} className="w-9 h-9 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-[#8244e0] hover:border-[#8244e0] transition-colors"><Settings size={16} /></button>
                                
                                {/* Settings Dropdown/Modal Anchor */}
                                {showSettings && (
                                    <div className="absolute top-[48px] right-20 w-72 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-[100] border border-slate-100 overflow-hidden animate-fade-in flex flex-col">
                                        <div className="bg-[#8244e0] p-4 text-white flex justify-between items-center shadow-inner">
                                            <h2 className="text-sm font-black tracking-tight flex items-center gap-2"><Settings size={14} strokeWidth={3}/> Quick Settings</h2>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                                <div>
                                                    <h4 className="font-bold text-[13px] text-slate-800 leading-none">Email Notifications</h4>
                                                </div>
                                                <div onClick={() => setEmailNotifs(!emailNotifs)} className={`w-8 h-4 rounded-full relative cursor-pointer shadow-inner transition-colors ${emailNotifs ? 'bg-[#14c39a]' : 'bg-slate-300'}`}>
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-[2px] shadow-sm transition-all ${emailNotifs ? 'right-0.5' : 'left-0.5'}`}></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-1">
                                                <div>
                                                    <h4 className="font-bold text-[13px] text-slate-800 leading-none">Secured Data Mode</h4>
                                                </div>
                                                <div onClick={() => setSecureMode(!secureMode)} className={`w-8 h-4 rounded-full relative cursor-pointer shadow-inner transition-colors ${secureMode ? 'bg-[#8244e0]' : 'bg-slate-300'}`}>
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-[2px] shadow-sm transition-all ${secureMode ? 'right-0.5' : 'left-0.5'}`}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div ref={notifRef}>
                                <button onClick={() => setShowNotifications(!showNotifications)} className="w-9 h-9 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-[#ff4d4f] hover:border-[#ff4d4f] transition-colors relative">
                                    <Bell size={16} />
                                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#ff4d4f] rounded-full ring-2 ring-white"></span>
                                </button>
                                
                                {/* Notifications Flyout */}
                                {showNotifications && (
                                    <div className="absolute top-[48px] right-10 w-80 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-[100] border border-slate-100 overflow-hidden animate-fade-in flex flex-col max-h-[400px]">
                                        <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center shadow-sm z-10">
                                            <div className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2"><Bell size={14}/> Notification Center</div>
                                            <div className="text-[10px] font-bold text-[#8244e0] bg-[#f8f5ff] px-2 py-0.5 rounded uppercase tracking-widest cursor-pointer hover:bg-[#8244e0] hover:text-white transition-colors">Mark All Read</div>
                                        </div>
                                        <div className="overflow-y-auto custom-scrollbar">
                                            <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors relative">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#14c39a]"></div>
                                                <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-tight mb-1">{user?.role === 'ADMIN' ? 'IAM Hierarchy Updated' : 'New Clinical Endpoint Available'}</h4>
                                                <p className="text-xs text-slate-500 font-medium line-clamp-2">{user?.role === 'ADMIN' ? 'Administrator successfully modified identity registry matrices.' : 'The vaccination tracking subsystem has been successfully synchronized.'}</p>
                                                <span className="text-[10px] font-bold text-slate-400 mt-2 block">System • 2 mins ago</span>
                                            </div>
                                            <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors relative">
                                                <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-tight mb-1">Global System Message</h4>
                                                <p className="text-xs text-slate-500 font-medium line-clamp-2">Ensure your local timezone parameters are correctly configured before scheduling procedures.</p>
                                                <span className="text-[10px] font-bold text-slate-400 mt-2 block">Reminder • 1 hour ago</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <button onClick={logout} title="Log Out" className="w-9 h-9 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-500 transition-colors ml-1"><LogOut size={16} /></button>
                        </div>
                    </div>
                </header>

                {/* Sub Nav (Teal Toolbar) */}
                <div className="h-[52px] bg-[#14c39a] text-white shrink-0 flex items-center justify-between px-8 shadow-sm z-1">
                    <div className="flex items-center gap-6 h-full">
                        <div className="flex items-center gap-1.5 border-r border-[#10a884] pr-6 h-full py-2">
                            {user?.role !== 'ADMIN' && (
                                <>
                                    <Link to="/appointments" title="Appointments" className="h-full w-9 flex items-center justify-center hover:bg-[#10a884] rounded transition-colors"><Calendar size={15} strokeWidth={2.5}/></Link>
                                    <Link to={user?.role === 'DOCTOR' ? "/patients" : "/child/my-children"} title="Health Records" className="h-full w-9 flex items-center justify-center hover:bg-[#10a884] rounded transition-colors"><Folder size={15} strokeWidth={2.5}/></Link>
                                    <Link to="/teleconsult" title="Teleconsultation" className="h-full w-9 flex items-center justify-center hover:bg-[#10a884] rounded transition-colors"><Activity size={15} strokeWidth={2.5}/></Link>
                                </>
                            )}
                            {user?.role === 'PARENT' && (
                                <Link to="/chatbot" title="AI Health Assistant" className="h-full w-9 flex items-center justify-center hover:bg-[#10a884] rounded transition-colors"><Bot size={15} strokeWidth={2.5}/></Link>
                            )}
                            {user?.role === 'ADMIN' && (
                                <Link to="/admin" title="Admin Control Center" className="h-full w-9 flex items-center justify-center bg-[#10a884] shadow-inner text-white rounded transition-colors"><LayoutDashboard size={15} strokeWidth={2.5}/></Link>
                            )}
                        </div>
                        <div className="flex items-center gap-2.5 tracking-wide pt-0.5">
                            <span className="font-extrabold text-base tracking-tight shadow-sm">Dashboard</span>
                            <span className="text-[#a7f3df] text-[11px] font-bold ml-1">Home <span className="mx-1.5">&rsaquo;</span> Main Dashboard</span>
                        </div>
                    </div>
                    
                    {/* Replaced arbitrary Search widget with Clinical Session indicator */}
                    <div className="flex items-center gap-2.5 text-[10px] font-black tracking-widest uppercase text-[#a7f3df]">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div> 
                        Secure Session Active
                    </div>
                </div>

                {/* Content Render Pane */}
                <main className="flex-1 overflow-y-auto p-1 lg:p-8 scroll-smooth">
                    <div className="w-full max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
