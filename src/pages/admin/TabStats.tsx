/**
 * Tab Statistik: ringkasan ucapan RSVP + dashboard tamu
 */
import { useWishes } from "../../lib/wishes";
import { useGuestBook } from "../../lib/guestBook";
import { pullFromCloud } from "../../lib/cloud";
import { getCloudRead } from "../../lib/cloudConfig";
import { useState } from "react";

export default function TabStats() {
  const wishes = useWishes();
  const guests = useGuestBook();
  const [pulling, setPulling] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const refresh = async () => {
    if (!getCloudRead()) { showToast("Tidak terhubung ke cloud."); return; }
    setPulling(true);
    await pullFromCloud();
    setPulling(false);
    showToast("✓ Data diperbarui.");
  };

  const hadir = wishes.filter((w) => w.attend === "hadir");
  const ragu = wishes.filter((w) => w.attend === "ragu");
  const tidak = wishes.filter((w) => w.attend === "tidak");
  const totalHadir = hadir.reduce((s, w) => s + (w.count ?? 1), 0);
  const sentGuests = guests.filter((g) => g.sentAt).length;

  const StatCard = ({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color: string }) => (
    <div className={`relative bg-paper p-5 border-l-4 ${color}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink/60">{label}</p>
      <p className="mt-1 font-hand text-5xl leading-none text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink/50">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-hand text-4xl text-ink">Statistik & Dashboard</h2>
          <p className="mt-1 text-sm text-ink/60">Ringkasan data RSVP dan pengiriman undangan.</p>
        </div>
        <button type="button" onClick={refresh} disabled={pulling} className="admin-btn">
          {pulling ? "Memperbarui…" : "⟳ Refresh dari Cloud"}
        </button>
      </div>

      {toast && <p className="text-sm text-green-700">{toast}</p>}

      {/* grid statistik ucapan */}
      <div>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-terra">RSVP & Ucapan</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Ucapan" value={wishes.length} color="border-navy" />
          <StatCard label="Konfirmasi Hadir" value={hadir.length} sub={`≈ ${totalHadir} orang`} color="border-terra" />
          <StatCard label="InsyaAllah/Ragu" value={ragu.length} color="border-navy/40" />
          <StatCard label="Berhalangan" value={tidak.length} color="border-ink/30" />
        </div>
      </div>

      {/* perkiraan tamu */}
      <div className="relative bg-paper2 px-6 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/70">Perkiraan Total Kehadiran</p>
        <div className="mt-3 flex items-end gap-3">
          <span className="font-hand text-7xl leading-none text-terra">{totalHadir}</span>
          <span className="mb-2 text-sm text-ink/60">orang dari {hadir.length} responden "Hadir"</span>
        </div>
        {/* progress bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink/10">
          <div className="h-full bg-terra transition-all duration-700" style={{ width: wishes.length ? `${Math.round((hadir.length / wishes.length) * 100)}%` : "0%" }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink/50">
          <span>{wishes.length ? Math.round((hadir.length / wishes.length) * 100) : 0}% konfirmasi hadir</span>
          <span>{wishes.length} total respons</span>
        </div>
      </div>

      {/* grid statistik tamu */}
      <div>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-terra">Pengiriman Undangan</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Total Tamu" value={guests.length} color="border-navy" />
          <StatCard label="Undangan Terkirim" value={sentGuests} sub={guests.length ? `${Math.round((sentGuests / guests.length) * 100)}% dari daftar` : ""} color="border-terra" />
          <StatCard label="Belum Dikirim" value={guests.length - sentGuests} color="border-ink/30" />
        </div>
      </div>

      {/* progress pengiriman */}
      {guests.length > 0 && (
        <div className="relative bg-paper2 px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/70">Progress Pengiriman</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink/10">
            <div className="h-full bg-navy transition-all duration-700" style={{ width: `${Math.round((sentGuests / guests.length) * 100)}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-ink/50">
            <span>{Math.round((sentGuests / guests.length) * 100)}% terkirim</span>
            <span>{guests.length - sentGuests} belum dikirim</span>
          </div>
        </div>
      )}

      {/* tamu yang belum konfirmasi */}
      {sentGuests > 0 && hadir.length < sentGuests && (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/70">Tamu yang Belum Respons</p>
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {guests
              .filter((g) => g.sentAt && !wishes.find((w) => w.name.toLowerCase().includes(g.name.toLowerCase())))
              .map((g) => (
                <div key={g.id} className="flex items-center justify-between gap-3 border border-dashed border-ink/15 bg-paper px-4 py-2.5">
                  <p className="text-sm text-ink">{g.name}</p>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/40">Belum respons</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
