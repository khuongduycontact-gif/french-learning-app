"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AboutMethodItem, AboutPage, AboutReason, AboutTimelineItem } from "@/types";
import MediaUploader from "./MediaUploader";
import AboutIconPicker from "./AboutIconPicker";
import { useToast } from "./Toast";

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type FormState = Omit<AboutPage, "id" | "updatedAt">;

function toFormState(initial: AboutPage): FormState {
  const { id, updatedAt, ...rest } = initial;
  return rest;
}

// --- Khung chung cho 1 mục trong danh sách (thẻ có nút sắp xếp/xoá) ---
function ItemCard({
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
  children,
}: {
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-mist bg-white/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Mục #{index + 1}
        </p>
        <div className="flex items-center gap-3 text-xs font-medium">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="text-ink hover:underline disabled:opacity-30"
          >
            ↑ Lên
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="text-ink hover:underline disabled:opacity-30"
          >
            ↓ Xuống
          </button>
          <button type="button" onClick={onRemove} className="text-bordeaux hover:underline">
            Xoá
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
        />
      )}
    </div>
  );
}

export default function AboutForm({ initial }: { initial: AboutPage }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // --- Helpers dùng chung cho mọi mục danh sách (timeline, reasons, methods):
  // thêm / sửa / xoá / đổi thứ tự ---
  function addItem<K extends keyof FormState>(key: K, item: any) {
    setForm((prev) => ({ ...prev, [key]: [...(prev[key] as any[]), item] }));
  }
  function updateItem<K extends keyof FormState>(key: K, index: number, patch: any) {
    setForm((prev) => ({
      ...prev,
      [key]: (prev[key] as any[]).map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
  }
  function removeItem<K extends keyof FormState>(key: K, index: number) {
    setForm((prev) => ({
      ...prev,
      [key]: (prev[key] as any[]).filter((_, i) => i !== index),
    }));
  }
  function moveItem<K extends keyof FormState>(key: K, index: number, dir: -1 | 1) {
    setForm((prev) => {
      const list = [...(prev[key] as any[])];
      const target = index + dir;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, [key]: list };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Lưu thất bại, vui lòng thử lại.", "error");
        return;
      }
      showToast("Đã lưu trang Giới thiệu thành công!", "success");
      router.refresh();
    } catch {
      showToast("Lưu thất bại, vui lòng thử lại.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      {/* --- Hero --- */}
      <section className="flex flex-col gap-4 rounded-2xl border border-mist bg-white/40 p-5">
        <TextField label="Câu trích dẫn nhỏ" value={form.heroKicker} onChange={(v) => set("heroKicker", v)} />
        <TextField label="Tiêu đề lớn" value={form.heroTitle} onChange={(v) => set("heroTitle", v)} />
        <TextField label="Lời chào" value={form.heroGreeting} onChange={(v) => set("heroGreeting", v)} />
        <TextField
          label="Mô tả giới thiệu"
          value={form.heroDescription}
          onChange={(v) => set("heroDescription", v)}
          textarea
          rows={4}
        />
        <MediaUploader
          label="Ảnh chính"
          kind="image"
          value={form.heroImageUrl || ""}
          onChange={(url) => set("heroImageUrl", url || null)}
        />
      </section>

      {/* --- Hành trình của tôi --- */}
      <section className="flex flex-col gap-4 rounded-2xl border border-mist bg-white/40 p-5">
        <h2 className="font-display text-xl font-semibold text-ink">Hành trình của tôi</h2>
        <div className="flex flex-col gap-4">
          {form.timeline.map((item, i) => (
            <ItemCard
              key={item.id}
              index={i}
              total={form.timeline.length}
              onMoveUp={() => moveItem("timeline", i, -1)}
              onMoveDown={() => moveItem("timeline", i, 1)}
              onRemove={() => removeItem("timeline", i)}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Năm" value={item.year} onChange={(v) => updateItem("timeline", i, { year: v })} />
                <AboutIconPicker value={item.icon} onChange={(icon) => updateItem("timeline", i, { icon })} />
              </div>
              <TextField label="Tiêu đề" value={item.title} onChange={(v) => updateItem("timeline", i, { title: v })} />
              <TextField
                label="Mô tả"
                value={item.description}
                onChange={(v) => updateItem("timeline", i, { description: v })}
                textarea
              />
            </ItemCard>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            addItem<"timeline">("timeline", {
              id: randomId(),
              year: "",
              icon: "star",
              title: "",
              description: "",
            } satisfies AboutTimelineItem)
          }
          className="self-start rounded-full border border-dashed border-bordeaux/40 px-4 py-2 text-sm font-medium text-bordeaux hover:bg-bordeaux/5"
        >
          + Thêm mốc hành trình
        </button>
      </section>

      {/* --- Vì sao học cùng Céline --- */}
      <section className="flex flex-col gap-4 rounded-2xl border border-mist bg-white/40 p-5">
        <h2 className="font-display text-xl font-semibold text-ink">Vì sao học cùng Céline</h2>
        <div className="flex flex-col gap-4">
          {form.reasons.map((item, i) => (
            <ItemCard
              key={item.id}
              index={i}
              total={form.reasons.length}
              onMoveUp={() => moveItem("reasons", i, -1)}
              onMoveDown={() => moveItem("reasons", i, 1)}
              onRemove={() => removeItem("reasons", i)}
            >
              <AboutIconPicker value={item.icon} onChange={(icon) => updateItem("reasons", i, { icon })} />
              <TextField label="Tiêu đề" value={item.title} onChange={(v) => updateItem("reasons", i, { title: v })} />
              <TextField
                label="Mô tả"
                value={item.description}
                onChange={(v) => updateItem("reasons", i, { description: v })}
                textarea
              />
            </ItemCard>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            addItem<"reasons">("reasons", {
              id: randomId(),
              icon: "target",
              title: "",
              description: "",
            } satisfies AboutReason)
          }
          className="self-start rounded-full border border-dashed border-bordeaux/40 px-4 py-2 text-sm font-medium text-bordeaux hover:bg-bordeaux/5"
        >
          + Thêm lý do
        </button>
      </section>

      {/* --- Phương pháp giảng dạy --- */}
      <section className="flex flex-col gap-4 rounded-2xl border border-mist bg-white/40 p-5">
        <h2 className="font-display text-xl font-semibold text-ink">Phương pháp giảng dạy</h2>
        <TextField label="Tiêu đề mục" value={form.methodTitle} onChange={(v) => set("methodTitle", v)} />
        <MediaUploader
          label="Ảnh minh hoạ"
          kind="image"
          value={form.methodImageUrl || ""}
          onChange={(url) => set("methodImageUrl", url || null)}
        />
        <div className="flex flex-col gap-4">
          {form.methods.map((item, i) => (
            <ItemCard
              key={item.id}
              index={i}
              total={form.methods.length}
              onMoveUp={() => moveItem("methods", i, -1)}
              onMoveDown={() => moveItem("methods", i, 1)}
              onRemove={() => removeItem("methods", i)}
            >
              <TextField label="Tiêu đề" value={item.title} onChange={(v) => updateItem("methods", i, { title: v })} />
              <TextField
                label="Mô tả"
                value={item.description}
                onChange={(v) => updateItem("methods", i, { description: v })}
                textarea
              />
            </ItemCard>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            addItem<"methods">("methods", {
              id: randomId(),
              title: "",
              description: "",
            } satisfies AboutMethodItem)
          }
          className="self-start rounded-full border border-dashed border-bordeaux/40 px-4 py-2 text-sm font-medium text-bordeaux hover:bg-bordeaux/5"
        >
          + Thêm phương pháp
        </button>
      </section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-bordeaux px-8 py-3 text-sm font-semibold text-parchment shadow-lg transition hover:bg-bordeaux/90 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : "Lưu trang Giới thiệu"}
        </button>
      </div>
    </form>
  );
}
