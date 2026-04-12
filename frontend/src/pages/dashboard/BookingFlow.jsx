import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, AlertCircle, Baby, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { api } from '../../lib/axios';
import { useQuery } from '@tanstack/react-query';

export const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // Dynamic Scheduling State
  const [selectedDate, setSelectedDate] = useState(() => {
     const tmrw = new Date();
     tmrw.setDate(tmrw.getDate() + 1);
     return tmrw.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState(null);

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
    if(!selectedChild || !selectedDate || !selectedTime) {
        setError("Please select a date and specific time slot.");
        return;
    }
    setLoading(true);
    setError("");
    try {
      // Construct exact ISO timestamp based on parent's selection
      const exactScheduledAt = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();

      await api.post('/appointments', {
        childId: selectedChild.id,
        doctorId: selectedDoc.id,
        scheduledAt: exactScheduledAt
      });
      setSuccess(true);
    } catch(err) {
      if(err.response?.status === 409) {
          setError("This timeslot was just booked by someone else (DB Lock Fired). Please choose another.");
      } else {
          setError("Failed to book appointment. Check authorization scopes.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Generate Available Time Slots (9 AM to 4 PM)
  const availableSlots = (() => {
    const slots = [];
    for (let h = 9; h <= 16; h++) {
        slots.push(`${h.toString().padStart(2, '0')}:00`);
        if(h !== 16) slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return slots;
  })();

  const formatTime = (timeString) => {
    const [h, m] = timeString.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const getDayName = (dateString) => {
      const d = new Date(dateString + "T12:00:00");
      return d.toLocaleDateString('en-US', { weekday: 'long' });
  };

  if (success) {
      return (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 text-2xl">✓</div>
              <h2 className="text-2xl font-bold text-slate-800">Booking Confirmed!</h2>
              <p className="text-slate-600 mt-2">The provider has received your requested slot.</p>
          </div>
      )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* STEPS INDICATOR */}
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
                     <div className="text-center font-bold text-red-500 py-10">You have no children registered.</div>
                )}
             </CardContent>
          </Card>
      )}

      {step === 3 && selectedDoc && selectedChild && (
          <Card>
              <CardHeader className="border-b border-slate-100 pb-5 mb-5">
                  <CardTitle>Schedule with Dr. {selectedDoc.lastName} for {selectedChild.firstName}</CardTitle>
                  <button onClick={() => setStep(2)} className="text-sm font-medium text-blue-600 hover:text-blue-700">← Change Patient</button>
              </CardHeader>
              <CardContent>
                  {errorMsg && <div className="p-4 bg-red-50 text-red-700 flex items-center gap-2 rounded-lg mb-6 text-sm font-medium"><AlertCircle size={20} /> {errorMsg}</div>}
                  
                  {/* DYNAMIC DATE/TIME PICKER */}
                  <div className="space-y-6 mb-8">
                     
                     {/* Calendar Row */}
                     <div>
                         <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                             <CalendarIcon size={16} className="text-blue-600" />
                             Select Date
                         </label>
                         <input 
                             type="date" 
                             min={new Date().toISOString().split('T')[0]}
                             value={selectedDate}
                             onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }}
                             className="w-full md:w-64 p-3 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                         />
                     </div>

                     <div className="h-px bg-slate-100 w-full"></div>

                     {/* Timeslot Matrix */}
                     <div>
                         <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">
                             <Clock size={16} className="text-blue-600" />
                             Available Slots for {getDayName(selectedDate)}
                         </label>

                         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                             {availableSlots.map(timeStr => {
                                 const isSelected = selectedTime === timeStr;
                                 return (
                                     <button
                                        key={timeStr}
                                        onClick={() => setSelectedTime(timeStr)}
                                        className={`p-3 rounded-lg text-sm font-bold border transition-all ${
                                            isSelected 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                        }`}
                                     >
                                         {formatTime(timeStr)}
                                     </button>
                                 );
                             })}
                         </div>
                     </div>
                  </div>

                  <Button 
                     className="w-full h-14 text-lg mt-6 shadow-lg shadow-blue-500/20" 
                     onClick={handleBook} 
                     isLoading={loading}
                     disabled={!selectedTime}
                  >
                     Secure Real-Time Slot
                  </Button>
              </CardContent>
          </Card>
      )}
    </div>
  )
}
