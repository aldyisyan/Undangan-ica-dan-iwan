import { type FormEvent, useState } from "react";
import { useAdminConfig, saveAdminConfig } from "../../lib/adminSettings";
import { getCloudAdmin } from "../../lib/cloudConfig";
import { syncToCloud } from "../../lib/cloud";

const DAYS = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function formatLabel(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return ""; }
}

/** Convert ISO "2026-11-21T09:00:00+07:00" → "2026-11-21T09:00" for datetime-local input */
function isoToLocal(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ""; }
}

/** Convert "2026-11-21T09:00" (datetime-local) → ISO with +07:00 */
function localToIso(localVal: string): string {
  if (!localVal) return "";
  return localVal + ":00+07:00";
}

export default function TabSettings() {
  const cfg = useAdminConfig();
  const [saved, setSaved] = useState(false);

  const field = (key: keyof typeof cfg, label: string, type: "text" | "textarea" = "text") => {
    const val = String(cfg[key] ?? "");
    const onChange = (v: string) => saveAdminConfig({ [key]: v } as never);
    return (
      <div key={key}>
        <label className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">{label}</label>
        {type === "textarea" ? (
          <textarea value={val} onChange={(e) => onChange(e.target.value)} rows={2}
            className="mt-2 w-full resize-none border-b border-ink/25 bg-transparent py-2.5 text-sm text-ink outline-none transition-colors focus:border-terra" />
        ) : (
          <input type="text" value={val} onChange={(e) => onChange(e.target.value)}
            className="mt-2 w-full border-b border-ink/25 bg-transparent py-2.5 text-sm text-ink outline-none transition-colors focus:border-terra" />
        )}
      </div>
    );
  };

  const handleDateChange = (localVal: string) => {
    const iso = localToIso(localVal);
    const label = formatLabel(iso);
    saveAdminConfig({ weddingDate: iso, weddingDateLabel: label });
  };

  const handleSync = async (e: FormEvent) => {
    e.preventDefault();
    const admin = getCloudAdmin();
    if (!admin) { alert("Hubungkan ke Supabase dulu di tab Cloud."); return; }
    const ok = await syncToCloud(admin, cfg as unknown as Record<string, unknown>);
    setSaved(ok);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSync} className="space-y-8">
      <div>
        <h2 className="font-hand text-4xl text-ink">Data Pasangan & Acara</h2>
        <p className="mt-1 text-sm text-ink/60">Perubahan langsung tersimpan lokal. Klik &quot;Simpan &amp; Sync&quot; untuk push ke cloud.</p>
      </div>

      <section className="space-y-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Mempelai Pria</h3>
        {field("groomNick", "Panggilan")}
        {field("groomName", "Nama Lengkap")}
        {field("groomParents", "Putra dari", "textarea")}
      </section>

      <section className="space-y-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Mempelai Wanita</h3>
        {field("brideNick", "Panggilan")}
        {field("brideName", "Nama Lengkap")}
        {field("brideParents", "Putri dari", "textarea")}
      </section>

      <section className="space-y-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Tanggal & Waktu Acara</h3>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">Tanggal & Jam Akad</label>
          <input
            type="datetime-local"
            value={isoToLocal(cfg.weddingDate)}
            onChange={(e) => handleDateChange(e.target.value)}
            className="mt-2 w-full max-w-xs rounded-lg border border-ink/20 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-terra focus:ring-2 focus:ring-terra/20"
          />
          {cfg.weddingDateLabel && (
            <p className="mt-2 text-sm text-ink/60">
              Tampil di undangan: <strong className="text-ink">{cfg.weddingDateLabel}</strong>
            </p>
          )}
        </div>
        {field("weddingDateLabel", "Label Tanggal (bisa diedit manual)")}
      </section>

      <section className="space-y-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Lokasi</h3>
        {field("venue", "Nama Venue")}
        {field("address", "Alamat Venue", "textarea")}
        {field("mapsUrl", "Link Google Maps")}
        {field("mapsEmbed", "Maps Embed (src iframe, opsional)")}
      </section>

      <section className="space-y-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Akad & Resepsi</h3>
        {field("akadTime", "Waktu Akad (mis. 09.00 – 10.00 WIB)")}
        {field("akadPlace", "Tempat Akad")}
        {field("resepsiTime", "Waktu Resepsi")}
        {field("resepsiPlace", "Tempat Resepsi")}
      </section>

      <section className="space-y-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Keamanan</h3>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">PIN Admin (6–12 digit)</label>
          <input type="password" value={cfg.adminPin}
            onChange={(e) => saveAdminConfig({ adminPin: e.target.value })}
            className="mt-2 w-40 border-b border-ink/25 bg-transparent py-2.5 font-mono text-sm text-ink outline-none transition-colors focus:border-terra" />
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" className="admin-btn-primary">Simpan &amp; Sync ke Cloud</button>
        {saved && <span className="text-sm text-green-700">✓ Tersimpan & tersinkronisasi!</span>}
      </div>
    </form>
  );
}
