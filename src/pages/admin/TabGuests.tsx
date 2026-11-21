import { type FormEvent, useRef, useState } from "react";
import {
  useGuestBook, addGuest, removeGuest, markSent, clearGuestBook, loadGuestBook,
  getWaTemplate, saveWaTemplate, buildInviteLink, buildWaUrl, renderWaMessage,
  normalizeWaPhone, DEFAULT_WA_TEMPLATE, setGuestEvents, type InviteGuest,
} from "../../lib/guestBook";
import { getCloudAdmin } from "../../lib/cloudConfig";
import { pushGuestBookToCloud, pullFromCloud } from "../../lib/cloud";
import { useAdminConfig, saveAdminConfig } from "../../lib/adminSettings";
import { buildEventParams } from "../../lib/eventVisibility";
import * as XLSX from "xlsx";

/* ---- badge warna ---- */
const EvBadge = ({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick}
    className={`rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] transition-all ${on ? "border-terra bg-terra text-paper" : "border-ink/20 bg-ink/5 text-ink/50 line-through"}`}>
    {label}
  </button>
);

/* ---- baris tamu dengan pengaturan visibilitas ---- */
function GuestRow({ g, cfg, onDelete, onSend, onCopy, showToast, pushCloud }: {
  g: InviteGuest;
  cfg: ReturnType<typeof useAdminConfig>;
  onDelete: () => void;
  onSend: () => void;
  onCopy: (link: string) => void;
  showToast: (m: string) => void;
  pushCloud: (list?: InviteGuest[]) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);

  /* resolve visibilitas: pakai override tamu jika ada, else global */
  const showAkad = g.events?.showAkad ?? cfg.globalShowAkad;
  const showResepsi = g.events?.showResepsi ?? cfg.globalShowResepsi;

  const toggleAkad = async () => {
    const next = setGuestEvents(g.id, { showAkad: !showAkad, showResepsi });
    await pushCloud(next);
  };
  const toggleResepsi = async () => {
    const next = setGuestEvents(g.id, { showAkad, showResepsi: !showResepsi });
    await pushCloud(next);
  };
  const resetEvents = async () => {
    const next = setGuestEvents(g.id, { showAkad: cfg.globalShowAkad, showResepsi: cfg.globalShowResepsi });
    await pushCloud(next);
    showToast("Visibilitas direset ke default global.");
  };

  const ep = buildEventParams(showAkad, showResepsi);
  const link = buildInviteLink(g.name, ep || undefined);
  const hasOverride = g.events !== undefined;

  return (
    <div className="border border-dashed border-ink/20 bg-paper">
      {/* baris utama */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-ink">{g.name}</p>
            {/* badge acara */}
            <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] ${showAkad ? "bg-navy/15 text-navy" : "bg-ink/8 text-ink/35 line-through"}`}>Akad</span>
            <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] ${showResepsi ? "bg-terra/15 text-terra" : "bg-ink/8 text-ink/35 line-through"}`}>Resepsi</span>
            {hasOverride && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-amber-700">Override</span>}
          </div>
          <p className="mt-0.5 truncate font-mono text-[10px] text-ink/40">{link}</p>
          {g.phone && <p className="text-[10px] text-ink/40">WA: {normalizeWaPhone(g.phone)}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {g.sentAt && <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/70">✓ Terkirim</span>}
          <button type="button" onClick={() => setExpanded((e) => !e)}
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/60 hover:text-terra">
            {expanded ? "▲ Tutup" : "⚙ Acara"}
          </button>
          <button type="button" onClick={() => onCopy(link)}
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy hover:text-terra">Salin</button>
          <button type="button" onClick={onSend}
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-terra hover:underline">Kirim WA</button>
          <button type="button" onClick={onDelete}
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/35 hover:text-terra">Hapus</button>
        </div>
      </div>

      {/* panel visibilitas per tamu */}
      {expanded && (
        <div className="border-t border-dashed border-ink/15 bg-paper2/60 px-4 py-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-navy/70">Acara yang tampil untuk {g.name}</p>
          <p className="mt-1 text-[11px] text-ink/55">
            Override setting global — hanya berlaku untuk link tamu ini.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <EvBadge label="Akad Nikah" on={showAkad} onClick={toggleAkad} />
            <EvBadge label="Resepsi" on={showResepsi} onClick={toggleResepsi} />
            {hasOverride && (
              <button type="button" onClick={resetEvents}
                className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40 hover:text-terra">
                ↺ Reset ke Global
              </button>
            )}
          </div>
          <div className="mt-3 rounded bg-paper px-3 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-navy/60">Link tamu ini:</p>
            <p className="mt-1 break-all font-mono text-[10px] text-ink/60">{link}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================ */
export default function TabGuests() {
  const guests = useGuestBook();
  const cfg = useAdminConfig();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [pulling, setPulling] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);
  const [tpl, setTpl] = useState(getWaTemplate());
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3200); };

  const pushCloud = async (list?: InviteGuest[]) => {
    const admin = getCloudAdmin();
    if (admin) await pushGuestBookToCloud(admin, list ?? loadGuestBook());
  };

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addGuest(name, phone);
    setName("");
    setPhone("");
    await pushCloud(loadGuestBook());
  };

  const del = async (id: string) => {
    const next = removeGuest(id);
    await pushCloud(next);
  };

  const send = async (g: InviteGuest) => {
    const ep = buildEventParams(
      g.events?.showAkad ?? cfg.globalShowAkad,
      g.events?.showResepsi ?? cfg.globalShowResepsi,
    );
    const link = buildInviteLink(g.name, ep || undefined);
    const msg = renderWaMessage(tpl, {
      nama: g.name,
      mempelai: `${cfg.groomNick} & ${cfg.brideNick}`,
      tanggal: cfg.weddingDateLabel,
      lokasi: `${cfg.venue}, ${cfg.address}`,
      link,
    });
    const url = buildWaUrl(g.phone || "", msg);
    window.open(url, "_blank");
    const next = markSent(g.id);
    await pushCloud(next);
  };

  const pull = async () => {
    setPulling(true);
    await pullFromCloud();
    setPulling(false);
    showToast("✓ Tamu ditarik dari cloud.");
  };

  const exportXlsx = () => {
    const rows = guests.map((g) => {
      const ep = buildEventParams(
        g.events?.showAkad ?? cfg.globalShowAkad,
        g.events?.showResepsi ?? cfg.globalShowResepsi,
      );
      return {
        Nama: g.name,
        "No. WA": g.phone || "-",
        "Link Undangan": buildInviteLink(g.name, ep || undefined),
        "Akad": (g.events?.showAkad ?? cfg.globalShowAkad) ? "Tampil" : "Disembunyikan",
        "Resepsi": (g.events?.showResepsi ?? cfg.globalShowResepsi) ? "Tampil" : "Disembunyikan",
        "Dikirim": g.sentAt ? new Date(g.sentAt).toLocaleString("id-ID") : "Belum",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tamu");
    XLSX.writeFile(wb, `tamu-${cfg.groomNick}-${cfg.brideNick}.xlsx`);
  };

  const importXlsx = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<{ Nama?: string; nama?: string; "No. WA"?: string; phone?: string }>(ws);
      let count = 0;
      for (const r of rows) {
        const n = r.Nama || r.nama || "";
        const p = r["No. WA"] || r.phone || "";
        if (n) { addGuest(String(n), String(p)); count++; }
      }
      await pushCloud();
      showToast(`✓ ${count} tamu berhasil diimpor.`);
    };
    reader.readAsArrayBuffer(file);
  };

  const filtered = guests.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
  const sent = guests.filter((g) => g.sentAt).length;

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-hand text-4xl text-ink">Daftar Tamu & Kirim Undangan</h2>
          <p className="mt-1 text-sm text-ink/60">{guests.length} tamu · {sent} undangan terkirim</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setTplOpen(true)} className="admin-btn">Template WA</button>
          <button type="button" onClick={exportXlsx} className="admin-btn">⬇ Export XLSX</button>
          <button type="button" onClick={() => fileRef.current?.click()} className="admin-btn">⬆ Import XLSX</button>
          <button type="button" onClick={pull} disabled={pulling} className="admin-btn">{pulling ? "…" : "⬇ Pull Cloud"}</button>
          <button type="button" onClick={async () => { if (!confirm("Hapus semua?")) return; const next = clearGuestBook(); await pushCloud(next); }} className="admin-btn-danger">Hapus Semua</button>
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) importXlsx(e.target.files[0]); e.target.value = ""; }} />
      </div>

      {toast && (
        <p className="border border-sage/50 bg-sage/10 px-4 py-2.5 text-sm text-ink">{toast}</p>
      )}

      {/* ───── Setting global visibilitas acara ───── */}
      <div className="border border-dashed border-navy/30 bg-navy/5 px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/70">Default Visibilitas Acara (Global)</p>
        <p className="mt-1.5 text-[13px] text-ink/60 leading-relaxed">
          Ini berlaku untuk semua tamu yang tidak diatur secara individual. Bisa di-override per tamu dengan menekan ikon ⚙ di baris tamu.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-3">
            <button type="button" onClick={() => saveAdminConfig({ globalShowAkad: !cfg.globalShowAkad })}
              role="switch" aria-checked={cfg.globalShowAkad}
              className={`relative h-6 w-12 rounded-full border-2 transition-all ${cfg.globalShowAkad ? "border-navy bg-navy" : "border-ink/30 bg-ink/10"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper shadow transition-transform ${cfg.globalShowAkad ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm font-semibold text-ink">Tampilkan Akad Nikah</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <button type="button" onClick={() => saveAdminConfig({ globalShowResepsi: !cfg.globalShowResepsi })}
              role="switch" aria-checked={cfg.globalShowResepsi}
              className={`relative h-6 w-12 rounded-full border-2 transition-all ${cfg.globalShowResepsi ? "border-terra bg-terra" : "border-ink/30 bg-ink/10"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper shadow transition-transform ${cfg.globalShowResepsi ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm font-semibold text-ink">Tampilkan Resepsi</span>
          </label>
        </div>
        {(!cfg.globalShowAkad || !cfg.globalShowResepsi) && (
          <p className="mt-3 text-[11px] text-terra">
            ⚠ Acara yang dimatikan secara global akan tersembunyi untuk semua tamu (kecuali yang dioverride secara individual).
          </p>
        )}
      </div>

      {/* form tambah tamu */}
      <form onSubmit={add} className="flex flex-wrap gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Tamu"
          className="min-w-0 flex-1 border-b border-ink/25 bg-transparent py-2.5 text-sm text-ink outline-none focus:border-terra" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="No. WA (opsional)"
          className="w-44 border-b border-ink/25 bg-transparent py-2.5 font-mono text-sm text-ink outline-none focus:border-terra" />
        <button type="submit" className="admin-btn-primary shrink-0">+ Tambah</button>
      </form>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama tamu…"
        className="w-full border-b border-ink/25 bg-transparent py-2.5 text-sm text-ink outline-none focus:border-terra" />

      {/* daftar tamu */}
      <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
        {filtered.length === 0 && <p className="text-sm text-ink/50">Belum ada tamu.</p>}
        {filtered.map((g) => (
          <GuestRow
            key={g.id}
            g={g}
            cfg={cfg}
            onDelete={() => del(g.id)}
            onSend={() => send(g)}
            onCopy={(link) => { navigator.clipboard.writeText(link).catch(() => {}); showToast("Link disalin!"); }}
            showToast={showToast}
            pushCloud={pushCloud}
          />
        ))}
      </div>

      {/* modal template WA */}
      {tplOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4" onClick={() => setTplOpen(false)}>
          <div className="relative w-full max-w-lg bg-paper p-7" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-hand text-3xl text-ink">Template Pesan WhatsApp</h3>
            <p className="mt-1 text-xs text-ink/55">Placeholder: {"{nama}"} {"{mempelai}"} {"{tanggal}"} {"{lokasi}"} {"{link}"}</p>
            <textarea value={tpl} onChange={(e) => setTpl(e.target.value)} rows={12}
              className="mt-4 w-full resize-none border border-ink/25 bg-transparent p-3 font-mono text-sm text-ink outline-none focus:border-terra" />
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={() => { saveWaTemplate(tpl); setTplOpen(false); showToast("Template disimpan."); }} className="admin-btn-primary">Simpan</button>
              <button type="button" onClick={() => { setTpl(DEFAULT_WA_TEMPLATE); saveWaTemplate(DEFAULT_WA_TEMPLATE); }} className="admin-btn">Reset</button>
              <button type="button" onClick={() => setTplOpen(false)} className="admin-btn">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
