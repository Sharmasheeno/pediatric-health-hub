import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bot, Edit3, Plus, Save, Trash2, X, ShieldCheck, ShieldAlert, ExternalLink } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const EMPTY_FORM = { triggerKeyword: '', response: '', language: 'en', sourceUrl: '', reviewerName: '', isClinicallyReviewed: false };

export const ManageChatbotTemplates = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [uiError, setUiError] = useState('');
    const [notice, setNotice] = useState('');

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['admin-chatbot-templates'],
        queryFn: async () => (await api.get('/admin/chatbot/templates')).data.data
    });

    const upsertTemplate = useMutation({
        mutationFn: async (payload) => editingId
            ? api.put(`/admin/chatbot/templates/${editingId}`, payload)
            : api.post('/admin/chatbot/templates', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-chatbot-templates'] });
            setForm(EMPTY_FORM);
            setEditingId(null);
            setUiError('');
            setNotice('Knowledge entry saved. Only clinically reviewed entries are used in assistant replies.');
        },
        onError: (err) => {
            setNotice('');
            setUiError(err.response?.data?.message || 'Failed to save knowledge entry');
        }
    });

    const deleteTemplate = useMutation({
        mutationFn: async (templateId) => api.delete(`/admin/chatbot/templates/${templateId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-chatbot-templates'] });
            setUiError('');
            setNotice('Knowledge entry deleted.');
        },
        onError: (err) => {
            setUiError(err.response?.data?.message || 'Failed to delete template');
        }
    });

    const submitForm = (e) => {
        e.preventDefault();
        const triggerKeyword = form.triggerKeyword.trim();
        const response = form.response.trim();
        if (!triggerKeyword || !response) {
            setUiError('Keywords and a response are required.');
            return;
        }
        if (form.isClinicallyReviewed && (!form.sourceUrl.trim() || !form.reviewerName.trim())) {
            setUiError('Add the clinical source and reviewer name before marking an entry as reviewed.');
            return;
        }
        upsertTemplate.mutate({
            ...form,
            triggerKeyword,
            response,
            sourceUrl: form.sourceUrl.trim() || null,
            reviewerName: form.reviewerName.trim() || null
        });
    };

    const startEdit = (template) => {
        setEditingId(template.id);
        setForm({
            triggerKeyword: template.triggerKeyword,
            response: template.response,
            language: template.language,
            sourceUrl: template.sourceUrl || '',
            reviewerName: template.reviewerName || '',
            isClinicallyReviewed: template.isClinicallyReviewed
        });
        setUiError('');
        setNotice('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setUiError('');
        setNotice('');
    };

    if (user?.role !== 'ADMIN') {
        return <div className="p-20 text-center text-danger font-bold text-2xl uppercase tracking-widest animate-pulse">403 FORBIDDEN</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <Card className="border-[var(--border)] shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-[var(--text-primary)]">
                        <span className="p-2 rounded-lg bg-primary-600 text-white"><Bot size={18} /></span>
                        Assistant Knowledge Base
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Add language-specific answers for topics the assistant does not cover well. An entry stays a draft until a qualified clinician has reviewed it and its source is recorded; urgent-symptom safeguards always take precedence. The app records the reviewer you enter but does not verify clinical credentials.
                    </p>
                </CardContent>
            </Card>

            <Card className="border-[var(--border)] shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base text-[var(--text-primary)]">
                            {editingId ? 'Edit knowledge entry' : 'Create knowledge entry'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submitForm} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Topic keywords</label>
                            <input
                                type="text"
                                value={form.triggerKeyword}
                                onChange={(e) => setForm((prev) => ({ ...prev, triggerKeyword: e.target.value }))}
                                placeholder="Comma-separated, for example: feeding, picky eating"
                                className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-1">
                                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Response language</span>
                                <select value={form.language} onChange={e => setForm(prev => ({ ...prev, language: e.target.value }))} className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 bg-[var(--surface)] text-[var(--text-primary)]">
                                    <option value="en">English</option><option value="so">Somali</option>
                                </select>
                            </label>
                            <label className="space-y-1">
                                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Clinical source URL</span>
                                <input type="url" value={form.sourceUrl} onChange={e => setForm(prev => ({ ...prev, sourceUrl: e.target.value }))} placeholder="https://official-guideline.example" className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 bg-[var(--surface)] text-[var(--text-primary)]" />
                            </label>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Answer shown to families</label>
                            <textarea
                                rows={4}
                                value={form.response}
                                onChange={(e) => setForm((prev) => ({ ...prev, response: e.target.value }))}
                                placeholder="Answer the question directly in clear language. Include safe next steps, warning signs, and what information would help tailor the guidance. Do not diagnose or prescribe."
                                className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-1">
                                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Clinician reviewer</span>
                                <input value={form.reviewerName} onChange={e => setForm(prev => ({ ...prev, reviewerName: e.target.value }))} placeholder="Name of qualified clinical reviewer" className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 bg-[var(--surface)] text-[var(--text-primary)]" />
                            </label>
                            <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 text-sm text-[var(--text-primary)]">
                                <input type="checkbox" checked={form.isClinicallyReviewed} onChange={e => setForm(prev => ({ ...prev, isClinicallyReviewed: e.target.checked }))} className="h-4 w-4 accent-primary-600" />
                                I confirm this answer has been clinically reviewed
                            </label>
                        </div>
                        {uiError && <div className="text-sm text-red-600 font-medium">{uiError}</div>}
                        {notice && <div role="status" className="text-sm text-green-700 font-medium">{notice}</div>}
                        <div className="flex gap-3">
                            <Button type="submit" isLoading={upsertTemplate.isPending} className="bg-primary-600 hover:bg-primary-700">
                                {editingId ? <Save size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
                                {editingId ? 'Update entry' : 'Save entry'}
                            </Button>
                            {editingId && (
                                <Button type="button" variant="outline" onClick={cancelEdit}>
                                    <X size={16} className="mr-2" /> Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-[var(--border)] shadow-sm">
                <CardHeader>
                        <CardTitle className="text-base text-[var(--text-primary)]">Saved knowledge entries</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-10 text-center text-[var(--text-secondary)]">Loading templates...</div>
                    ) : templates.length === 0 ? (
                        <div className="py-10 text-center text-[var(--text-secondary)]">No knowledge entries have been added.</div>
                    ) : (
                        <div className="space-y-3">
                            {templates.map((template) => (
                                <div key={template.id} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)]">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">{template.language === 'so' ? 'Somali' : 'English'}</span>
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${template.isClinicallyReviewed ? 'bg-success/10 text-success' : 'bg-warning/10 text-amber-700'}`}>
                                            {template.isClinicallyReviewed ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                                            {template.isClinicallyReviewed ? 'Reviewed · active' : 'Draft · not used'}
                                        </span>
                                    </div>
                                    <div className="text-xs uppercase tracking-wide font-semibold text-[var(--text-secondary)] mt-3 mb-1">Keywords</div>
                                    <div className="font-semibold text-[var(--text-primary)]">{template.triggerKeyword}</div>
                                    <div className="text-xs uppercase tracking-wide font-semibold text-[var(--text-secondary)] mt-3 mb-1">Response</div>
                                    <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{template.response}</div>
                                    {(template.reviewerName || template.sourceUrl) && <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                                        {template.reviewerName && <span>Reviewer: {template.reviewerName}</span>}
                                        {template.sourceUrl && <a href={template.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-600 hover:underline">Clinical source <ExternalLink size={12} /></a>}
                                    </div>}
                                    <div className="mt-4 flex gap-2">
                                        <Button type="button" variant="outline" onClick={() => startEdit(template)}>
                                            <Edit3 size={16} className="mr-2" /> Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => {
                                                if (window.confirm('Delete this assistant knowledge entry? This cannot be undone.')) deleteTemplate.mutate(template.id);
                                            }}
                                            isLoading={deleteTemplate.isPending}
                                        >
                                            <Trash2 size={16} className="mr-2" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
