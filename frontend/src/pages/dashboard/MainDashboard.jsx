import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import useAuthStore from '../../store/authStore';

const roleConfig = {
    DOCTOR: {
        primaryHeader: "Clinical Portfolio",
        secondaryHeader: "Appointment Volume",
        chartMetrics: { left: "Confirmed Consults", right: "Pending Reviews", leftColor: "#059669", rightColor: "#3b82f6" },
        miniMetrics: { left: "Patient Flow", right: "EMR Sync", leftVal: "Active", rightVal: "Online" },
        widgets: {
            analytics: { label: "Patient Adherence Matrix", color: "#059669" },
            email: { title: "Urgent Support Line", email: "clinic@pediatric-hub.com", bg: "from-teal-500 to-emerald-700" },
            server: { label: "Clinical Roster Status", status: "Available", lightStatusColor: "#059669" }
        }
    },
    PARENT: {
        primaryHeader: "Family Health Portfolio",
        secondaryHeader: "Clinical Interactions",
        chartMetrics: { left: "Visits Completed", right: "Vaccines Due", leftColor: "#db2777", rightColor: "#ea580c" },
        miniMetrics: { left: "Growth Track", right: "Vax Track", leftVal: "On Curve", rightVal: "Protected" },
        widgets: {
            analytics: { label: "Wellness Trajectory", color: "#db2777" },
            email: { title: "Pediatrician Contact", email: "dr.admin@pediatric-hub.com", bg: "from-pink-500 to-rose-700" },
            server: { label: "Health Record Integrity", status: "Encrypted", lightStatusColor: "#db2777" }
        }
    },
    FACILITY: {
        primaryHeader: "Facility Operations",
        secondaryHeader: "Throughput Volume",
        chartMetrics: { left: "Provider Activity", right: "Patient Intake", leftColor: "#2563eb", rightColor: "#1d4ed8" },
        miniMetrics: { left: "Capacity", right: "Utilization", leftVal: "68%", rightVal: "Optimal" },
        widgets: {
            analytics: { label: "Resource Optimization", color: "#2563eb" },
            email: { title: "Network Administrator", email: "sysadmin@pediatric-hub.com", bg: "from-blue-500 to-indigo-700" },
            server: { label: "Server Cloud Health", status: "Operational", lightStatusColor: "#2563eb" }
        }
    },
    ADMIN: {
        primaryHeader: "System Operations",
        secondaryHeader: "System Event Volume",
        chartMetrics: { left: "API Ingress", right: "Web Exits", leftColor: "#8244e0", rightColor: "#14c39a" },
        miniMetrics: { left: "CPU", right: "MEM", leftVal: "2%", rightVal: "42 MB" },
        widgets: {
            analytics: { label: "Analytics Matrix", color: "#8244e0" },
            email: { title: "Connect Support Email", email: "secure@pediatric-hub.com", bg: "from-[#8244e0] to-[#512da8]" },
            server: { label: "Server Health", status: "Zero Downtime", lightStatusColor: "#14c39a" }
        }
    }
};

