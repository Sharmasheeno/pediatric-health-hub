import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bot, Building2, ExternalLink, Globe2, Save, Upload, X, Heart } from 'lucide-react';

const EMPTY_SETTINGS = {
  organizationName: '', shortName: '', tagline: '', logoDataUrl: null, primaryColor: '#2563EB',
  supportEmail: '', supportPhone: '', websiteUrl: '', address: '', country: '', timezone: '',
  currency: 'USD', assistantName: '', assistantDisclaimer: ''
};

const fieldClass = 'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]';

export const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState('');

  const settingsQuery = useQuery({
    queryKey: ['admin-system-settings'],
    queryFn: async () => (await api.get('/admin/settings')).data.data
  });

  const form = formState || { ...EMPTY_SETTINGS, ...settingsQuery.data };

  const saveSettings = useMutation({
    mutationFn: async (payload) => (await api.put('/admin/settings', payload)).data.data,
    onSuccess: (saved) => {
      setFormState({ ...EMPTY_SETTINGS, ...saved });
      setFeedback('Settings saved and applied across the system.');
      setFormError('');
      queryClient.setQueryData(['system-branding'], saved);
      queryClient.invalidateQueries({ queryKey: ['system-branding'] });
    },
    onError: (error) => {
      setFeedback('');
      setFormError(error.response?.data?.message || 'Could not save settings. Please check the fields and try again.');
    }
  });

  const update = (key, value) => {
    setFormState(current => ({ ...(current || { ...EMPTY_SETTINGS, ...settingsQuery.data }), [key]: value }));
    setFeedback('');
    setFormError('');
  };

  const handleLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setFormError('Choose a PNG, JPEG, or WebP image. SVG files are not supported.');
      event.target.value = '';
      return;
    }
    if (file.size > 1024 * 1024) {
      setFormError('The logo must be 1 MB or smaller.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update('logoDataUrl', reader.result);
    reader.onerror = () => setFormError('The logo file could not be read. Please choose another image.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const optionalValue = (value) => typeof value === 'string' ? value.trim() || null : null;
    saveSettings.mutate({
      ...form,
      supportEmail: optionalValue(form.supportEmail),
      supportPhone: optionalValue(form.supportPhone),
      websiteUrl: optionalValue(form.websiteUrl),
      address: optionalValue(form.address)
    });
  };

  if (settingsQuery.isLoading) return <div className="py-16 text-center text-[var(--text-secondary)]">Loading organization settings…</div>;
  if (settingsQuery.isError) return <div className="rounded-xl border border-danger/30 bg-danger/5 p-6 text-sm text-danger">Settings could not be loaded. Check the API connection and refresh this page.</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">Administration</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">Organization settings</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">Manage the organization identity, contact information, locale, and assistant presentation from one place.</p>
        </div>
        <Link to="/admin/assistant-knowledge" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700">
          Manage assistant knowledge <ExternalLink size={15} />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 size={18} className="text-primary-600" /> Organization identity</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-sm" style={{ backgroundColor: form.primaryColor }}>
                {form.logoDataUrl ? <img src={form.logoDataUrl} alt="Organization logo preview" className="h-full w-full bg-white object-contain" /> : <Heart size={26} className="text-white" fill="currentColor" />}
              </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">Logo preview</div>
                  <div className="text-xs text-[var(--text-muted)]">PNG, JPEG, or WebP · up to 1 MB</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-3.5 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-soft)]">
                  <Upload size={15} /> Upload logo
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogo} className="sr-only" />
                </label>
                {form.logoDataUrl && <Button type="button" variant="outline" onClick={() => update('logoDataUrl', null)}><X size={15} className="mr-1.5" />Remove logo</Button>}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label><span className={labelClass}>Organization name *</span><input className={fieldClass} maxLength={120} required value={form.organizationName} onChange={e => update('organizationName', e.target.value)} /></label>
              <label><span className={labelClass}>Short name *</span><input className={fieldClass} maxLength={60} required value={form.shortName} onChange={e => update('shortName', e.target.value)} /></label>
              <label className="md:col-span-2"><span className={labelClass}>Tagline</span><input className={fieldClass} maxLength={255} value={form.tagline} onChange={e => update('tagline', e.target.value)} placeholder="A short description shown with your brand" /></label>
              <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--border)] p-3">
                <span><span className={labelClass}>Primary brand color</span><span className="text-xs text-[var(--text-muted)]">Updates the primary interface color throughout the app.</span></span>
                <input aria-label="Primary brand color" type="color" value={form.primaryColor} onChange={e => update('primaryColor', e.target.value)} className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent" />
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 text-sm text-[var(--text-secondary)]"><span className="h-8 w-8 rounded-lg" style={{ background: form.primaryColor }} /> Preview of the selected brand color</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe2 size={18} className="text-primary-600" /> Company contact and regional details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label><span className={labelClass}>Support email</span><input type="email" className={fieldClass} value={form.supportEmail || ''} onChange={e => update('supportEmail', e.target.value)} placeholder="support@example.org" /></label>
            <label><span className={labelClass}>Support phone</span><input type="tel" className={fieldClass} maxLength={40} value={form.supportPhone || ''} onChange={e => update('supportPhone', e.target.value)} placeholder="+252 …" /></label>
            <label><span className={labelClass}>Website</span><input type="url" className={fieldClass} value={form.websiteUrl || ''} onChange={e => update('websiteUrl', e.target.value)} placeholder="https://example.org" /></label>
            <label><span className={labelClass}>Country or service region *</span><input className={fieldClass} maxLength={100} required value={form.country} onChange={e => update('country', e.target.value)} /></label>
            <label><span className={labelClass}>Time zone *</span><input className={fieldClass} maxLength={80} required value={form.timezone} onChange={e => update('timezone', e.target.value)} placeholder="Africa/Mogadishu" /></label>
            <label><span className={labelClass}>Currency code *</span><input className={fieldClass} maxLength={3} minLength={3} required value={form.currency} onChange={e => update('currency', e.target.value.toUpperCase())} placeholder="USD" /></label>
            <label className="md:col-span-2"><span className={labelClass}>Business address</span><textarea rows={2} className={fieldClass} maxLength={2000} value={form.address || ''} onChange={e => update('address', e.target.value)} placeholder="Address shown to families and providers" /></label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bot size={18} className="text-primary-600" /> Assistant presentation and safety</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="block"><span className={labelClass}>Assistant display name *</span><input className={fieldClass} maxLength={100} required value={form.assistantName} onChange={e => update('assistantName', e.target.value)} /></label>
            <label className="block"><span className={labelClass}>Safety disclaimer shown to users *</span><textarea rows={4} className={fieldClass} minLength={20} maxLength={2000} required value={form.assistantDisclaimer} onChange={e => update('assistantDisclaimer', e.target.value)} /></label>
            <p className="rounded-lg bg-warning/10 p-3 text-xs leading-relaxed text-[var(--text-secondary)]">This changes the assistant’s name and displayed disclaimer. It does not change clinical rules. Only publish knowledge entries after a qualified clinician has reviewed them and the source is recorded.</p>
          </CardContent>
        </Card>

        {(formError || feedback) && <div role="status" className={`rounded-lg border p-3 text-sm ${formError ? 'border-danger/30 bg-danger/5 text-danger' : 'border-success/30 bg-success/5 text-success'}`}>{formError || feedback}</div>}
        <div className="flex justify-end">
          <Button type="submit" isLoading={saveSettings.isPending} className="min-w-40"><Save size={16} className="mr-2" />Save settings</Button>
        </div>
      </form>
    </div>
  );
};
