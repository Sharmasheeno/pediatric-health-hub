import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { BookOpen, PlayCircle, FileText, Search, X } from 'lucide-react';

export const HealthEducation = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState(null);
    // Demonstration structural array mapping to the Education feature sets
    const articles = [
        { title: 'Understanding Essential Infant Nutrition Requirements', category: 'Diet & Nutrition', readTime: '5 min', icon: <BookOpen size={24} className="text-[#14c39a]"/>, color: 'bg-[#14c39a]/10', content: "During the first year of life, breast milk or formula provides the vast majority of calories and essential nutrients an infant needs. Around 6 months, iron-fortified cereals and pureed vegetables can be introduced. It is critical to avoid honey before the age of 1 due to botulism risks, and cow's milk should not replace formula or breast milk until after 12 months. Ensure safe textures to prevent choking hazards." },
        { title: 'The Scientific Importance of Vaccination Schedules', category: 'Immunization', readTime: '8 min', icon: <FileText size={24} className="text-[#8244e0]"/>, color: 'bg-[#8244e0]/10', content: "Vaccines stimulate the immune system to build antibodies against dangerous pathogens without causing the disease itself. Adhering to the CDC-recommended pediatric schedule ensures your child is protected during their most vulnerable developmental windows. Herd immunity protects not only your child but immune-compromised individuals within the broader community." },
        { title: 'Managing & Monitoring Common Childhood Fevers', category: 'General Care', readTime: '6 min', icon: <PlayCircle size={24} className="text-[#ffb020]"/>, color: 'bg-[#ffb020]/10', content: "A fever is typically a sign that the body is fighting an infection. For children over 6 months, a temperature up to 102°F can often be managed at home with adequate hydration and rest. Acetaminophen or Ibuprofen can be used to reduce discomfort, but dosages must be strictly weight-based. Immediate medical attention is required for any fever in infants under 3 months of age." },
        { title: 'Critical Development Milestones: 6 Months', category: 'Development', readTime: '4 min', icon: <BookOpen size={24} className="text-[#ff4d4f]"/>, color: 'bg-[#ff4d4f]/10', content: "At six months, cognitive and physical development accelerates rapidly. Clinically, you should expect your infant to recognize familiar faces, respond to emotions, string vowels together (babbling), and begin sitting without support. They may also transfer objects from one hand to another. If your child does not show affection for caregivers or resists making distinct vowel sounds, consult your pediatrician." },
    ];

    // Filter Logic
    const filteredArticles = articles.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full mx-auto space-y-6 animate-fade-in font-sans">
            <div className="bg-gradient-to-r from-[#8244e0] to-[#512da8] rounded shadow-sm p-8 text-white flex flex-col md:flex-row justify-between items-center overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/4"></div>
                <div className="z-10 w-full text-center md:text-left">
                    <h1 className="text-3xl font-black tracking-tight mb-2">Health Education Library</h1>
                    <p className="text-white/80 font-medium">Reliable clinical guidance and literature curated entirely by pediatric specialists.</p>
                </div>
                <div className="mt-6 md:mt-0 relative w-full md:w-96 z-10 shrink-0">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search clinical topics..." 
                        className="w-full pl-12 pr-4 py-3 rounded bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner font-semibold" 
                    />
                    <Search size={18} className="absolute left-4 top-3.5 text-white/60" />
                </div>
            </div>
            
            <h2 className="text-[#6c7293] font-bold text-[11px] uppercase tracking-widest mt-8 mb-4">Latest Published Resources</h2>
            
            {filteredArticles.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <Search size={32} className="mx-auto text-slate-300 mb-3" />
                    <h2 className="text-xl font-bold text-slate-600 mb-2">No literature found</h2>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto">Try adjusting your search terms to match different clinical topics or categories.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredArticles.map((article, idx) => (
                        <Card key={idx} onClick={() => setSelectedArticle(article)} className="hover:shadow-md cursor-pointer transition-all border-slate-100 bg-white rounded hover:-translate-y-0.5 group">
                            <CardContent className="p-6 flex items-start gap-5">
                                <div className={`p-5 rounded group-hover:scale-105 transition-transform ${article.color}`}>
                                    {article.icon}
                                </div>
                                <div className="pt-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#aeb1c4] mb-1.5">{article.category}</div>
                                    <h3 className="font-black text-slate-800 text-lg leading-tight mb-2 tracking-tight">{article.title}</h3>
                                    <div className="text-xs font-bold text-[#14c39a]">{article.readTime} read</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Article Reading View Modal */}
            {selectedArticle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in relative flex flex-col max-h-[90vh]">
                        <div className="bg-slate-50 border-b border-slate-100 p-6 sm:p-8 flex justify-between items-start">
                            <div className="flex items-center gap-5">
                                <div className={`p-4 rounded-xl shadow-sm ${selectedArticle.color}`}>{selectedArticle.icon}</div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#aeb1c4] mb-1.5">{selectedArticle.category}</div>
                                    <h2 className="text-2xl font-black tracking-tight text-slate-800 leading-tight">{selectedArticle.title}</h2>
                                </div>
                            </div>
                            <button onClick={() => setSelectedArticle(null)} className="hover:bg-slate-200 p-2 rounded-full transition-colors text-slate-400 hover:text-slate-800"><X size={24}/></button>
                        </div>
                        
                        <div className="p-8 sm:p-10 overflow-y-auto space-y-6">
                            <p className="text-base font-medium text-slate-600 leading-relaxed selection:bg-[#14c39a]/30">
                                {selectedArticle.content}
                            </p>
                            <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-lg flex gap-4 items-start">
                                <BookOpen className="text-blue-500 shrink-0 mt-0.5" size={20} />
                                <p className="text-sm font-semibold text-blue-800 leading-relaxed">
                                    For specific clinical concerns regarding your child's health or developmental progress, always consult directly with your assigned Pediatrician via the Tele-consultation portal or secure messaging.
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 p-5 border-t border-slate-100 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Verified by Pediatric Health Hub Clinical Board • Est. Read Time: <span className="text-[#14c39a]">{selectedArticle.readTime}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
