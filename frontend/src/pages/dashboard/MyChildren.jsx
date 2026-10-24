import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Activity, Syringe, LineChart, Plus, X, Users, CalendarDays, Clock3, Droplets, Mars, Venus, ArrowUpRight, ChevronRight, Stethoscope, ClipboardList, CalendarCheck2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';

const LATEST_PEDIATRIC_BIRTH_DATE = (() => {
    const today = new Date();
    return new Date(Date.UTC(
        today.getUTCFullYear() - 18,
        today.getUTCMonth(),
        today.getUTCDate() + 1
    )).toISOString().slice(0, 10);
})();

export const MyChildren = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({ firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE', bloodGroup: 'O+' });

    // Fetch dynamic real DB array via authorization layer
    const { data: children = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['myChildren'],
        queryFn: async () => {
            const res = await api.get('/children/my-children');
            return res.data.data;
        }
    });

    const { data: scheduleData, isLoading: scheduleLoading, isError: scheduleError } = useQuery({
        queryKey: ['parentSchedule'],
        queryFn: async () => {
            const res = await api.get('/appointments/my-schedule');
            return res.data.data.appointments || [];
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

        if (!formData.dateOfBirth || !Number.isFinite(age) || age < 0 || age >= 18) {
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
        if (!dob) return 'Age not recorded';
        const birthDate = new Date(dob);
        if (Number.isNaN(birthDate.getTime())) return 'Age not recorded';
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();
        if (days < 0) months -= 1;
        if (months < 0) { years -= 1; months += 12; }
        if (years > 0) return `${years} ${years === 1 ? 'year' : 'years'}${months ? ` ${months} mo` : ''}`;
        if (months > 0) return `${months} ${months === 1 ? 'month' : 'months'}`;
        return `${Math.max(0, days)} ${days === 1 ? 'day' : 'days'}`;
    };

    const formatDate = (value, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
        if (!value) return 'Not recorded';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? 'Not recorded' : date.toLocaleDateString(undefined, options);
    };

    const upcomingAppointments = (scheduleData || [])
        .filter((appointment) => ['PENDING', 'CONFIRMED'].includes(appointment.status) && new Date(appointment.scheduledAt) >= new Date())
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    const pendingAppointments = upcomingAppointments.filter((appointment) => appointment.status === 'PENDING').length;
    const confirmedAppointments = upcomingAppointments.filter((appointment) => appointment.status === 'CONFIRMED').length;

    const registrationError = mutation.error?.response?.data?.errors
        ?.map((error) => error.message || error.field)
        .filter(Boolean)
        .join(' ') || mutation.error?.response?.data?.message || 'We could not save this child record. Please review the details and try again.';

    return (
        <div className="w-full mx-auto space-y-7 animate-fade-in font-sans relative">
            <header className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        <Users size={14} className="text-primary-600" /> Family health <span className="text-[var(--border)]">/</span> Child records
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">My children</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">A clear view of each child’s profile, health record, growth history and immunizations.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} size="lg" className="w-full rounded-xl bg-teal font-bold text-white shadow-md shadow-teal/15 hover:bg-teal/90 sm:w-auto"><Plus size={18}/> Register a child</Button>
            </header>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading child profiles">
                    {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />)}
                </div>
            ) : isError ? (
                <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                    <Activity size={24} className="text-danger" />
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Child records couldn’t be loaded</h2>
                    <p className="text-sm text-[var(--text-secondary)]">Check your connection and try again. Your records have not been changed.</p>
                    <Button variant="secondary" onClick={() => refetch()}>Try again</Button>
                </CardContent></Card>
            ) : children.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-14 text-center shadow-[var(--shadow-sm)] sm:px-10">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-950"><Users size={27}/></div>
                    <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Your family profiles start here</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">Register a child to keep appointments, growth measurements and immunization history together.</p>
                    <Button onClick={() => setIsModalOpen(true)} className="mt-6 rounded-xl"><Plus size={17}/> Register a child</Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {children.map((child, index) => {
                            const palette = [
                                'from-primary-600 to-primary-800 ring-primary-100 dark:ring-primary-950',
                                'from-primary-600 to-primary-800 ring-primary-100 dark:ring-primary-950',
                                'from-primary-600 to-primary-800 ring-primary-100 dark:ring-primary-950'
                            ][index % 3];
                            const childAppointments = upcomingAppointments.filter((appointment) => appointment.childId === child.id);
                            const GenderIcon = child.gender?.toUpperCase() === 'FEMALE' ? Venus : Mars;
                            const name = `${child.firstName || ''} ${child.lastName || ''}`.trim();
                            return (
                                <Card key={child.id} className="group relative overflow-hidden rounded-2xl border-[var(--border)] bg-[var(--surface)] transition-all duration-300 hover:-translate-y-1 hover:border-primary-300/80 hover:shadow-[var(--shadow-lg)] dark:hover:border-primary-700">
                                    <div className="h-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700" />
                                    <CardContent className="p-5 sm:p-6">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-4">
                                                <div className={`relative flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${palette} text-xl font-extrabold text-white ring-4 shadow-md ${palette.split(' ').slice(2).join(' ')}`} aria-label={`${name} initials avatar`}>
                                                    {(child.firstName?.[0] || '') + (child.lastName?.[0] || '')}
                                                    <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-[3px] border-[var(--surface)] bg-emerald-500" aria-label="Profile active" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h2 className="truncate text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-xl">{name || 'Child profile'}</h2>
                                                    <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">{calculateAge(child.dateOfBirth)}</p>
                                                </div>
                                            </div>
                                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/> Active</span>
                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-2 border-y border-[var(--border)] py-4 text-xs text-[var(--text-secondary)]">
                                            <div className="flex min-w-0 items-center gap-2"><GenderIcon size={15} className={child.gender?.toUpperCase() === 'FEMALE' ? 'shrink-0 text-pink-500' : 'shrink-0 text-primary-600'}/><span className="truncate">{child.gender ? child.gender.toLowerCase().replace(/^./, (value) => value.toUpperCase()) : 'Sex not recorded'}</span></div>
                                            <div className="flex min-w-0 items-center gap-2"><Droplets size={15} className="shrink-0 text-rose-500"/><span className="truncate">{child.bloodType || 'Blood group not recorded'}</span></div>
                                            <div className="col-span-2 flex items-center gap-2"><CalendarDays size={15} className="shrink-0 text-primary-600"/><span>Born {formatDate(child.dateOfBirth)}</span></div>
                                        </div>

                                        <div className="mt-4 rounded-xl bg-[var(--surface-soft)] p-3.5">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950"><CalendarCheck2 size={17}/></span>
                                                    <div><p className="text-xs font-semibold text-[var(--text-secondary)]">Upcoming appointments</p><p className="mt-0.5 text-sm font-bold text-[var(--text-primary)]">{scheduleLoading || scheduleError ? '—' : childAppointments.length}</p></div>
                                                </div>
                                                <Link to="/appointments" aria-label={`View ${name}'s appointments`} className="rounded-lg p-2 text-primary-600 transition-colors hover:bg-[var(--surface)]"><ArrowUpRight size={17}/></Link>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                            <Link to={`/child/${child.id}`} className="group/action rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors hover:border-primary-300 hover:bg-primary-50/70 dark:hover:bg-primary-950/30">
                                                <Activity size={18} className="mb-2 text-primary-600"/><span className="block text-xs font-bold text-[var(--text-primary)]">Records</span><span className="mt-0.5 hidden text-[10px] text-[var(--text-muted)] sm:block">Health history</span>
                                            </Link>
                                            <Link to={`/child/${child.id}/growth`} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors hover:border-teal/50 hover:bg-teal/5">
                                                <LineChart size={18} className="mb-2 text-teal"/><span className="block text-xs font-bold text-[var(--text-primary)]">Growth</span><span className="mt-0.5 hidden text-[10px] text-[var(--text-muted)] sm:block">Measurements</span>
                                            </Link>
                                            <Link to={`/child/${child.id}/vaccines`} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors hover:border-amber-300 hover:bg-amber-50/70 dark:hover:bg-amber-950/20">
                                                <Syringe size={18} className="mb-2 text-amber-600"/><span className="block text-xs font-bold text-[var(--text-primary)]">Vaccines</span><span className="mt-0.5 hidden text-[10px] text-[var(--text-muted)] sm:block">Immunizations</span>
                                            </Link>
                                        </div>
                                        <Link to={`/child/${child.id}`} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-50 px-4 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-950/70 dark:text-primary-200 dark:hover:bg-primary-900">
                                            Open health profile <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5"/>
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
                        <Card className="rounded-2xl">
                            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-6">
                                <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950"><CalendarDays size={19}/></span><div><h2 className="font-bold text-[var(--text-primary)]">Upcoming appointments</h2><p className="mt-0.5 text-xs text-[var(--text-muted)]">Your family’s next scheduled visits</p></div></div>
                                <Link to="/appointments" className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700">View all <ArrowUpRight size={14}/></Link>
                            </div>
                            <div className="space-y-2.5 p-4 sm:p-5">
                                {scheduleError ? <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">Appointments could not be loaded. Your child profiles are still available.</p>
                                    : scheduleLoading ? <div className="h-20 animate-pulse rounded-xl bg-[var(--surface-soft)]" />
                                    : upcomingAppointments.length === 0 ? <div className="rounded-xl bg-[var(--surface-soft)] px-4 py-6 text-center"><CalendarCheck2 size={21} className="mx-auto text-[var(--text-muted)]"/><p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">No upcoming visits</p><p className="mt-1 text-xs text-[var(--text-muted)]">Appointments you book will appear here.</p></div>
                                    : upcomingAppointments.slice(0, 4).map((appointment) => (
                                        <Link key={appointment.id} to="/appointments" className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 sm:gap-4 sm:p-4">
                                            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-200"><span className="text-[9px] font-extrabold uppercase">{formatDate(appointment.scheduledAt, { month: 'short' })}</span><span className="text-base font-extrabold leading-4">{new Date(appointment.scheduledAt).getDate()}</span></div>
                                            <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[var(--text-primary)]">{appointment.child?.firstName} {appointment.child?.lastName}</p><p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{appointment.reason || 'Pediatric consultation'}{appointment.doctor?.lastName ? ` · Dr. ${appointment.doctor.lastName}` : ''}</p></div>
                                            <div className="hidden shrink-0 text-right sm:block"><p className="flex items-center justify-end gap-1.5 text-xs font-semibold text-[var(--text-secondary)]"><Clock3 size={13}/>{new Date(appointment.scheduledAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</p><p className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${appointment.status === 'CONFIRMED' ? 'text-emerald-600' : 'text-amber-600'}`}>{appointment.status.toLowerCase()}</p></div>
                                            <ChevronRight size={16} className="shrink-0 text-[var(--text-muted)] sm:hidden"/>
                                        </Link>
                                    ))}
                            </div>
                        </Card>

                        <Card className="rounded-2xl">
                            <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal"><ClipboardList size={19}/></span><div><h2 className="font-bold text-[var(--text-primary)]">Family overview</h2><p className="mt-0.5 text-xs text-[var(--text-muted)]">Live totals from your records</p></div></div></div>
                            <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><Users size={18} className="text-primary-600"/><p className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">{children.length}</p><p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">Registered children</p></div>
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><CalendarCheck2 size={18} className="text-teal"/><p className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">{scheduleLoading || scheduleError ? '—' : confirmedAppointments}</p><p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">Confirmed visits</p></div>
                                <div className="col-span-2 flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] p-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50"><Clock3 size={17}/></span><div><p className="text-sm font-bold text-[var(--text-primary)]">Awaiting confirmation</p><p className="mt-0.5 text-xs text-[var(--text-muted)]">Pending appointment requests</p></div></div><span className="text-xl font-extrabold text-[var(--text-primary)]">{scheduleLoading || scheduleError ? '—' : pendingAppointments}</span></div>
                                <Link to="/appointments" className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-bold text-white transition-colors hover:bg-teal/90">Book an appointment <Stethoscope size={16}/></Link>
                            </div>
                        </Card>
                    </section>
                </>
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
                                <input required value={formData.dateOfBirth} onChange={e=>{ setFormError(''); setFormData({...formData, dateOfBirth: e.target.value}); }} type="date" max={LATEST_PEDIATRIC_BIRTH_DATE} className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold"/>
                                <p className="text-xs text-[var(--text-muted)]">The child must be under 18 years old.</p>
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
