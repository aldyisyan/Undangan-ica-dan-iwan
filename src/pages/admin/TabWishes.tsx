import { useState } from "react";
import { useWishes, removeWish, wipeWishes } from "../../lib/wishes";
import { getCloudAdmin } from "../../lib/cloudConfig";
import { forceReplaceWishesCloud, pullFromCloud } from "../../lib/cloud";

export default function TabWishes() {
  const wishes = useWishes();
  const [toast, setToast] = useState("");
  const [pulling, setPulling] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const del = async (w: Parameters<typeof removeWish>[0]) => {
    const next = removeWish(w);
    const admin = getCloudAdmin();
    if (admin) await forceReplaceWishesCloud(admin, next);
    showToast("Ucapan dihapus.");
  };

  const wipe = async () => {
    if (!confirm("Hapus semua ucapan? Tindakan ini tidak dapat dibatalkan.")) return;
    wipeWishes();
    const admin = getCloudAdmin();
    if (admin) await forceReplaceWishesCloud(admin, []);
    showToast("Semua ucapan dihapus.");
  };

  const pull = async () => {
    setPulling(true);
    const ok = await pullFromCloud();
    setPulling(false);
    showToast(ok ? "✓ Data ditarik dari cloud." : "Tidak ada data cloud atau koneksi gagal.");
  };

  const badge = (attend: string) => {
    if (attend === "hadir") return "bg-terra/15 text-terra border border-terra/40";
    if (attend === "tidak") return "bg-ink/10 text-ink/60 border border-ink/20";
    return "bg-navy/10 text-navy border border-navy/30";
  };
  const label = (attend: string) => ({ hadir: "Hadir", tidak: "Tidak Hadir", ragu: "Masih Ragu" }[attend] ?? attend);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-hand text-4xl text-ink">Ucapan &amp; RSVP</h2>
          <p className="mt-1 text-sm text-ink/60">{wishes.length} ucapan tersimpan</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={pull} disabled={pulling} className="admin-btn">
            {pulling ? "Menarik…" : "⬇ Pull dari Cloud"}
          </button>
          <button type="button" onClick={wipe} className="admin-btn-danger">Hapus Semua</button>
        </div>
      </div>

      {toast && (
        <p className="border border-sage/50 bg-sage/10 px-4 py-2.5 text-sm text-ink">{toast}</p>
      )}

      {wishes.length === 0 ? (
        <p className="text-sm text-ink/50">Belum ada ucapan masuk.</p>
      ) : (
        <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
          {wishes.map((w, i) => (
            <div key={i} className="flex gap-4 border border-dashed border-ink/20 bg-paper px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-hand text-2xl leading-none text-ink">{w.name}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${badge(w.attend)}`}>
                    {label(w.attend)}{w.count ? ` · ${w.count} orang` : ""}
                  </span>
                </div>
                {w.message ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/75">{w.message}</p>
                ) : (
                  <p className="mt-2 font-note text-[13px] italic text-ink/45">Hadir tanpa ucapan</p>
                )}
                <p className="mt-1.5 text-[11px] text-ink/40">{new Date(w.at).toLocaleString("id-ID")}</p>
              </div>
              <button type="button" onClick={() => del(w)} className="shrink-0 self-start text-[11px] font-semibold text-terra hover:underline">Hapus</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
