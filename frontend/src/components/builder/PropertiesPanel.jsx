import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, X, Settings2 } from "lucide-react";

const TYPES_WITH_PLACEHOLDER = ["short_text", "long_text", "number", "email", "phone", "url"];
const TYPES_WITH_OPTIONS = ["dropdown", "checkbox", "radio"];
const TYPES_WITHOUT_LABEL = ["divider"];
const TYPES_DISPLAY = ["heading", "paragraph", "divider"];

export default function PropertiesPanel({ form, selectedId, onUpdate }) {
  const field = (form.fields || []).find((f) => f.id === selectedId);

  const update = (patch) => {
    onUpdate({ ...form, fields: form.fields.map((f) => f.id === selectedId ? { ...f, ...patch } : f) });
  };

  if (!field) {
    return (
      <aside className="w-80 shrink-0 border-l border-slate-200 bg-white overflow-y-auto nice-scroll">
        <div className="p-6">
          <div className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 mb-2">Properties</div>
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
              <Settings2 className="w-5 h-5" />
            </div>
            <p className="text-sm text-slate-500">Select a field to edit its properties.</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 shrink-0 border-l border-slate-200 bg-white overflow-y-auto nice-scroll">
      <div className="p-6 space-y-5" data-testid="properties-panel">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Properties</div>
          <div className="text-sm text-slate-400 mt-1">{field.type.replace("_", " ")}</div>
        </div>

        {TYPES_DISPLAY.includes(field.type) && field.type !== "divider" && (
          <div>
            <Label className="text-xs">Text</Label>
            <Textarea rows={3} value={field.rich_text || ""} onChange={(e) => update({ rich_text: e.target.value })}
                      data-testid="prop-rich-text" />
          </div>
        )}

        {!TYPES_WITHOUT_LABEL.includes(field.type) && !TYPES_DISPLAY.includes(field.type) && (
          <div>
            <Label className="text-xs">Label</Label>
            <Input value={field.label} onChange={(e) => update({ label: e.target.value })} data-testid="prop-label" />
          </div>
        )}

        {TYPES_WITH_PLACEHOLDER.includes(field.type) && (
          <div>
            <Label className="text-xs">Placeholder</Label>
            <Input value={field.placeholder || ""} onChange={(e) => update({ placeholder: e.target.value })} data-testid="prop-placeholder" />
          </div>
        )}

        {!TYPES_DISPLAY.includes(field.type) && (
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea rows={2} value={field.description || ""} onChange={(e) => update({ description: e.target.value })} data-testid="prop-description" />
          </div>
        )}

        {TYPES_WITH_OPTIONS.includes(field.type) && (
          <div>
            <Label className="text-xs">Options</Label>
            <div className="space-y-2 mt-1">
              {(field.options || []).map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={opt} onChange={(e) => {
                    const next = [...field.options]; next[i] = e.target.value; update({ options: next });
                  }} />
                  <Button type="button" variant="outline" size="icon" onClick={() => {
                    update({ options: field.options.filter((_, j) => j !== i) });
                  }}><X className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => {
                update({ options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] });
              }} data-testid="add-option">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add option
              </Button>
            </div>
          </div>
        )}

        {!TYPES_DISPLAY.includes(field.type) && (
          <>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <div className="text-sm font-medium text-slate-700">Required</div>
                <div className="text-xs text-slate-400">User must fill this field</div>
              </div>
              <Switch checked={!!field.required} onCheckedChange={(v) => update({ required: v })} data-testid="prop-required" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-700">Read-only</div>
                <div className="text-xs text-slate-400">Cannot be edited</div>
              </div>
              <Switch checked={!!field.read_only} onCheckedChange={(v) => update({ read_only: v })} />
            </div>
          </>
        )}

        {(field.type === "short_text" || field.type === "long_text") && (
          <div>
            <Label className="text-xs">Max character length</Label>
            <Input type="number" value={field.validation?.maxLength || ""} onChange={(e) => update({
              validation: { ...(field.validation || {}), maxLength: e.target.value ? Number(e.target.value) : undefined }
            })} />
          </div>
        )}

        {field.type === "number" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Min</Label>
              <Input type="number" value={field.validation?.min ?? ""} onChange={(e) => update({
                validation: { ...(field.validation || {}), min: e.target.value === "" ? undefined : Number(e.target.value) }
              })} />
            </div>
            <div>
              <Label className="text-xs">Max</Label>
              <Input type="number" value={field.validation?.max ?? ""} onChange={(e) => update({
                validation: { ...(field.validation || {}), max: e.target.value === "" ? undefined : Number(e.target.value) }
              })} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
