import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import FieldRenderer from "@/components/builder/FieldRenderer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function PublicFormPage() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get(`/public/forms/${slug}`).then((r) => setForm(r.data))
      .catch((e) => setError(e?.response?.data?.detail || "Form not found"));
  }, [slug]);

  const visibleProgressFields = (form?.fields || []).filter((f) => !["heading", "paragraph", "divider"].includes(f.type));
  const filledCount = visibleProgressFields.filter((f) => {
    const v = values[f.id];
    return v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
  }).length;
  const progress = visibleProgressFields.length === 0 ? 0 : Math.round((filledCount / visibleProgressFields.length) * 100);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/public/forms/${slug}/submit`, { values });
      if (form?.settings?.redirect_url) {
        window.location.href = form.settings.redirect_url;
        return;
      }
      setDone(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Submission failed");
    } finally { setSubmitting(false); }
  };

  if (error) return <div className="min-h-screen flex items-center justify-center text-slate-500">{error}</div>;
  if (!form) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>;
  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl card-soft p-10 max-w-md text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
          <h2 className="text-2xl font-heading font-bold tracking-tight">Submission received</h2>
          <p className="text-slate-500 mt-2">{form.settings?.thank_you_message || "Thanks for your submission!"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="flex items-center gap-2 mb-4 text-slate-500 text-sm">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Powered by FormForge</span>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl card-soft p-8" data-testid="public-form">
          {form.settings?.show_progress && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Progress</span><span>{progress}%</span></div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>
            </div>
          )}
          <h1 className="text-3xl font-heading font-bold tracking-tight text-slate-900">{form.title}</h1>
          {form.description && <p className="text-sm text-slate-500 mt-2">{form.description}</p>}
          <div className="mt-6 space-y-5">
            {(form.fields || []).map((f) => (
              <FieldRenderer key={f.id} field={f}
                value={values[f.id]}
                onChange={(v) => setValues((s) => ({ ...s, [f.id]: v }))}
                mode="fill" isPublic />
            ))}
          </div>
          <Button data-testid="submit-public-form" type="submit" disabled={submitting} className="mt-6 bg-blue-600 hover:bg-blue-700 w-full h-11 rounded-lg">
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        </form>
      </div>
    </div>
  );
}
