import { type FormEvent, useRef, useState } from "react";
import { useGuestBook, addGuest, removeGuest, markSent, clearGuestBook, getWaTemplate, saveWaTemplate, buildInviteLink, buildWaUrl, renderWaMessage, normalizeWaPhone, DEFAULT_WA_TEMPLATE } from "../../lib/guestBook";
import { getCloudAdmin } from "../../lib/cloudConfig";
import { pushGuestBookToCloud, pullFromCloud } from "../../lib/cloud";
import { useAdminConfig } from "../../lib/adminSettings";
import * as XLSX from "xlsx";

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

  const pushCloud = async (list = guests) => {
    const admin = getCloudAdmin();
    if (admin) await pushGuestBookToCloud(admin, list);
  };

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addGuest(name, phone);
    setName(""); setPhone("");
    await pushCloud();
  };

  const del = async (id: string) => {
    removeGuest(id);
    await pushCloud(guests.filter((g) => g.id !== id));
  };

  const send = (g: Parameters<typeof buildInviteLink>[0]) => {
    const link = buildInviteLink(g);
    const msg = renderWaMessage(tpl, {
      nama: g,
      mempelai: `${cfg.groomNick} & ${cfg.brideNick}`,
      tanggal: cfg.weddingDateLabel,
      lokasi: `${cfg.venue}, ${cfg.address}`,
      link,
    });
    const url = buildWaUrl(guests.find((x) => x.name === g)?.phone || "", msg);
    window.open(url, "_blank");
    const found = guests.find((x) => x.name === g);
    if (found) { markSent(found.id); pushCloud(); }
  };

  const pull = async () => {
    setPulling(true);
    await pullFromCloud();
    setPulling(false);
    showToast("✓ Tamu ditarik dari cloud.");
  };

  const clear = async () => {
    if (!confirm("Hapus semua tamu?")) return;
    clearGuestBook();
    await pushCloud([]);
  };

  const exportXlsx = () => {
    const rows = guests.map((g) => ({
      Nama: g.name,
      "No. WA": g.phone || "-",
      "Link Undangan": buildInviteLink(g.name),
      "Dikirim": g.sentAt ? new Date(g.sentAt).toLocaleString("id-ID") : "Belum",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tamu");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ "Contoh format": "628123456789" }]), "Format HP");
    XLSX.writeFile(wb, `tamu-undangan-${cfg.groomNick}-${cfg.brideNick}.xlsx`);
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
          <button type="button" onClick={clear} className="admin-btn-danger">Hapus Semua</button>
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) importXlsx(e.target.files[0]); e.target.value = ""; }} />
      </div>

      {toast && <p className="text-sm text-green-700">{toast}</p>}

      {/* form tambah tamu */}
      <form onSubmit={add} className="flex flex-wrap gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Tamu"
          className="min-w-0 flex-1 border-b border-ink/25 bg-transparent py-2.5 text-sm text-ink outline-none focus:border-terra" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="No. WA (opsional)"
          className="w-44 border-b border-ink/25 bg-transparent py-2.5 font-mono text-sm text-ink outline-none focus:border-terra" />
        <button type="submit" className="admin-btn-primary shrink-0">+ Tambah</button>
      </form>

      {/* search */}
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama tamu…"
        className="w-full border-b border-ink/25 bg-transparent py-2.5 text-sm text-ink outline-none focus:border-terra" />

      {/* daftar */}
      <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
        {filtered.length === 0 && <p className="text-sm text-ink/50">Belum ada tamu.</p>}
        {filtered.map((g) => {
          const link = buildInviteLink(g.name);
          return (
            <div key={g.id} className="flex flex-wrap items-center gap-3 border border-dashed border-ink/20 bg-paper px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{g.name}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-ink/50">{link}</p>
                {g.phone && <p className="text-[11px] text-ink/50">WA: {normalizeWaPhone(g.phone)}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {g.sentAt && <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-green-700">Terkirim</span>}
                <button type="button" onClick={() => { navigator.clipboard.writeText(link); showToast("Link disalin!"); }}
                  className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy hover:text-terra">Salin Link</button>
                <button type="button" onClick={() => send(g.name)}
                  className="text-[10px] font-semibold uppercase tracking-[0.14em] text-terra hover:underline">Kirim WA</button>
                <button type="button" onClick={() => del(g.id)}
                  className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40 hover:text-terra">Hapus</button>
              </div>
            </div>
          );
        })}
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
