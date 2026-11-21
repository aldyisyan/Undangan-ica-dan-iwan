import { useAdminConfig, saveAdminConfig } from "../../lib/adminSettings";
import { Btn, Field, Panel, TabHeading, TextArea, TextInput } from "./ui";

type Swatch = { name: string; hex: string };

/** Editor daftar poin (mis. panduan busana) — tambah, ubah, hapus. */
function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/75">{label}</label>
      <div className="mt-3 space-y-2.5">
        {list.map((t, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-5 shrink-0 text-center font-note text-[13px] text-terra">{i + 1}.</span>
            <input
              value={t}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...list];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="min-w-0 flex-1 border-b border-ink/25 bg-transparent py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-terra"
            />
            <button
              type="button"
              onClick={() => onChange(list.filter((_, j) => j !== i))}
              className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-terra/60 transition-colors hover:text-terra"
            >
              Hapus
            </button>
          </div>
        ))}
        {list.length === 0 && (
          <p className="text-[13px] text-ink/45">Belum ada poin — panduan tidak akan tampil di undangan.</p>
        )}
        <button
          type="button"
          onClick={() => onChange([...list, ""])}
          className="admin-btn text-[10px]"
        >
          + Tambah poin
        </button>
      </div>
    </div>
  );
}

export default function TabDressCode() {
  const cfg = useAdminConfig();

  const swatches: Swatch[] = Array.isArray(cfg.dressSwatches) ? cfg.dressSwatches : [];

  const setSwatches = (next: Swatch[]) => saveAdminConfig({ dressSwatches: next });
  const updateSwatch = (i: number, patch: Partial<Swatch>) =>
    setSwatches(swatches.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const addSwatch = () =>
    setSwatches([...swatches, { name: `Warna ${swatches.length + 1}`, hex: "#B5533C" }]);
  const removeSwatch = (i: number) => setSwatches(swatches.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-8">
      <TabHeading
        title="Dress Code"
        sub="Sunting seluruh isi section Palet Tamu di halaman undangan — judul, palet warna, catatan, dan panduan busana. Semua tersimpan otomatis."
      />

      {/* ── judul section ── */}
      <Panel title="Judul & Teks Section">
        <div className="grid gap-6 sm:grid-cols-2">
          <TextInput
            label="Label kecil di atas"
            value={cfg.dressKicker}
            onChange={(v) => saveAdminConfig({ dressKicker: v })}
            placeholder="Dress Code Suggestions"
          />
          <TextInput
            label="Judul utama"
            value={cfg.dressTitle}
            onChange={(v) => saveAdminConfig({ dressTitle: v })}
            placeholder="Palet Tamu"
          />
          <TextInput
            label="Catatan pinggir (aside)"
            value={cfg.dressAside}
            onChange={(v) => saveAdminConfig({ dressAside: v })}
            placeholder="hangat, netral, senada"
          />
          <TextInput
            label="Catatan di bawah palet"
            value={cfg.dressNote}
            onChange={(v) => saveAdminConfig({ dressNote: v })}
            placeholder="Kenakan salah satu warna di atas…"
          />
        </div>
      </Panel>

      {/* ── palet warna ── */}
      <Panel
        title="Palet Warna Tamu"
        desc="Klik kotak warna untuk memilih, atau ketik kode hex-nya langsung. Minimal satu warna agar palet tetap tampil."
        action={
          <span className="font-note text-[12px] text-ink/45">{swatches.length} warna</span>
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {swatches.map((s, i) => (
            <div key={i} className="border border-ink/15 bg-paper2/50 p-3">
              <div className="flex items-start gap-3">
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(s.hex) ? s.hex : "#B5533C"}
                  onChange={(e) => updateSwatch(i, { hex: e.target.value })}
                  aria-label={`Pilih warna ${i + 1}`}
                  className="h-12 w-12 shrink-0 cursor-pointer border border-ink/20 bg-paper p-1"
                />
                <div className="min-w-0 flex-1">
                  <input
                    value={s.name}
                    placeholder="Nama warna"
                    onChange={(e) => updateSwatch(i, { name: e.target.value })}
                    className="w-full border-b border-ink/20 bg-transparent py-1.5 text-[13px] font-semibold text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-terra"
                  />
                  <input
                    value={s.hex}
                    placeholder="#B5533C"
                    onChange={(e) => updateSwatch(i, { hex: e.target.value })}
                    className="mt-1.5 w-full border-b border-ink/15 bg-transparent py-1 font-mono text-[11px] uppercase text-ink/60 outline-none transition-colors placeholder:text-ink/30 focus:border-terra"
                  />
                </div>
              </div>
              <div
                aria-hidden
                className="mt-3 h-7 w-full border border-ink/10"
                style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(s.hex) ? s.hex : "#E7D3BE" }}
              />
              <button
                type="button"
                onClick={() => removeSwatch(i)}
                disabled={swatches.length <= 1}
                className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-terra/60 transition-colors hover:text-terra disabled:cursor-not-allowed disabled:opacity-30"
              >
                Hapus warna
              </button>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Btn onClick={addSwatch}>+ Tambah Warna</Btn>
        </div>
      </Panel>

      {/* ── panduan pria ── */}
      <Panel title="Panduan Untuk Pria" desc="Ditampilkan sebagai kartu di sebelah kiri section dress code.">
        <ListEditor
          label="Poin yang disarankan"
          items={cfg.dressMaleDos}
          onChange={(v) => saveAdminConfig({ dressMaleDos: v })}
          placeholder="Contoh: Jas navy dengan kemeja nude"
        />
        <div className="mt-6">
          <TextArea
            label="Yang dihindari"
            rows={2}
            value={cfg.dressMaleDont}
            onChange={(v) => saveAdminConfig({ dressMaleDont: v })}
            placeholder="Hindari kaos berlogo besar, sandal, dan celana jeans robek."
          />
        </div>
      </Panel>

      {/* ── panduan wanita ── */}
      <Panel title="Panduan Untuk Wanita" desc="Ditampilkan sebagai kartu di sebelah kanan section dress code.">
        <ListEditor
          label="Poin yang disarankan"
          items={cfg.dressFemaleDos}
          onChange={(v) => saveAdminConfig({ dressFemaleDos: v })}
          placeholder="Contoh: Dress midi bernuansa sage"
        />
        <div className="mt-6">
          <TextArea
            label="Yang dihindari"
            rows={2}
            value={cfg.dressFemaleDont}
            onChange={(v) => saveAdminConfig({ dressFemaleDont: v })}
            placeholder="Mohon tidak mengenakan pakaian serba putih…"
          />
        </div>
      </Panel>

      {/* ── catatan kartu acara ── */}
      <Panel
        title="Catatan di Kartu Acara"
        desc="Teks kecil pada kartu Resepsi di section Rangkaian Acara."
      >
        <Field label="Catatan Resepsi">
          <input
            value={cfg.resepsiNote}
            onChange={(e) => saveAdminConfig({ resepsiNote: e.target.value })}
            placeholder="Dress code: palet sage, nude & terakota."
            className="w-full border-b border-ink/25 bg-transparent py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-terra"
          />
        </Field>
      </Panel>

      <p className="border border-dashed border-ink/20 bg-paper2/60 px-5 py-4 text-[13px] leading-relaxed text-ink/60">
        Section dress code hanya tampil bila tombolnya aktif di tab{" "}
        <strong className="text-navy">Tampilan Section</strong>. Kosongkan daftar panduan untuk
        menyembunyikan kartunya tanpa harus mematikan seluruh section.
      </p>
    </div>
  );
}
