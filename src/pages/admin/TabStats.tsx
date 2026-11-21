/**
 * Tab Statistik — dashboard satu layar:
 * ringkasan RSVP, pengiriman undangan, ucapan terbaru, dan pintasan cepat.
 */
import { useState } from "react";
import { useWishes } from "../../lib/wishes";
import { useGuestBook } from "../../lib/guestBook";
import { pullFromCloud } from "../../lib/cloud";
import { getCloudAdmin, getCloudRead } from "../../lib/cloudConfig";
import { Btn, EmptyState, Panel, Pill, TabHeading, TabIcon, Toast } from "./ui";

export default function TabStats({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const wishes = useWishes();
  const guests = useGuestBook();
  const [pulling, setPulling] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const refresh = async () => {
    if (!getCloudRead()) { showToast("Belum terhubung ke cloud."); return; }
    setPulling(true);
    await pullFromCloud();
    setPulling(false);
    showToast("✓ Data diperbarui dari cloud.");
  };

  const hadir = wishes.filter((w) => w.attend === "hadir");
  const ragu = wishes.filter((w) => w.attend === "ragu");
  const tidak = wishes.filter((w) => w.attend === "tidak");
  const totalHadir = hadir.reduce((s, w) => s + (w.count ?? 1), 0);
  const sentGuests = guests.filter((g) => g.sentAt).length;
  const noResponse = guests.filter(
    (g) => g.sentAt && !wishes.find((w) => w.name.toLowerCase().includes(g.name.toLowerCase()))
  );
  const pct = wishes.length ? Math.round((hadir.length / wishes.length) * 100) : 0;
  const cloudReady = !!getCloudAdmin();

  const Metric = ({
    label,
    value,
    sub,
    tone = "navy",
  }: {
    label: string;
    value: number | string;
    sub?: string;
    tone?: "navy" | "terra" | "ink";
  }) => {
    const bar =
      tone === "terra" ? "bg-terra" : tone === "ink" ? "bg-ink/40" : "bg-navy";
    return (
      <div className="relative bg-paper px-4 py-4">
        <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-ink/55">{label}</p>
        <p className="mt-1 font-hand text-[2.75rem] leading-none text-ink tabular">{value}</p>
        {sub && <p className="mt-1 text-[11.5px] text-ink/50">{sub}</p>}
      </div>
    );
  };

  const quick = [
    { id: "media", label: "Upload foto / musik" },
    { id: "settings", label: "Ubah tanggal & tempat" },
    { id: "guests", label: "Kirim undangan WA" },
    { id: "cloud", label: "Hubungkan Supabase" },
  ];

  return (
    <div className="space-y-8">
      <TabHeading
        title="Statistik & Dashboard"
        sub="Semua yang terjadi di undangan — RSVP, ucapan, dan pengiriman undangan — dalam satu layar."
        action={
          <Btn onClick={refresh} disabled={pulling}>
            {pulling ? "Memperbarui…" : "⟳ Refresh dari Cloud"}
          </Btn>
        }
      />

      <Toast msg={toast} />

      {/* ── peringatan cloud ── */}
      {!cloudReady && (
        <Panel tone="danger" title="Cloud belum terhubung">
          <p className="text-[14px] leading-relaxed text-ink/70">
            Foto dan pengaturan yang Anda ubah <strong>hanya tersimpan di perangkat ini</strong>.
            Tamu yang membuka undangan dari HP lain tidak akan melihat perubahan tersebut.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn tone="primary" onClick={() => onNavigate?.("cloud")}>Hubungkan Supabase</Btn>
            <Btn onClick={() => onNavigate?.("media")}>Upload Media</Btn>
          </div>
        </Panel>
      )}

      {/* ── metrik RSVP ── */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-terra">RSVP &amp; Ucapan</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Total Ucapan" value={wishes.length} />
          <Metric label="Konfirmasi Hadir" value={hadir.length} sub={`≈ ${totalHadir} orang`} tone="terra" />
          <Metric label="Masih Ragu" value={ragu.length} />
          <Metric label="Berhalangan" value={tidak.length} tone="ink" />
        </div>
      </div>

      {/* ── perkiraan kehadiran ── */}
      <Panel tone="muted" title="Perkiraan Total Kehadiran">
        <div className="flex flex-wrap items-end gap-4">
          <span className="font-hand text-[4.5rem] leading-[0.8] text-terra tabular">{totalHadir}</span>
          <span className="mb-2 text-sm text-ink/60">
            orang &middot; dari {hadir.length} responden &ldquo;Hadir&rdquo;
          </span>
        </div>
        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-terra transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink/50">
          <span>{pct}% konfirmasi hadir</span>
          <span>{wishes.length} total respons</span>
        </div>
      </Panel>

      {/* ── pengiriman undangan ── */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-terra">Pengiriman Undangan</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Total Tamu" value={guests.length} />
          <Metric
            label="Undangan Terkirim"
            value={sentGuests}
            sub={guests.length ? `${Math.round((sentGuests / guests.length) * 100)}% dari daftar` : ""}
            tone="terra"
          />
          <Metric label="Belum Dikirim" value={guests.length - sentGuests} tone="ink" />
        </div>

        {guests.length > 0 && (
          <div className="mt-3 bg-paper px-5 py-4">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
              <div
                className="h-full rounded-full bg-navy transition-all duration-700"
                style={{ width: `${Math.round((sentGuests / guests.length) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-ink/50">
              <span>{Math.round((sentGuests / guests.length) * 100)}% terkirim</span>
              <span>{guests.length - sentGuests} belum dikirim</span>
            </div>
          </div>
        )}
      </div>

      {/* ── dua kolom: ucapan terbaru + belum respons ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Ucapan Terbaru"
          desc="Tiga ucapan RSVP yang paling baru masuk."
          action={<Btn onClick={() => onNavigate?.("wishes")}>Lihat semua</Btn>}
        >
          {wishes.length === 0 ? (
            <EmptyState
              title="Belum ada ucapan"
              desc="Ucapan dari tamu akan muncul di sini setelah mereka mengisi form RSVP."
            />
          ) : (
            <ul className="space-y-3">
              {wishes.slice(0, 3).map((w, i) => (
                <li key={`${w.name}-${i}`} className="border-l-2 border-terra/50 pl-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[15px] font-semibold text-ink">{w.name}</p>
                    <Pill tone={w.attend === "hadir" ? "ok" : w.attend === "ragu" ? "info" : "muted"}>
                      {w.attend === "hadir" ? "Hadir" : w.attend === "ragu" ? "Ragu" : "Tidak"}
                      {w.count ? ` · ${w.count}` : ""}
                    </Pill>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink/60">{w.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Tamu Belum Respons" desc="Daftar tamu yang undangannya sudah terkirim namun belum mengisi RSVP.">
          {noResponse.length === 0 ? (
            <EmptyState
              title={guests.length === 0 ? "Daftar tamu kosong" : "Semua tamu sudah merespons 🎉"}
              desc={
                guests.length === 0
                  ? "Tambahkan tamu di tab Daftar Tamu untuk membuat tautan undangan personal."
                  : "Tidak ada tindakan lanjutan yang diperlukan."
              }
              action={
                guests.length === 0 ? (
                  <Btn tone="primary" onClick={() => onNavigate?.("guests")}>Tambah Tamu</Btn>
                ) : undefined
              }
            />
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {noResponse.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-3 border border-dashed border-ink/20 bg-paper2/60 px-4 py-2.5"
                >
                  <p className="truncate text-sm text-ink">{g.name}</p>
                  <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.14em] text-terra/70">
                    Belum respons
                  </span>
                </li>
              ))}
            </ul>
          )}
          {noResponse.length > 0 && (
            <div className="mt-4">
              <Btn onClick={() => onNavigate?.("guests")}>Buka Daftar Tamu</Btn>
            </div>
          )}
        </Panel>
      </div>

      {/* ── pintasan cepat ── */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-terra">Pintasan Cepat</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quick.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => onNavigate?.(q.id)}
              className="group flex flex-col items-start gap-2.5 border border-ink/15 bg-paper px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-terra"
            >
              <TabIcon
                name={q.id}
                className="mt-0.5 h-5 w-5 shrink-0 text-terra/70 transition-colors group-hover:text-terra"
              />
              <p className="text-[13px] font-semibold leading-snug text-ink group-hover:text-terra">
                {q.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
