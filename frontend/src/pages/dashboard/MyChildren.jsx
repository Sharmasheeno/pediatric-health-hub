import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Activity, Syringe, LineChart, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';

const AGE_REFERENCE_DATE = new Date();
const LATEST_ELIGIBLE_BIRTH_DATE = (() => {
    const today = new Date();
    return new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate()
    )).toISOString().slice(0, 10);
})();
const EARLIEST_ELIGIBLE_BIRTH_DATE = (() => {
    const today = new Date();
    return new Date(Date.UTC(
        today.getUTCFullYear() - 18,
        today.getUTCMonth(),
        today.getUTCDate() + 1
    )).toISOString().slice(0, 10);
})();
const formatDateLabel = (date) => new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC'
}).format(new Date(`${date}T00:00:00Z`));

export const MyChildren = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({ firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE', bloodGroup: 'O+' });

    // Fetch dynamic real DB array via authorization layer
    const { data: children, isLoading } = useQuery({
        queryKey: ['myChildren'],
        queryFn: async () => {
            const res = await api.get('/children/my-children');
            return res.data.data;
        }
    });

    const mutation = useMutation({
        mutationFn: async (newChild) => await api.post('/children', newChild),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myChildren'] });
            setIsModalOpen(false);
            setFormData({ firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE', bloodGroup: 'O+' });
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const [birthYear, birthMonth, birthDay] = formData.dateOfBirth.split('-').map(Number);
        const today = new Date();
        let age = today.getUTCFullYear() - birthYear;
        if (
            today.getUTCMonth() + 1 < birthMonth ||
            (today.getUTCMonth() + 1 === birthMonth && today.getUTCDate() < birthDay)
        ) age -= 1;

        if (
            !formData.dateOfBirth ||
            !Number.isFinite(age) ||
            age < 0 ||
            age >= 18 ||
            formData.dateOfBirth < EARLIEST_ELIGIBLE_BIRTH_DATE ||
            formData.dateOfBirth > LATEST_ELIGIBLE_BIRTH_DATE
        ) {
            setFormError('Children must be under 18 years old. Please enter a valid date of birth.');
            return;
        }
        setFormError('');
        
        // Transform the HTML form payload into the strict Zod validator DB schema
        let isoDate;
        try { isoDate = new Date(formData.dateOfBirth).toISOString(); } catch { isoDate = formData.dateOfBirth; }

        const strictPayload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: isoDate,
            gender: formData.gender,
            bloodType: formData.bloodGroup // Maps React state to Zod schema
        };

        mutation.mutate(strictPayload);
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const diff = AGE_REFERENCE_DATE.getTime() - birthDate.getTime();
        const ageDT = new Date(diff); 
        const year = ageDT.getUTCFullYear() - 1970;
        const month = ageDT.getUTCMonth();
        if (year > 0) return `${year} years${month > 0 ? `, ${month} mos` : ''}`;
        return `${month} months`;
    };

    const registrationError = mutation.error?.response?.data?.errors
        ?.map((error) => error.message || error.field)
        .filter(Boolean)
        .join(' ') || mutation.error?.response?.data?.message || 'We could not save this child record. Please review the details and try again.';

    return (
        <div className="w-full mx-auto space-y-6 animate-fade-in font-sans relative">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 border-b border-[var(--border)] pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">My Registered Children</h1>
                    <p className="text-[var(--text-secondary)] font-medium mt-1">Manage health profiles, log developmental growth points, and review clinical histories.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-teal hover:bg-[#10a884] shadow-sm font-bold text-white"><Plus size={16} className="mr-2"/> Register New Child</Button>
            </div>

            {isLoading ? (
                <div className="p-12 text-center text-[var(--text-muted)] font-bold tracking-widest uppercase animate-pulse">Synchronizing clinical data...</div>
            ) : children?.length === 0 ? (
                <div className="p-16 mt-8 text-center border-2 border-dashed border-[var(--border)] rounded-xl bg-[var(--surface-soft)]/50">
                    <div className="w-16 h-16 bg-[var(--surface)] shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><Plus size={24}/></div>
                    <h2 className="text-xl font-bold text-[var(--text-secondary)] mb-2 tracking-tight">No Children Registered</h2>
                    <p className="text-[var(--text-muted)] font-medium max-w-sm mx-auto">Click the <span className="font-bold text-teal">Register New Child</span> button above to securely map your first child to your authorization identity.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {children?.map((child) => (
                        <Card key={child.id} className="border-[var(--border)] shadow-sm hover:shadow-md transition-all overflow-hidden relative bg-[var(--surface)]">
                             <div className="h-28 bg-gradient-to-r from-primary-600/10 to-teal/10 w-full absolute top-0 left-0 border-b border-[var(--border)]"></div>
                             <CardContent className="p-6 pt-14 relative z-10 flex flex-col items-center">
                                 <div className="w-24 h-24 bg-[var(--surface)] rounded-full p-1 shadow-sm mb-4 border-2 border-[var(--border)] ring-4 ring-[var(--surface-soft)]">
                                     <div className="w-full h-full bg-primary-600 rounded-full flex items-center justify-center text-white font-black text-3xl">
                                         {child.firstName?.charAt(0)}
                                     </div>
                                 </div>
                                 <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{child.firstName} {child.lastName}</h2>
                                 <div className="flex items-center justify-center gap-3 mt-2 text-sm font-bold text-[var(--text-muted)] w-full">
                                      <span>{calculateAge(child.dateOfBirth)}</span>
                                      <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]"></span>
                                      <span className="text-danger">Blood: {child.bloodGroup || 'Unrecorded'}</span>
                                 </div>

                                 <div className="grid grid-cols-3 gap-3 w-full mt-8">
                                      <Link to={`/child/${child.id}`}>
                                          <div className="bg-[var(--surface-soft)] hover:bg-[var(--surface)] transition-colors rounded-lg p-3 flex flex-col items-center text-center cursor-pointer border border-[var(--border)] shadow-sm hover:shadow">
                                              <Activity size={20} className="text-primary-600 mb-2"/>
                                              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Records</span>
                                          </div>
                                      </Link>
                                      <Link to={`/child/${child.id}/growth`}>
                                          <div className="bg-[var(--surface-soft)] hover:bg-[var(--surface)] transition-colors rounded-lg p-3 flex flex-col items-center text-center cursor-pointer border border-[var(--border)] shadow-sm hover:shadow">
                                              <LineChart size={20} className="text-teal mb-2"/>
                                              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Growth</span>
                                          </div>
                                      </Link>
                                      <Link to={`/child/${child.id}/vaccines`}>
                                          <div className="bg-[var(--surface-soft)] hover:bg-[var(--surface)] transition-colors rounded-lg p-3 flex flex-col items-center text-center cursor-pointer border border-[var(--border)] shadow-sm hover:shadow">
                                              <Syringe size={20} className="text-warning mb-2"/>
                                              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Vaccines</span>
                                          </div>
                                      </Link>
                                 </div>
                             </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Registration Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-3 sm:p-4">
                    <div className="bg-[var(--surface)] rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto animate-fade-in relative">
                        <div className="sticky top-0 z-10 bg-primary-600 p-4 sm:p-6 text-white flex justify-between items-center shadow-inner">
                            <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2"><Plus size={20} strokeWidth={3}/> Register Child Record</h2>
                            <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1.5 rounded transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-4 sm:space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">First Name</label>
                                    <input required value={formData.firstName} onChange={e=>setFormData({...formData, firstName: e.target.value})} type="text" className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Last Name</label>
                                    <input required value={formData.lastName} onChange={e=>setFormData({...formData, lastName: e.target.value})} type="text" className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold"/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Date of Birth</label>
                                <input required value={formData.dateOfBirth} onChange={e=>{ setFormError(''); setFormData({...formData, dateOfBirth: e.target.value}); }} type="date" min={EARLIEST_ELIGIBLE_BIRTH_DATE} max={LATEST_ELIGIBLE_BIRTH_DATE} className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold"/>
                                <p className="text-xs text-[var(--text-muted)]">Choose a date from {formatDateLabel(EARLIEST_ELIGIBLE_BIRTH_DATE)} to {formatDateLabel(LATEST_ELIGIBLE_BIRTH_DATE)}. The child must be under 18.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Assigned Sex</label>
                                    <select value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})} className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold">
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Blood Group</label>
                                    <select value={formData.bloodGroup} onChange={e=>setFormData({...formData, bloodGroup: e.target.value})} className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold">
                                        <option value="O+">O+</option> <option value="O-">O-</option>
                                        <option value="A+">A+</option> <option value="A-">A-</option>
                                        <option value="B+">B+</option> <option value="B-">B-</option>
                                        <option value="AB+">AB+</option> <option value="AB-">AB-</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="pt-2 sm:pt-4 flex flex-col-reverse sm:flex-row gap-3">
                                <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary" className="flex-1 font-bold py-6 rounded-xl">Cancel</Button>
                                <Button type="submit" disabled={mutation.isPending} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-sm border-none py-6 rounded-xl">
                                    {mutation.isPending ? 'Registering...' : 'Register Child'}
                                </Button>
                            </div>
                            {(formError || mutation.isError) && <div role="alert" className="text-danger text-sm font-semibold text-center mt-2">{formError || registrationError}</div>}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
