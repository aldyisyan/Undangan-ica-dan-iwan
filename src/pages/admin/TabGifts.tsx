import { useState } from "react";
import { useAdminConfig, saveAdminConfig } from "../../lib/adminSettings";
import { getCloudAdmin } from "../../lib/cloudConfig";
import { syncToCloud } from "../../lib/cloud";

export default function TabGifts() {
  const cfg = useAdminConfig();
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const updateGift = (i: number, field: string, value: string) => {
    const gifts = [...cfg.gifts];
    gifts[i] = { ...gifts[i], [field]: value };
    saveAdminConfig({ gifts });
  };

  const addGift = () => saveAdminConfig({ gifts: [...cfg.gifts, { bank: "", number: "", holder: "", kind: "Rekening Tabungan" }] });

  const removeGift = (i: number) => {
    const gifts = cfg.gifts.filter((_, idx) => idx !== i);
    saveAdminConfig({ gifts });
  };

  const sync = async () => {
    const admin = getCloudAdmin();
    if (!admin) { showToast("Hubungkan ke Supabase dulu di tab Cloud."); return; }
    const ok = await syncToCloud(admin, cfg as unknown as Record<string, unknown>);
    showToast(ok ? "✓ Tersinkronisasi ke cloud!" : "Gagal sync. Cek koneksi.");
  };

  const KINDS = ["Rekening Tabungan", "Kartu Kredit", "Dompet Digital (GoPay)", "Dompet Digital (OVO)", "Dompet Digital (DANA)", "PayPal"];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-hand text-4xl text-ink">Amplop Digital & Kirim Hadiah</h2>
        <p className="mt-1 text-sm text-ink/60">Kelola nomor rekening/e-wallet yang tampil di halaman undangan.</p>
      </div>

      <div className="space-y-4">
        {cfg.gifts.map((g, i) => (
          <div key={i} className="relative border border-dashed border-ink/25 bg-paper p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-hand text-2xl text-ink">Rekening #{i + 1}</span>
              <button type="button" onClick={() => removeGift(i)} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-terra hover:underline">Hapus</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/70">Bank / Platform</label>
                <input value={g.bank} onChange={(e) => updateGift(i, "bank", e.target.value)}
                  className="mt-1.5 w-full border-b border-ink/20 bg-transparent py-2 text-sm text-ink outline-none focus:border-terra" placeholder="BCA" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/70">Jenis</label>
                <select value={g.kind} onChange={(e) => updateGift(i, "kind", e.target.value)}
                  className="mt-1.5 w-full border-b border-ink/20 bg-transparent py-2 text-sm text-ink outline-none focus:border-terra">
                  {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/70">Nomor Rekening</label>
                <input value={g.number} onChange={(e) => updateGift(i, "number", e.target.value)}
                  className="mt-1.5 w-full border-b border-ink/20 bg-transparent py-2 font-mono text-sm text-ink outline-none focus:border-terra" placeholder="1234567890" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/70">Atas Nama</label>
                <input value={g.holder} onChange={(e) => updateGift(i, "holder", e.target.value)}
                  className="mt-1.5 w-full border-b border-ink/20 bg-transparent py-2 text-sm text-ink outline-none focus:border-terra" placeholder="Nama pemilik rekening" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={addGift} className="admin-btn">+ Tambah Rekening</button>
        <button type="button" onClick={sync} className="admin-btn-primary">Simpan &amp; Sync ke Cloud</button>
      </div>
      {toast && <p className="text-sm text-green-700">{toast}</p>}
    </div>
  );
}
