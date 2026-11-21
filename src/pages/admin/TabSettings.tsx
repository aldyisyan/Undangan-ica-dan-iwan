import { useAdminConfig, saveAdminConfig } from "../../lib/adminSettings";
import { Field, TabHeading, TextArea, TextInput } from "./ui";

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

  const field = (key: keyof typeof cfg, label: string, type: "text" | "textarea" = "text") => {
    const val = String(cfg[key] ?? "");
    const onChange = (v: string) => saveAdminConfig({ [key]: v } as never);
    return type === "textarea" ? (
      <TextArea key={key} label={label} value={val} onChange={onChange} rows={2} />
    ) : (
      <TextInput key={key} label={label} value={val} onChange={onChange} />
    );
  };

  const handleDateChange = (localVal: string) => {
    const iso = localToIso(localVal);
    const label = formatLabel(iso);
    saveAdminConfig({ weddingDate: iso, weddingDateLabel: label });
  };

  return (
    <div className="space-y-8">
      <TabHeading
        title="Data Pasangan & Acara"
        sub="Semua perubahan tersimpan otomatis di perangkat ini dan langsung disinkronkan ke cloud — tidak perlu menekan tombol simpan."
      />

      <section className="space-y-5 border-t border-dashed border-ink/15 pt-7">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Mempelai Wanita</h3>
        {field("brideNick", "Panggilan")}
        {field("brideName", "Nama Lengkap")}
        {field("brideParents", "Putri dari", "textarea")}
      </section>

      <section className="space-y-5 border-t border-dashed border-ink/15 pt-7">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Mempelai Pria</h3>
        {field("groomNick", "Panggilan")}
        {field("groomName", "Nama Lengkap")}
        {field("groomParents", "Putra dari", "textarea")}
      </section>

      <section className="space-y-5 border-t border-dashed border-ink/15 pt-7">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Tanggal &amp; Waktu Acara</h3>
        <Field
          label="Tanggal & Jam Akad"
          hint={cfg.weddingDateLabel ? `Tampil di undangan: ${cfg.weddingDateLabel}` : undefined}
        >
          <input
            type="datetime-local"
            value={isoToLocal(cfg.weddingDate)}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full max-w-xs border-b border-ink/25 bg-transparent py-2.5 text-sm text-ink outline-none transition-colors focus:border-terra"
          />
        </Field>
        {field("weddingDateLabel", "Label Tanggal (bisa diedit manual)")}
      </section>

      <section className="space-y-5 border-t border-dashed border-ink/15 pt-7">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Lokasi</h3>
        {field("venue", "Nama Venue")}
        {field("address", "Alamat Venue", "textarea")}
        {field("mapsUrl", "Link Google Maps")}
        {field("mapsEmbed", "Maps Embed (src iframe, opsional)")}
      </section>

      <section className="space-y-5 border-t border-dashed border-ink/15 pt-7">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Akad &amp; Resepsi</h3>
        {field("akadTime", "Waktu Akad (mis. 09.00 – 10.00 WIB)")}
        {field("akadPlace", "Tempat Akad")}
        {field("resepsiTime", "Waktu Resepsi")}
        {field("resepsiPlace", "Tempat Resepsi")}
      </section>

      <section className="space-y-5 border-t border-dashed border-ink/15 pt-7">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Keamanan</h3>
        <Field label="PIN Admin (6–12 digit)" hint="Dipakai untuk masuk ke panel ini.">
          <input
            type="password"
            value={cfg.adminPin}
            onChange={(e) => saveAdminConfig({ adminPin: e.target.value })}
            className="w-40 border-b border-ink/25 bg-transparent py-2.5 font-mono text-sm text-ink outline-none transition-colors focus:border-terra"
          />
        </Field>
      </section>
    </div>
  );
}
