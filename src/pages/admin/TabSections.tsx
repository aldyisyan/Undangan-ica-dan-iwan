import { useAdminConfig, saveAdminConfig } from "../../lib/adminSettings";
import { getCloudAdmin } from "../../lib/cloudConfig";
import { syncToCloud } from "../../lib/cloud";

const SECTIONS = [
  { key: "showGifts", label: "Amplop Digital / Kirim Hadiah", desc: "Tampilkan nomor rekening & e-wallet untuk tamu yang ingin mengirim hadiah." },
  { key: "showDressCode", label: "Dress Code", desc: "Tampilkan panduan warna & busana tamu." },
  { key: "showStory", label: "Perjalanan Cinta (Love Story)", desc: "Tampilkan timeline perjalanan pasangan." },
  { key: "showGallery", label: "Galeri Foto", desc: "Tampilkan galeri foto & lightbox." },
  { key: "showRsvp", label: "RSVP & Ucapan", desc: "Tampilkan form konfirmasi kehadiran & kolom ucapan." },
] as const;

export default function TabSections() {
  const cfg = useAdminConfig();

  const toggle = async (key: (typeof SECTIONS)[number]["key"]) => {
    const next = { [key]: !cfg[key] };
    saveAdminConfig(next);
    const admin = getCloudAdmin();
    if (admin) {
      const updated = { ...cfg, ...next };
      await syncToCloud(admin, updated as unknown as Record<string, unknown>);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-hand text-4xl text-ink">Tampilkan / Sembunyikan Section</h2>
        <p className="mt-1 text-sm text-ink/60">
          Aktifkan atau nonaktifkan bagian tertentu dari halaman undangan. Perubahan langsung tersinkronisasi ke cloud.
        </p>
      </div>

      <div className="divide-y divide-ink/15">
        {SECTIONS.map(({ key, label, desc }) => {
          const on = cfg[key];
          return (
            <div key={key} className="flex items-center justify-between gap-6 py-5">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{label}</p>
                <p className="mt-0.5 text-[13px] text-ink/60">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(key)}
                role="switch"
                aria-checked={on}
                className={`relative h-7 w-14 shrink-0 rounded-full border-2 transition-all duration-300 ${on ? "border-terra bg-terra" : "border-ink/30 bg-ink/10"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform duration-300 ${on ? "translate-x-7" : "translate-x-0.5"}`} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded bg-navy/5 px-5 py-4 text-sm text-ink/70">
        <p className="font-semibold text-navy">Catatan:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Perubahan langsung tersimpan di perangkat ini dan di cloud (jika sudah terhubung).</li>
          <li>Tamu akan melihat perubahan saat halaman di-refresh atau dalam 15 detik (polling otomatis).</li>
        </ul>
      </div>
    </div>
  );
}
