import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { AlertCircle, Phone, MapPin, HeartPulse, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const EmergencyGuidance = () => {
    return (
        <div className="w-full mx-auto space-y-6 animate-fade-in font-sans">
            <div className="bg-[#ff4d4f] rounded shadow-sm p-6 sm:p-10 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="z-10 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-3">
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner shrink-0">
                             <ShieldAlert size={28} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Emergency Triage Protocols</h1>
                    </div>
                    <p className="text-white/90 font-medium max-w-xl md:ml-16">If your child is experiencing a life-threatening medical emergency, do not wait. Contact professional emergency services immediately.</p>
                </div>
                <Button className="mt-8 md:mt-0 bg-[--surface] text-[#ff4d4f] hover:bg-[--surface-soft] font-black px-8 py-7 text-lg shadow-sm z-10 rounded-xl" onClick={() => window.location.href='tel:911'}>
                    <Phone size={22} className="mr-3" fill="currentColor"/> DIAL 911 NOW
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <Card className="col-span-1 lg:col-span-2 border-[--border] shadow-sm rounded bg-[--surface]">
                    <CardContent className="p-8">
                        <h2 className="text-lg font-black text-[--text-primary] mb-8 flex items-center gap-3"><HeartPulse className="text-[#ff4d4f]" size={24}/> Immediate Action Protocols</h2>
                        <div className="space-y-8">
                            <div className="flex gap-5">
                                <div className="w-10 h-10 rounded bg-danger/10 text-red-600 font-black flex items-center justify-center shrink-0 shadow-inner text-lg">1</div>
                                <div>
                                    <h3 className="font-black text-[--text-primary] text-lg">Severe Difficulty Breathing</h3>
                                    <p className="text-sm text-[--text-secondary] mt-1.5 font-medium leading-relaxed">Look for blue lips, rapid chest retractions, or gasping. Keep the child calm in an upright position and call your local emergency dispatch immediately.</p>
                                </div>
                            </div>
                            <div className="flex gap-5">
                                <div className="w-10 h-10 rounded bg-danger/10 text-red-600 font-black flex items-center justify-center shrink-0 shadow-inner text-lg">2</div>
                                <div>
                                    <h3 className="font-black text-[--text-primary] text-lg">Unresponsiveness or Seizures</h3>
                                    <p className="text-sm text-[--text-secondary] mt-1.5 font-medium leading-relaxed">Roll the child onto their side to keep the airway clear. Do not put anything in their mouth or attempt to hold them down. Time the seizure.</p>
                                </div>
                            </div>
                            <div className="flex gap-5">
                                <div className="w-10 h-10 rounded bg-danger/10 text-red-600 font-black flex items-center justify-center shrink-0 shadow-inner text-lg">3</div>
                                <div>
                                    <h3 className="font-black text-[--text-primary] text-lg">High Fever (Under 3 Months)</h3>
                                    <p className="text-sm text-[--text-secondary] mt-1.5 font-medium leading-relaxed">Any core temperature over 100.4°F (38°C) in an infant under 3 months is a clinical baseline medical emergency. Proceed to the nearest hospital ER right now.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="col-span-1 space-y-6">
                    <Card className="border-slate-50 shadow-sm rounded bg-[--surface-soft] flex flex-col h-full">
                        <CardContent className="p-6">
                            <h3 className="font-black text-[--text-primary] mb-5 text-[11px] uppercase tracking-widest text-[#aeb1c4]">Nearest Approved Facilities</h3>
                            <div className="space-y-4">
                                <div className="bg-[--surface] p-5 rounded shadow-sm border border-[--border] hover:border-[#14c39a] transition-colors cursor-pointer group">
                                    <div className="font-black text-[--text-primary] flex items-center gap-2.5 mb-1"><MapPin size={16} className="text-teal group-hover:animate-bounce"/> City General Hospital</div>
                                    <div className="text-xs font-semibold text-[--text-secondary] ml-6">2.4 miles away • Open 24/7</div>
                                </div>
                                <div className="bg-[--surface] p-5 rounded shadow-sm border border-[--border] hover:border-[#14c39a] transition-colors cursor-pointer group">
                                    <div className="font-black text-[--text-primary] flex items-center gap-2.5 mb-1"><MapPin size={16} className="text-teal group-hover:animate-bounce"/> Pediatric Urgent Care</div>
                                    <div className="text-xs font-semibold text-[--text-secondary] ml-6">5.1 miles away • Open until 11 PM</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
