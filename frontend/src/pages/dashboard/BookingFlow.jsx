import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, AlertCircle, Baby } from 'lucide-react';
import { api } from '../../lib/axios';
import { useQuery } from '@tanstack/react-query';

export const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { data: doctors, isLoading: loadDocs } = useQuery({
      queryKey: ['availableDoctors'],
      queryFn: async () => {
          const res = await api.get('/users/doctors');
          return res.data.data;
      }
  });

  const { data: children, isLoading: loadChildren } = useQuery({
      queryKey: ['myChildren'],
      queryFn: async () => {
          const res = await api.get('/children/my-children');
          return res.data.data;
      }
  });

  const handleBook = async () => {
    if(!selectedChild) {
        setError("Please select a child profile to attach the clinical record.");
        return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post('/appointments', {
        childId: selectedChild.id,
        doctorId: selectedDoc.id,
        scheduledAt: new Date().toISOString()
      });
      setSuccess(true);
    } catch(err) {
      if(err.response?.status === 409) {
          setError("This timeslot was just booked by someone else (MySQL Lock Fired). Please choose another.");
      } else {
          setError("Failed to book appointment. Check authorization scopes.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
      return (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 text-2xl">✓</div>
              <h2 className="text-2xl font-bold text-slate-800">Booking Confirmed!</h2>
              <p className="text-slate-600 mt-2">You will receive a notification reminder securely 24 hours prior.</p>
          </div>
      )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between px-4">
         <div className={`font-semibold ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>1. Select Specialist</div>
         <div className="flex-1 h-px bg-slate-200 mx-4"></div>
         <div className={`font-semibold ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>2. Patient Link</div>
         <div className="flex-1 h-px bg-slate-200 mx-4"></div>
         <div className={`font-semibold ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>3. Select Time</div>
      </div>

      {step === 1 && (
        <Card>
            <CardHeader><CardTitle>Available Providers</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {loadDocs ? (
                    <div className="text-center font-bold text-slate-400 py-10 uppercase tracking-widest animate-pulse">Scanning DB Providers...</div>
                ) : doctors?.length > 0 ? doctors.map(d => (
                    <div key={d.id} className="flex justify-between items-center p-5 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => { setSelectedDoc(d); setStep(2); }}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><User /></div>
                            <div>
                                <h3 className="font-semibold text-slate-800">Dr. {d.firstName} {d.lastName}</h3>
                                <p className="text-sm text-slate-500">{d.specialization}</p>
                            </div>
                        </div>
                        <Button variant="outline">Select</Button>
                    </div>
                )) : (
                    <div className="text-center font-bold text-slate-500 py-10">No verified providers registered in database.</div>
                )}
            </CardContent>
        </Card>
      )}

      {step === 2 && selectedDoc && (
          <Card>
             <CardHeader>
                  <CardTitle>Select Child Record</CardTitle>
                  <button onClick={() => setStep(1)} className="text-sm font-medium text-blue-600 hover:text-blue-700">← Back</button>
             </CardHeader>
             <CardContent className="space-y-4">
                {loadChildren ? (
                     <div className="text-center font-bold text-slate-400 py-10 uppercase tracking-widest animate-pulse">Syncing Family Graph...</div>
                ) : children?.length > 0 ? children.map(c => (
                     <div key={c.id} className="flex justify-between items-center p-5 border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => { setSelectedChild(c); setStep(3); }}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center"><Baby /></div>
                            <div>
                                <h3 className="font-semibold text-slate-800">{c.firstName} {c.lastName}</h3>
                                <p className="text-sm text-slate-500">Born {new Date(c.dateOfBirth).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <Button variant="outline">Link Record</Button>
                     </div>
                )) : (
                     <div className="text-center font-bold text-red-500 py-10">You have no children registered. <br/> Access My Registered Children to create a profile.</div>
                )}
             </CardContent>
          </Card>
      )}

      {step === 3 && selectedDoc && selectedChild && (
          <Card>
              <CardHeader>
                  <CardTitle>Schedule with Dr. {selectedDoc.lastName} for {selectedChild.firstName}</CardTitle>
                  <button onClick={() => setStep(2)} className="text-sm font-medium text-blue-600 hover:text-blue-700">← Change Patient</button>
              </CardHeader>
              <CardContent>
                  {errorMsg && <div className="p-4 bg-red-50 text-red-700 flex items-center gap-2 rounded-lg mb-6 text-sm font-medium"><AlertCircle size={20} /> {errorMsg}</div>}
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                     <div className="p-4 border border-slate-200 rounded-lg text-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
                         <div className="text-sm font-medium text-slate-600">Monday</div>
                         <div className="text-lg font-bold text-blue-600 mt-1">09:00 AM</div>
                     </div>
                     <div className="p-4 border border-blue-600 rounded-lg text-center cursor-pointer bg-blue-50 ring-2 ring-blue-600 ring-offset-2">
                         <div className="text-sm font-medium text-slate-600">Monday</div>
                         <div className="text-lg font-bold text-blue-600 mt-1">09:30 AM</div>
                     </div>
                     <div className="p-4 border border-slate-200 rounded-lg text-center opacity-50 bg-slate-50 cursor-not-allowed">
                         <div className="text-sm font-medium text-slate-400">Monday</div>
                         <div className="text-lg font-bold text-slate-400 mt-1">10:00 AM</div>
                         <div className="text-xs text-slate-500 mt-2 font-medium">Booked</div>
                     </div>
                  </div>

                  <Button className="w-full h-12 text-lg" onClick={handleBook} isLoading={loading}>Secure Appointment Slot</Button>
              </CardContent>
          </Card>
      )}
    </div>
  )
}