export const MainDashboard = () => {
    const { user } = useAuthStore();
    const config = roleConfig[user?.role] || roleConfig.ADMIN;

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboardTelemetry'],
        queryFn: async () => {
            const res = await api.get('/dashboard/telemetry');
            return res.data.data;
        }
    });

    if (isLoading) return <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Aggregating Live Telemetry Variables...</div>;

    // Calculate dynamic total chart volume
    const chartTotalCount = stats?.charts?.reduce((acc, curr) => acc + (curr.sales || 0) + (curr.orders || 0), 0) || 0;

    return (
        <div className="w-full w-full mx-auto space-y-6 animate-fade-in font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Status statistics */}
                <div className="col-span-1 flex flex-col gap-6">
                    <h2 className="text-[#6c7293] font-bold text-[11px] uppercase tracking-widest mb-[-12px]">{config.primaryHeader}</h2>
                    
                    {/* Card 1: Dynamic Primary Stat */}
                    <div className="bg-white rounded shadow-sm border border-slate-50 p-5 w-full flex flex-col">
                        <div className="flex justify-between items-center mb-5">
                            <span className="text-[#aeb1c4] text-[10px] font-black uppercase tracking-widest">{stats?.title1}</span>
                            <span className="text-[#14c39a] text-[10px] font-black uppercase tracking-widest" style={{color: config.chartMetrics.leftColor}}>LIVE</span>
                        </div>
                        <div className="text-[36px] font-black text-slate-800 tracking-tight leading-none mb-4">{stats?.count1}</div>
                        <div className="h-14 w-[110%] -ml-3 mt-auto">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.charts}>
                                    <defs>
                                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={config.chartMetrics.leftColor} stopOpacity={0.6}/>
                                            <stop offset="95%" stopColor={config.chartMetrics.leftColor} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="uv" stroke={config.chartMetrics.leftColor} strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Card 2: Dynamic Secondary Stat */}
                    <div className="bg-white rounded shadow-sm border border-slate-50 p-5 w-full flex flex-col">
                        <div className="flex justify-between items-center mb-5">
                            <span className="text-[#aeb1c4] text-[10px] font-black uppercase tracking-widest">{stats?.title2}</span>
                            <span className="text-[#8244e0] text-[10px] font-black uppercase tracking-widest" style={{color: config.chartMetrics.rightColor}}>OK</span>
                        </div>
                        <div className="text-[32px] font-black text-slate-800 tracking-tight leading-none mb-4">{stats?.count2}</div>
                        <div className="h-[60px] w-[105%] -ml-2 -mb-2 mt-auto">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.charts}>
                                    <Area type="monotone" dataKey="sales" stroke={config.chartMetrics.rightColor} strokeWidth={0} fillOpacity={0.4} fill={config.chartMetrics.rightColor} />
                                    <Area type="monotone" dataKey="orders" stroke={config.chartMetrics.rightColor} strokeWidth={0} fillOpacity={1} fill={config.chartMetrics.leftColor} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Card 3: Mini Split Cards */}
                    <div className="grid grid-cols-2 gap-6 h-full">
                        <div className="bg-white rounded shadow-sm p-4 px-5 text-center flex flex-col border border-slate-50">
                             <div className="text-[#aeb1c4] text-[10px] font-black uppercase tracking-widest mb-1.5">{stats?.title3}</div>
                             <div className="flex justify-center items-center h-full mb-6">
                                 <span className="text-2xl font-black text-slate-800">{stats?.count3}</span>
                             </div>
                             <div className="h-10 mt-auto flex gap-[2px] items-end justify-center w-full">
                                 {Array.from({length: 24}).map((_, i) => (
                                     <div key={i} className="w-[3px] bg-slate-200 rounded-t-sm" style={{height: `${Math.max(20, Math.random()*100)}%`, backgroundColor: config.chartMetrics.leftColor}}></div>
                                 ))}
                             </div>
                        </div>
                        <div className="bg-white rounded shadow-sm p-4 px-5 text-center flex flex-col border border-slate-50">
                             <div className="flex justify-between w-full mb-3">
                                 <div className="text-left w-1/2">
                                     <div className="text-[#aeb1c4] text-[10px] font-black uppercase tracking-widest mb-1">{config.miniMetrics.left}</div>
                                     <div className="text-sm font-black text-slate-800 tracking-tight leading-none">{config.miniMetrics.leftVal}</div>
                                 </div>
                                 <div className="text-right w-1/2">
                                     <div className="text-[#aeb1c4] text-[10px] font-black uppercase tracking-widest mb-1">{config.miniMetrics.right}</div>
                                     <div className="text-sm font-black text-slate-800 tracking-tight leading-none">{config.miniMetrics.rightVal}</div>
                                 </div>
                             </div>
                             <div className="flex gap-1 justify-between w-full mt-auto">
                                 <div className="flex gap-[2px] items-end w-1/2 overflow-hidden h-8">
                                     {Array.from({length: 12}).map((_, i) => <div key={`r-${i}`} className="w-[3px] rounded-t-sm" style={{height: `${Math.max(30, Math.random()*100)}%`, backgroundColor: config.chartMetrics.rightColor}}></div>)}
                                 </div>
                                 <div className="flex gap-[2px] items-end w-1/2 justify-end overflow-hidden h-8">
                                     {Array.from({length: 12}).map((_, i) => <div key={`g-${i}`} className="w-[3px] rounded-t-sm" style={{height: `${Math.max(30, Math.random()*100)}%`, backgroundColor: config.chartMetrics.leftColor}}></div>)}
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Historical Traffic Statistics */}
                <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
                    <h2 className="text-[#6c7293] font-bold text-[11px] uppercase tracking-widest mb-[-12px]">{config.secondaryHeader}</h2>
                    
                    <div className="bg-white p-7 rounded shadow-sm border border-slate-50 flex-1 flex flex-col hover:shadow-md transition-shadow cursor-default">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-10 gap-4">
                            <div>
                                <h3 className="text-[11px] font-black text-[#aeb1c4] uppercase tracking-widest">Calculated Aggregate Trends</h3>
                                <div className="text-[34px] font-black text-slate-800 mt-2 leading-none tracking-tight">{chartTotalCount.toLocaleString()}</div>
                            </div>
                            <div className="flex gap-8 mt-2 md:mt-0 items-center justify-end">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#aeb1c4]">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: config.chartMetrics.rightColor}}></div> {config.chartMetrics.left}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#aeb1c4]">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: config.chartMetrics.leftColor}}></div> {config.chartMetrics.right}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-[105%] -ml-6 min-h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.charts} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                    <defs>
                                        <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={config.chartMetrics.rightColor} stopOpacity={0.25}/>
                                            <stop offset="95%" stopColor={config.chartMetrics.rightColor} stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorPrem" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={config.chartMetrics.leftColor} stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor={config.chartMetrics.leftColor} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dx={-10} />
                                    <Tooltip 
                                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke={config.chartMetrics.leftColor} strokeWidth={3} fillOpacity={1} fill="url(#colorPrem)" />
                                    <Area type="monotone" dataKey="orders" stroke={config.chartMetrics.rightColor} strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>

             {/* Bottom Widgets Sector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pb-6">
                 {/* Overall Analytics Slice */}
                 <div className="bg-white rounded shadow-sm p-6 flex flex-col items-center justify-between border border-slate-50 min-h-[160px]">
                      <div className="w-full flex justify-between uppercase text-[10px] tracking-widest font-black text-slate-800 mb-2">
                           <span>{config.widgets.analytics.label}</span> <span className="text-[#aeb1c4] cursor-pointer hover:text-slate-600 transition-colors">Last 30 days ▾</span>
                      </div>
                      <div className="relative mt-auto">
                          <svg width="140" height="70" viewBox="0 0 140 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M140 70A70 70 0 0 0 0 70H140Z" fill="none"/>
                              <path d="M140 70C140 31.34 108.66 0 70 0A69.8 69.8 0 0 0 35.8 9.38L70 70H140Z" fill={config.widgets.analytics.color}/>
                              <path d="M35.8 9.38C15.9 20.65 1.5 43.14 0 70H70L35.8 9.38Z" fill="#ffb020"/>
                          </svg>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70px] h-[35px] bg-white rounded-t-full flex items-end justify-center pb-2">
                              <span className="font-black text-xs" style={{color: config.widgets.analytics.color}}>99.9%</span>
                          </div>
                      </div>
                 </div>
                 
                 {/* Email Link Block */}
                 <div className={`bg-gradient-to-br ${config.widgets.email.bg} rounded shadow-md p-8 flex flex-col justify-center items-center text-center min-h-[160px]`}>
                     <h3 className="text-white font-bold tracking-wide mb-5 uppercase text-sm tracking-widest">{config.widgets.email.title}</h3>
                     <input 
                         type="text" 
                         disabled
                         value={config.widgets.email.email} 
                         className="w-full px-5 py-2.5 rounded-full text-center text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-white/30 text-white bg-white/10 placeholder-white/50 border border-white/20 shadow-sm disabled:cursor-not-allowed" 
                     />
                 </div>

                 {/* Server Status Final */}
                 <div className="bg-white rounded shadow-sm pt-6 px-6 overflow-hidden flex flex-col border border-slate-50 min-h-[160px] relative">
                      <div className="w-full flex justify-between uppercase text-[10px] font-black tracking-widest text-[#aeb1c4] mb-2 z-10 relative">
                           <span className="text-slate-800">{config.widgets.server.label}</span> <span className="cursor-pointer hover:text-slate-600 transition-colors">Live ▾</span>
                      </div>
                      <div className="text-left text-[11px] font-bold mt-2 mb-4 z-10 relative flex items-center gap-2" style={{color: config.widgets.server.lightStatusColor}}>
                          <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: config.widgets.server.lightStatusColor}}></div> {config.widgets.server.status}
                      </div>
                      
                      <div className="absolute -bottom-6 w-[120%] -ml-6 h-28 opacity-15">
                           <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
                               <path d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" stroke="none" fill={config.widgets.server.lightStatusColor}></path>
                           </svg>
                      </div>
                 </div>
            </div>
        </div>
    );
};

