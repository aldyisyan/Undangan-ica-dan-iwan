/**
 * Kit komponen bersama untuk halaman admin.
 * Menjaga konsistensi: judul panel, input, toggle, toast, dan status pill
 * dipakai ulang di semua tab supaya tampilan rapi & enak dipandang.
 */
import { type ReactNode } from "react";

/* ------------------------------------------------------------------ ICONS */

const PATHS: Record<string, ReactNode> = {
  stats: <><path d="M3 20h18" /><path d="M7 16V9" /><path d="M12 16V4" /><path d="M17 16v-6" /></>,
  settings: (
    <>
      <path d="M4 7h16M4 17h16" />
      <circle cx="9" cy="7" r="2.4" /><circle cx="15" cy="17" r="2.4" />
    </>
  ),
  media: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="M3 16.5l4.8-4.6 3.7 3.6 3-2.9L21 17" />
    </>
  ),
  sections: <><path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="2.6" /></>,
  gifts: (
    <>
      <path d="M3.5 11.5h17V20h-17z" /><path d="M3 7.5h18v4H3z" /><path d="M12 7.5V20" />
      <path d="M12 7.5C10.5 4 7 4 7 6s5 1.5 5 1.5zM12 7.5C13.5 4 17 4 17 6s-5 1.5-5 1.5z" />
    </>
  ),
  guests: (
    <>
      <circle cx="9.5" cy="8" r="3.4" />
      <path d="M3.5 19.5v-1.2A4.8 4.8 0 0 1 8.3 13.5h2.4a4.8 4.8 0 0 1 4.8 4.8v1.2" />
      <path d="M16.5 5.4a3.4 3.4 0 0 1 0 6.6M17.6 13.9a4.8 4.8 0 0 1 3 4.4v1.2" />
    </>
  ),
  wishes: <><rect x="3" y="5.5" width="18" height="13" rx="1.5" /><path d="M3.6 6.6L12 13l8.4-6.4" /></>,
  cloud: <><path d="M6.8 18.5h10.4a4.2 4.2 0 0 0 .6-8.35A6.2 6.2 0 0 0 6.2 9.4a4.6 4.6 0 0 0 .6 9.1z" /></>,
  danger: <><path d="M12 3.6L21 19.5H3z" /><path d="M12 9.5v4.6M12 16.7h.01" /></>,
};

export function TabIcon({ name, className = "h-4 w-4" }: { name: keyof typeof PATHS | string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name] ?? PATHS.stats}
    </svg>
  );
}

/* ------------------------------------------------------------------ PANEL */

export function Panel({
  title,
  desc,
  action,
  children,
  tone = "plain",
}: {
  title?: string;
  desc?: string;
  action?: ReactNode;
  children: ReactNode;
  tone?: "plain" | "muted" | "danger";
}) {
  const bg = tone === "muted" ? "bg-paper2/70" : tone === "danger" ? "bg-terra/[0.04]" : "bg-paper";
  const edge = tone === "danger" ? "border-terra/35" : "border-ink/15";
  return (
    <section className={`relative border ${edge} ${bg} px-5 py-6 sm:px-7 sm:py-7`}>
      {(title || action) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-ink/15 pb-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.26em] text-terra">{title}</h3>
            )}
            {desc && <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink/60">{desc}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/** Judul besar halaman tab */
export function TabHeading({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="font-hand text-[clamp(2rem,5vw,2.75rem)] leading-none text-ink">{title}</h2>
        {sub && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60">{sub}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

/* ----------------------------------------------------------------- FIELDS */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/75">{label}</label>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-[12px] leading-relaxed text-ink/45">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full border-b border-ink/25 bg-transparent py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-terra";

export function TextInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </Field>
  );
}

export function TextArea({
  label,
  hint,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} resize-none`}
      />
    </Field>
  );
}

/* ----------------------------------------------------------------- TOGGLE */

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-14 shrink-0 rounded-full border-2 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra ${
        checked ? "border-terra bg-terra" : "border-ink/30 bg-ink/10 hover:border-ink/45"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform duration-300 ${
          checked ? "translate-x-7" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/** Baris toggle dengan judul + deskripsi */
export function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4">
      <div className="min-w-0">
        <p className={`text-[15px] font-semibold ${checked ? "text-ink" : "text-ink/45"}`}>{title}</p>
        {desc && <p className="mt-0.5 text-[13px] leading-relaxed text-ink/55">{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

/* --------------------------------------------------------------- STATUS */

type Tone = "ok" | "warn" | "info" | "muted" | "bad";

const TONES: Record<Tone, string> = {
  ok: "border-sage/50 bg-sage/10 text-sage",
  warn: "border-terra/45 bg-terra/10 text-terra",
  info: "border-navy/40 bg-navy/10 text-navy",
  muted: "border-ink/20 bg-ink/[0.04] text-ink/55",
  bad: "border-terra/60 bg-terra/15 text-terra",
};

export function Pill({ tone = "muted", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap border px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function Toast({ msg, tone = "ok" }: { msg: string; tone?: Tone }) {
  if (!msg) return null;
  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-[80] max-w-[92vw] -translate-x-1/2 border px-5 py-3 text-sm shadow-xl ${
        tone === "bad" ? "border-terra bg-terra text-paper" : "border-ink bg-ink text-paper"
      }`}
    >
      <span className="font-note">{msg}</span>
    </div>
  );
}

export function EmptyState({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-ink/25 bg-paper2/60 px-6 py-10 text-center">
      <p className="font-hand text-2xl text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-ink/55">{desc}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/** Tombol bawaan admin */
export function Btn({
  children,
  onClick,
  tone = "ghost",
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "ghost" | "primary" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const cls =
    tone === "primary" ? "admin-btn-primary" : tone === "danger" ? "admin-btn-danger" : "admin-btn";
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
