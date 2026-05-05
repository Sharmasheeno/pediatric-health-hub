import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bot, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const EMPTY_FORM = { triggerKeyword: '', response: '' };

export const ManageChatbotTemplates = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [uiError, setUiError] = useState('');

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['admin-chatbot-templates'],
        queryFn: async () => (await api.get('/admin/chatbot/templates')).data.data
    });

    const upsertTemplate = useMutation({
        mutationFn: async (payload) => api.post('/admin/chatbot/templates', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-chatbot-templates'] });
            setForm(EMPTY_FORM);
            setEditingId(null);
            setUiError('');
        },
        onError: (err) => {
            setUiError(err.response?.data?.message || 'Failed to save template');
        }
    });

    const deleteTemplate = useMutation({
        mutationFn: async (templateId) => api.delete(`/admin/chatbot/templates/${templateId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-chatbot-templates'] });
            setUiError('');
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
            setUiError('Trigger keywords and response are required');
            return;
        }
        upsertTemplate.mutate({ triggerKeyword, response });
    };

    const startEdit = (template) => {
        setEditingId(template.id);
        setForm({
            triggerKeyword: template.triggerKeyword,
            response: template.response
        });
        setUiError('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setUiError('');
    };

    if (user?.role !== 'ADMIN') {
        return <div className="p-20 text-center text-danger font-bold text-2xl uppercase tracking-widest animate-pulse">403 FORBIDDEN</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <Card className="border-[--border] shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-[--text-primary]">
                        <span className="p-2 rounded-lg bg-blue-600 text-white"><Bot size={18} /></span>
                        Manage Chatbot Templates
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-[--text-secondary]">
                        Add trigger keywords and response templates used by the AI engine. Use comma-separated keywords for broader coverage.
                    </p>
                </CardContent>
            </Card>

            <Card className="border-[--border] shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base text-[--text-primary]">
                        {editingId ? 'Edit Template' : 'Create Template'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submitForm} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wide">Trigger Keywords</label>
                            <input
                                type="text"
                                value={form.triggerKeyword}
                                onChange={(e) => setForm((prev) => ({ ...prev, triggerKeyword: e.target.value }))}
                                placeholder="fever, high temperature, child fever"
                                className="w-full border border-[--border] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wide">Templated Response</label>
                            <textarea
                                rows={4}
                                value={form.response}
                                onChange={(e) => setForm((prev) => ({ ...prev, response: e.target.value }))}
                                placeholder="Provide safe pediatric guidance..."
                                className="w-full border border-[--border] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            />
                        </div>
                        {uiError && <div className="text-sm text-red-600 font-medium">{uiError}</div>}
                        <div className="flex gap-3">
                            <Button type="submit" isLoading={upsertTemplate.isPending} className="bg-blue-600 hover:bg-blue-700">
                                {editingId ? <Save size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
                                {editingId ? 'Update Template' : 'Create Template'}
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

            <Card className="border-[--border] shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base text-[--text-primary]">Existing Templates</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-10 text-center text-[--text-secondary]">Loading templates...</div>
                    ) : templates.length === 0 ? (
                        <div className="py-10 text-center text-[--text-secondary]">No templates configured yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {templates.map((template) => (
                                <div key={template.id} className="border border-[--border] rounded-xl p-4 bg-[--surface]">
                                    <div className="text-xs uppercase tracking-wide font-semibold text-[--text-secondary] mb-1">Keywords</div>
                                    <div className="font-semibold text-[--text-primary]">{template.triggerKeyword}</div>
                                    <div className="text-xs uppercase tracking-wide font-semibold text-[--text-secondary] mt-3 mb-1">Response</div>
                                    <div className="text-sm text-[--text-primary] whitespace-pre-wrap">{template.response}</div>
                                    <div className="mt-4 flex gap-2">
                                        <Button type="button" variant="outline" onClick={() => startEdit(template)}>
                                            <Edit3 size={16} className="mr-2" /> Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => deleteTemplate.mutate(template.id)}
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
