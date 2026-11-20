/**
 * Zona Berbahaya: reset pengaturan, hapus semua data lokal
 */
import { useState } from "react";
import { resetAdminConfig } from "../../lib/adminSettings";
import { clearMedia } from "../../lib/mediaStore";
import { wipeWishes } from "../../lib/wishes";
import { clearGuestBook } from "../../lib/guestBook";
import { clearCloudAdmin } from "../../lib/cloudConfig";

export default function TabDanger() {
  const [confirmText, setConfirmText] = useState("");
  const [done, setDone] = useState(false);

  const doReset = async () => {
    if (confirmText !== "RESET") return;
    await clearMedia();
    wipeWishes();
    clearGuestBook();
    clearCloudAdmin();
    resetAdminConfig();
    sessionStorage.removeItem("admin-auth");
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <svg viewBox="0 0 24 24" className="h-16 w-16 text-terra" fill="none">
          <path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="font-hand text-4xl text-ink">Reset selesai.</p>
        <p className="text-sm text-ink/60">Semua data lokal telah dihapus. Halaman akan dimuat ulang.</p>
        <button type="button" onClick={() => window.location.reload()} className="admin-btn-primary">Muat Ulang Halaman</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-hand text-4xl text-ink">Zona Berbahaya</h2>
        <p className="mt-1 text-sm text-ink/60">Tindakan di sini tidak dapat dibatalkan. Lanjutkan dengan hati-hati.</p>
      </div>

      <div className="space-y-5">
        {/* reset total */}
        <div className="border border-terra/40 bg-terra/5 p-6">
          <h3 className="font-semibold text-terra">Reset Total Perangkat Ini</h3>
          <p className="mt-2 text-sm text-ink/70 leading-relaxed">
            Menghapus seluruh pengaturan, foto & audio yang diupload, semua ucapan tamu, daftar tamu, dan konfigurasi cloud
            dari <strong>perangkat ini saja</strong>. Data yang sudah di-push ke Supabase tidak akan terhapus dari server.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink/60">
            <li>Semua pengaturan → kembali ke bawaan</li>
            <li>Foto & audio di IndexedDB → dihapus</li>
            <li>Ucapan tamu lokal → dihapus</li>
            <li>Daftar tamu lokal → dihapus</li>
            <li>Config cloud → dihapus (perlu setup ulang)</li>
          </ul>

          <div className="mt-6 space-y-3">
            <label className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-terra">
              Ketik RESET untuk konfirmasi
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="RESET"
              className="w-48 border-b-2 border-terra bg-transparent py-2.5 text-center font-mono text-sm uppercase text-terra outline-none tracking-[0.3em]"
            />
            <div>
              <button
                type="button"
                onClick={doReset}
                disabled={confirmText !== "RESET"}
                className={`inline-flex items-center gap-2 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all ${confirmText === "RESET" ? "bg-terra text-paper hover:-translate-y-0.5" : "cursor-not-allowed bg-ink/20 text-ink/40"}`}
              >
                Reset Semua Data Lokal
              </button>
            </div>
          </div>
        </div>

        {/* reset ucapan saja */}
        <div className="border border-dashed border-ink/25 bg-paper p-6">
          <h3 className="font-semibold text-ink">Hapus Semua Ucapan Saja</h3>
          <p className="mt-1 text-sm text-ink/60">Hanya ucapan/RSVP yang dihapus. Pengaturan lain tetap.</p>
          <button type="button" onClick={() => { if (confirm("Hapus semua ucapan?")) wipeWishes(); }}
            className="mt-4 admin-btn-danger">Hapus Ucapan</button>
        </div>

        {/* reset daftar tamu saja */}
        <div className="border border-dashed border-ink/25 bg-paper p-6">
          <h3 className="font-semibold text-ink">Hapus Daftar Tamu Saja</h3>
          <p className="mt-1 text-sm text-ink/60">Hanya daftar tamu & riwayat pengiriman yang dihapus.</p>
          <button type="button" onClick={() => { if (confirm("Hapus semua daftar tamu?")) clearGuestBook(); }}
            className="mt-4 admin-btn-danger">Hapus Daftar Tamu</button>
        </div>

        {/* disconnect cloud */}
        <div className="border border-dashed border-ink/25 bg-paper p-6">
          <h3 className="font-semibold text-ink">Putuskan Koneksi Cloud</h3>
          <p className="mt-1 text-sm text-ink/60">Menghapus kredensial Supabase dari perangkat ini saja. Data di cloud tidak terpengaruh.</p>
          <button type="button" onClick={() => { clearCloudAdmin(); alert("Koneksi cloud diputus."); }}
            className="mt-4 admin-btn-danger">Putuskan Cloud</button>
        </div>
      </div>
    </div>
  );
}
