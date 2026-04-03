import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Ruler, FileText, UserPlus } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export const GrowthDashboard = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'timeline'

  // Fetch normalized Recharts data payload
  const { data, isLoading, isError } = useQuery({
    queryKey: ['growth', id],
    queryFn: async () => {
       const res = await api.get(`/growth/child/${id}`);
       return res.data.data;
    }
  });

  if (isLoading) return <div className="p-12 text-center text-slate-500 font-medium">Computing developmental metrics & charts...</div>;
  if (isError) return <div className="p-12 text-center text-red-500 font-medium">Failed to map context. Authorization restricted.</div>;

  const { chartData, records } = data || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Ruler className="text-blue-600" /> Growth & Milestones</h1>
           <p className="text-slate-600 text-sm mt-1">Physical tracking and cognitive milestone timeline mapping seamlessly to Recharts.</p>
        </div>
        <Button variant="default" className="flex gap-2">
            <UserPlus size={16} /> Append Measurement
        </Button>
      </div>

      <div className="flex gap-2 bg-white p-1.5 rounded-lg border border-slate-200 max-w-sm shadow-sm font-medium">
          <button onClick={() => setActiveTab('chart')} className={`flex-1 py-2 text-sm rounded-md transition-all ${activeTab==='chart' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>Percentile Charts</button>
          <button onClick={() => setActiveTab('timeline')} className={`flex-1 py-2 text-sm rounded-md transition-all ${activeTab==='timeline' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>Clinical Timeline</button>
      </div>

      {activeTab === 'chart' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-md">
                  <CardHeader className="bg-slate-50 border-b border-slate-100"><CardTitle className="text-slate-700">Weight Velocity (kg)</CardTitle></CardHeader>
                  <CardContent className="pt-6">
                      <div className="h-72 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                  <XAxis dataKey="ageInMonths" tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={false} />
                                  <YAxis tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={false} />
                                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                  <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: 'white'}} activeDot={{r: 6}} animationDuration={1500} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                  </CardContent>
              </Card>

              <Card className="shadow-md">
                  <CardHeader className="bg-slate-50 border-b border-slate-100"><CardTitle className="text-slate-700">Height Growth (cm)</CardTitle></CardHeader>
                  <CardContent className="pt-6">
                      <div className="h-72 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                  <XAxis dataKey="ageInMonths" tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={false} />
                                  <YAxis tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={false} />
                                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                  <Line type="monotone" dataKey="height" stroke="#10B981" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: 'white'}} activeDot={{r: 6}} animationDuration={1500} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                  </CardContent>
              </Card>
          </div>
      )}

      {activeTab === 'timeline' && (
          <Card className="shadow-md border-t-4 border-t-blue-500">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white"><CardTitle className="flex items-center gap-2"><FileText size={18} className="text-slate-500" /> Milestone Audit History</CardTitle></CardHeader>
              <CardContent className="pt-8">
                  {records?.length === 0 ? <p className="text-slate-500 italic">No historical nodes deployed yet.</p> : (
                      <div className="space-y-0">
                          {records.map(r => (
                              <div key={r.id} className="relative pl-8 pb-8 border-l-2 border-slate-200 last:border-0 last:pb-0 group">
                                  <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[9px] top-1 ring-4 ring-white group-hover:scale-110 transition-transform"></div>
                                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-blue-300 transition-colors shadow-sm">
                                      <div className="flex justify-between items-center mb-3">
                                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{new Date(r.measurementDate).toLocaleString()}</div>
                                          <div className={`text-xs px-3 py-1 rounded-md font-bold tracking-wide ${r.recorderRole === 'DOCTOR' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' : 'bg-white border border-slate-300 text-slate-600 shadow-sm'}`}>
                                              Author ID: {r.recorderRole}
                                          </div>
                                      </div>
                                      
                                      {(r.weightKg || r.heightCm || r.headCircumCm) && (
                                          <div className="flex flex-wrap gap-4 mt-3 mb-4 pb-4 border-b border-slate-200/60">
                                              {r.weightKg && <div className="text-sm font-medium text-slate-700 bg-white px-3 py-1.5 rounded shadow-sm border border-slate-100">Weight: <span className="text-blue-600 font-bold ml-1">{r.weightKg} kg</span></div>}
                                              {r.heightCm && <div className="text-sm font-medium text-slate-700 bg-white px-3 py-1.5 rounded shadow-sm border border-slate-100">Height: <span className="text-emerald-600 font-bold ml-1">{r.heightCm} cm</span></div>}
                                              {r.headCircumCm && <div className="text-sm font-medium text-slate-700 bg-white px-3 py-1.5 rounded shadow-sm border border-slate-100">Head: <span className="text-purple-600 font-bold ml-1">{r.headCircumCm} cm</span></div>}
                                          </div>
                                      )}

                                      {r.milestoneNotes && (
                                          <div>
                                              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Observation Notes</div>
                                              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{r.milestoneNotes}</p>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </CardContent>
          </Card>
      )}
    </div>
  );
};
