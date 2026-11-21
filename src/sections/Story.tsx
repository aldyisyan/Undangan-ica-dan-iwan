import { DRESS_SWATCHES, SECTION_PAD, STORY, WRAP } from "../lib/data";
import { useAdminConfig } from "../lib/adminSettings";
import { useMediaSrc } from "../lib/mediaStore";
import { HeartDoodle, Reveal, RoughFrame, SectionHead, Sprig } from "../lib/ui";

function StoryVisual({ item, index }: { item: (typeof STORY)[number]; index: number }) {
  const cfg = useAdminConfig();
  const customRef = Array.isArray(cfg.storyPhotos) ? cfg.storyPhotos[index] || "" : "";
  const resolvedCustom = useMediaSrc(customRef);
  const img = resolvedCustom || item.img || "";

  if (img) {
    return (
      <div className="polaroid relative mx-auto w-full max-w-[290px] rotate-[-2.5deg] p-3 pb-9 transition-transform duration-500 hover:rotate-0 md:mx-0">
        <span className="tape -top-3 left-1/2 -translate-x-1/2 -rotate-3" aria-hidden />
        <div className="aspect-[4/5] overflow-hidden bg-paper2">
          <img src={img} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <p className="mt-3 text-center font-note text-sm text-terra">{item.caption}</p>
      </div>
    );
  }
  return (
    <div className="polaroid relative mx-auto flex aspect-[4/5] w-full max-w-[290px] rotate-[2deg] flex-col items-center justify-center p-6 text-center transition-transform duration-500 hover:rotate-0 md:mx-0">
      <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-3" aria-hidden />
      <HeartDoodle className="h-10 w-10 text-terra heartbeat" filled />
      <p className="mt-4 font-hand text-6xl leading-none text-ink">{item.year}</p>
      <p className="mt-4 font-note text-sm text-terra">{item.caption}</p>
    </div>
  );
}

function GuideCard({
  title,
  doList,
  dont,
  rotate,
}: {
  title: string;
  doList: string[];
  dont: string;
  rotate: string;
}) {
  return (
    <article className={`relative bg-paper px-7 py-8 ${rotate}`}>
      <RoughFrame stroke="rgba(44,62,99,0.45)" />
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-hand text-4xl leading-none text-ink">{title}</h3>
        <span className="font-note text-xs text-terra">panduan</span>
      </div>
      <ul className="mt-5 space-y-3">
        {doList.map((t) => (
          <li key={t} className="flex gap-3 text-[13.5px] leading-relaxed text-ink/75">
            <HeartDoodle className="mt-0.5 h-4 w-4 shrink-0 text-terra/80" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-dashed border-ink/25 pt-4 font-note text-[13px] leading-relaxed text-ink/60">
        {dont}
      </p>
    </article>
  );
}

export default function Story({
  showDressCode = true,
}: {
  showDressCode?: boolean;
}) {
  void showDressCode; // suppress unused warning, used in JSX below
  const cfg = useAdminConfig();
  return (
    <>
      {/* ------------------------------------------------- 05 · cerita */}
      <section id="cerita" className={`${SECTION_PAD} relative overflow-hidden`}>
        <Sprig className="pointer-events-none absolute right-5 top-20 hidden h-32 w-20 text-navy/20 xl:block" />

        <div className={WRAP}>
          <SectionHead
            num="05"
            kicker="Our Love Story"
            title="Perjalanan Kami"
            aside="ditempel rapi di halaman ini"
          />

          <div className="relative mt-16">
            <span
              aria-hidden
              className="absolute left-[13px] top-2 h-[calc(100%-1rem)] border-l border-dashed border-ink/30 md:left-1/2 md:-translate-x-1/2"
            />

            <ol className="space-y-16 sm:space-y-20">
              {STORY.map((item, i) => {
                const leftSide = i % 2 === 0;
                return (
                  <Reveal
                    as="li"
                    key={item.year}
                    delay={60}
                    className="relative pl-12 md:grid md:grid-cols-2 md:gap-14 md:pl-0"
                  >
                    <span
                      aria-hidden
                      className="absolute left-[13px] top-5 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full border border-dashed border-terra bg-paper md:left-1/2"
                    >
                      <HeartDoodle className="h-3.5 w-3.5 text-terra" filled />
                    </span>

                    <div
                      className={
                        leftSide
                          ? "md:col-start-1 md:pr-4 md:text-right"
                          : "md:col-start-2 md:pl-4"
                      }
                    >
                      <div
                        className={`flex flex-col gap-6 ${
                          leftSide ? "md:items-end" : "md:items-start"
                        }`}
                      >
                        <StoryVisual item={item} index={i} />
                        <div className={`max-w-sm ${leftSide ? "md:text-right" : ""}`}>
                          <p className="font-hand text-5xl leading-none text-terra">{item.year}</p>
                          <h3 className="mt-1.5 font-hand text-3xl leading-tight text-ink">
                            {item.title}
                          </h3>
                          <p className="mt-3 text-[13.5px] leading-[1.85] text-ink/70">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- 06 · dress code */}
      {showDressCode && <section id="dresscode" className={`${SECTION_PAD} relative bg-paper2/70`}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-ink/20"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 border-b border-dashed border-ink/20"
        />
        <div className={WRAP}>
          <SectionHead
            num="06"
            kicker={cfg.dressKicker || "Dress Code Suggestions"}
            title={cfg.dressTitle || "Palet Tamu"}
            aside={cfg.dressAside || "hangat, netral, senada"}
          />

          <Reveal className="mt-14">
            <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-12">
              {(cfg.dressSwatches.length > 0 ? cfg.dressSwatches : DRESS_SWATCHES).map((s) => (
                <div key={`${s.hex}-${s.name}`} className="flex w-28 flex-col items-center text-center">
                  <div className="relative h-20 w-20">
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: s.hex }}
                      aria-hidden
                    />
                    <svg
                      className="draw pointer-events-none absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)]"
                      viewBox="0 0 100 100"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        pathLength={1}
                        d="M50 4c26 0 46 21 46 46s-22 46-47 46S4 75 4 50 24 4 50 4Z"
                        stroke="rgba(30,27,24,0.55)"
                        strokeWidth="1.4"
                      />
                    </svg>
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/80">
                    {s.name}
                  </p>
                  <p className="mt-1 font-note text-xs text-ink/50">{s.hex}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {cfg.dressNote && (
            <div className="mx-auto mt-6 max-w-xl text-center">
              <Reveal delay={80}>
                <p className="font-note text-sm leading-relaxed text-terra">{cfg.dressNote}</p>
              </Reveal>
            </div>
          )}

          <div className="mt-14 grid gap-8 md:grid-cols-2 md:gap-10">
            {cfg.dressMaleDos.filter((t) => t.trim()).length > 0 && (
              <Reveal delay={60}>
                <GuideCard
                  title="Untuk Pria"
                  rotate="md:-rotate-[0.6deg]"
                  doList={cfg.dressMaleDos.filter((t) => t.trim())}
                  dont={cfg.dressMaleDont}
                />
              </Reveal>
            )}
            {cfg.dressFemaleDos.filter((t) => t.trim()).length > 0 && (
              <Reveal delay={180}>
                <GuideCard
                  title="Untuk Wanita"
                  rotate="md:rotate-[0.6deg]"
                  doList={cfg.dressFemaleDos.filter((t) => t.trim())}
                  dont={cfg.dressFemaleDont}
                />
              </Reveal>
            )}
          </div>
        </div>
      </section>}
    </>
  );
}
