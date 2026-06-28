import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Star, Upload, X, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Renders a single field. `value` and `onChange` enable controlled input.
// `mode` = "preview" | "fill" | "builder-static"
export default function FieldRenderer({ field, value, onChange, mode = "fill", isPublic = false }) {
  const required = field.required && field.type !== "heading" && field.type !== "paragraph" && field.type !== "divider";
  const disabled = field.read_only || mode === "builder-static";

  const renderLabel = () => (
    <Label className="text-sm font-medium text-slate-800 flex items-center gap-1">
      {field.label}
      {required && <span className="text-red-500">*</span>}
    </Label>
  );

  const renderDesc = () =>
    field.description ? <p className="text-xs text-slate-500">{field.description}</p> : null;

  switch (field.type) {
    case "short_text":
    case "email":
    case "phone":
    case "url":
      return (
        <div className="space-y-1.5">
          {renderLabel()}
          <Input
            type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
            placeholder={field.placeholder || ""}
            value={value || ""}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.value)}
          />
          {renderDesc()}
        </div>
      );
    case "long_text":
      return (
        <div className="space-y-1.5">
          {renderLabel()}
          <Textarea rows={4} placeholder={field.placeholder || ""} value={value || ""}
            disabled={disabled} onChange={(e) => onChange?.(e.target.value)} />
          {renderDesc()}
        </div>
      );
    case "number":
      return (
        <div className="space-y-1.5">
          {renderLabel()}
          <Input type="number" placeholder={field.placeholder || ""} value={value ?? ""}
            disabled={disabled} onChange={(e) => onChange?.(e.target.value)} />
          {renderDesc()}
        </div>
      );
    case "date":
      return (
        <div className="space-y-1.5">
          {renderLabel()}
          <Input type="date" value={value || ""} disabled={disabled}
            onChange={(e) => onChange?.(e.target.value)} />
          {renderDesc()}
        </div>
      );
    case "time":
      return (
        <div className="space-y-1.5">
          {renderLabel()}
          <Input type="time" value={value || ""} disabled={disabled}
            onChange={(e) => onChange?.(e.target.value)} />
          {renderDesc()}
        </div>
      );
    case "dropdown":
      return (
        <div className="space-y-1.5">
          {renderLabel()}
          <Select value={value || ""} onValueChange={(v) => onChange?.(v)} disabled={disabled}>
            <SelectTrigger><SelectValue placeholder={field.placeholder || "Select…"} /></SelectTrigger>
            <SelectContent>
              {(field.options || []).map((opt, i) => (
                <SelectItem key={i} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {renderDesc()}
        </div>
      );
    case "checkbox": {
      const arr = Array.isArray(value) ? value : [];
      const toggle = (opt) => {
        if (arr.includes(opt)) onChange?.(arr.filter((v) => v !== opt));
        else onChange?.([...arr, opt]);
      };
      return (
        <div className="space-y-2">
          {renderLabel()}
          <div className="space-y-2">
            {(field.options || []).map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <Checkbox checked={arr.includes(opt)} disabled={disabled} onCheckedChange={() => toggle(opt)} />
                {opt}
              </label>
            ))}
          </div>
          {renderDesc()}
        </div>
      );
    }
    case "radio":
      return (
        <div className="space-y-2">
          {renderLabel()}
          <RadioGroup value={value || ""} onValueChange={(v) => onChange?.(v)} disabled={disabled}>
            {(field.options || []).map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <RadioGroupItem value={opt} /> {opt}
              </label>
            ))}
          </RadioGroup>
          {renderDesc()}
        </div>
      );
    case "rating": {
      const v = Number(value || 0);
      return (
        <div className="space-y-1.5">
          {renderLabel()}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" disabled={disabled}
                onClick={() => onChange?.(n)} className="p-1">
                <Star className={`w-7 h-7 ${n <= v ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
              </button>
            ))}
          </div>
          {renderDesc()}
        </div>
      );
    }
    case "file":
      return (
        <FileField field={field} value={value} onChange={onChange} disabled={disabled} isPublic={isPublic}
                   renderLabel={renderLabel} renderDesc={renderDesc} />
      );
    case "heading":
      return <h3 className="text-xl font-heading font-bold tracking-tight text-slate-900 mt-2">{field.rich_text || field.label || "Heading"}</h3>;
    case "paragraph":
      return <p className="text-sm text-slate-600 leading-relaxed">{field.rich_text || field.label}</p>;
    case "divider":
      return <hr className="border-slate-200 my-2" />;
    default:
      return <div className="text-sm text-slate-400">Unknown field: {field.type}</div>;
  }
}

function FileField({ field, value, onChange, disabled, isPublic, renderLabel, renderDesc }) {
  const [busy, setBusy] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    setBusy(true);
    try {
      const r = await api.post(isPublic ? "/public/upload" : "/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onChange?.({ file_id: r.data.file_id, filename: r.data.filename, size: r.data.size, content_type: r.data.content_type });
      toast.success("File uploaded");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally { setBusy(false); }
  };
  return (
    <div className="space-y-1.5">
      {renderLabel()}
      {value?.file_id ? (
        <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-sm text-slate-700 truncate">{value.filename}</span>
          </div>
          <button type="button" disabled={disabled} onClick={() => onChange?.(null)} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      ) : (
        <label className={`flex items-center justify-center gap-2 h-24 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
          <Upload className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-500">{busy ? "Uploading…" : "Click to upload"}</span>
          <input type="file" className="hidden" onChange={handleFile} disabled={disabled || busy} />
        </label>
      )}
      {renderDesc()}
    </div>
  );
}
