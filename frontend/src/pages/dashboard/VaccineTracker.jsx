import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Syringe, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export const VaccineTracker = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [syncing, setSyncing] = useState(false);

  // Auto-fetch the explicit child schedule from DB
  const { data: vaccines, isLoading } = useQuery({
    queryKey: ['vaccines', id],
    queryFn: async () => {
      const res = await api.get(`/vaccinations/child/${id}`);
      return res.data.data;
    }
  });

  // Call the Generator API to merge age-based templates
  const syncSchedule = async () => {
    setSyncing(true);
    try {
      await api.post(`/vaccinations/child/${id}/generate`);
      queryClient.invalidateQueries({ queryKey: ['vaccines', id] });
    } catch (err) {
      console.error("Algorithm sync failed", err);
    } finally {
      setSyncing(false);
    }
  };

  const markCompleted = async (vacId) => {
    try {
      await api.patch(`/vaccinations/${vacId}/status`, { status: 'COMPLETED' });
      queryClient.invalidateQueries({ queryKey: ['vaccines', id] });
    } catch(err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Loading mapped vaccine protocols...</div>;

  const due = vaccines?.filter(v => ['UPCOMING', 'DUE'].includes(v.status)) || [];
  const history = vaccines?.filter(v => ['COMPLETED', 'MISSED'].includes(v.status)) || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Syringe className="text-blue-600" /> Immunization Schedule</h1>
           <p className="text-slate-600 text-sm mt-1">Age-adjusted automated tracking system based on global CDC-style templates.</p>
        </div>
        <Button onClick={syncSchedule} isLoading={syncing} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-white shadow-sm">
          {due.length === 0 && history.length === 0 ? 'Initialize Schedule' : 'Sync Latest Templates'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-t-4 border-t-blue-500 shadow-md">
             <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-slate-100">
                 <CardTitle className="text-slate-800 flex items-center gap-2"><Clock size={18} className="text-blue-500" /> Scheduled Doses</CardTitle>
             </CardHeader>
             <CardContent className="pt-6">
                 {due.length === 0 ? <p className="text-slate-500 text-sm italic">No upcoming vaccines scheduled. Initialization might be required.</p> : (
                     <div className="space-y-3">
                         {due.map(v => (
                             <div key={v.id} className="flex justify-between items-center p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-sm">
                                 <div>
                                     <div className="font-bold text-slate-800">{v.vaccineName}</div>
                                     <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Dose {v.doseNumber} • Target: {new Date(v.scheduledDate).toLocaleDateString()}</div>
                                 </div>
                                 <div className="flex flex-col items-end gap-2">
                                     <span className={`text-xs px-3 py-1 rounded-full font-bold tracking-wide uppercase ${v.status === 'DUE' ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-200' : 'bg-blue-100 text-blue-700'}`}>
                                         {v.status}
                                     </span>
                                     {user?.role === 'DOCTOR' && (
                                         <button onClick={() => markCompleted(v.id)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline">Mark Administered</button>
                                     )}
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </CardContent>
          </Card>

          <Card className="shadow-md">
             <CardHeader className="bg-slate-50 border-b border-slate-100">
                 <CardTitle className="text-slate-700 flex items-center gap-2"><CheckCircle size={18} className="text-slate-500"/> Clinical Audit History</CardTitle>
             </CardHeader>
             <CardContent className="pt-6">
                 {history.length === 0 ? <p className="text-slate-500 text-sm italic">No past records to display.</p> : (
                     <div className="space-y-3">
                         {history.map(v => (
                             <div key={v.id} className={`flex justify-between items-center p-3 rounded-lg border ${v.status === 'MISSED' ? 'border-red-100 bg-red-50/30' : 'border-slate-100 bg-slate-50'}`}>
                                 <div>
                                     <div className="font-semibold text-slate-700">{v.vaccineName} <span className="text-slate-400 text-xs font-medium ml-1">Dose {v.doseNumber}</span></div>
                                     {v.status === 'COMPLETED' ? (
                                         <div className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1.5"><CheckCircle size={12} /> Logged on {new Date(v.administeredDate).toLocaleDateString()}</div>
                                     ) : (
                                         <div className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1.5"><AlertTriangle size={12} /> Exceeded tolerance thresholds ({v.status})</div>
                                     )}
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </CardContent>
          </Card>
      </div>
    </div>
  )
}
