export const dynamic = "force-dynamic";

import Image from "next/image";
import { getAboutPage } from "@/lib/about";
import { AboutIcon } from "@/components/AboutIcons";

export const metadata = {
  title: "Giới thiệu về tôi | Français avec Céline",
};

export default async function AboutPage() {
  const about = await getAboutPage();

  return (
    <div className="flex flex-col gap-20">
      {/* --- Hero --- */}
      <section className="grid gap-10 md:grid-cols-2 md:items-start">
        <div>
          <span className="font-body text-sm italic text-bordeaux">{about.heroKicker}</span>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
            {about.heroTitle}
          </h1>
          <div className="ribbon-rule my-6" />
          <p className="font-body text-xl font-semibold text-ink">{about.heroGreeting}</p>
          <p className="mt-3 max-w-md text-ink/70">{about.heroDescription}</p>
        </div>
        <div className="relative ml-auto w-full max-w-sm md:mr-0">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-mist bg-white/50">
            {about.heroImageUrl ? (
              <Image
                src={about.heroImageUrl}
                alt={about.heroGreeting}
                fill
                sizes="384px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink/30">Chưa có ảnh</div>
            )}
          </div>
          {about.heroBadgeUrl && (
            <div className="absolute -right-4 -top-4 aspect-square w-24 overflow-hidden rounded-full border-4 border-parchment shadow-lg sm:w-28">
              <Image src={about.heroBadgeUrl} alt="" fill sizes="112px" className="object-cover" />
            </div>
          )}
        </div>
      </section>

      {/* --- Hành trình của tôi --- */}
      {about.timeline.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">Hành trình của tôi</h2>
          <div className="ribbon-rule mt-3" />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {about.timeline.map((item, i) => (
              <div key={item.id} className="relative flex flex-col items-center text-center">
                {i < about.timeline.length - 1 && (
                  <div className="pointer-events-none absolute left-[calc(50%+2rem)] top-7 hidden h-0 w-[calc(100%-2rem)] -translate-y-1/2 lg:block">
                    <div className="h-0.5 w-full bg-bordeaux/25" />
                    <svg
                      viewBox="0 0 12 12"
                      className="absolute -right-1 -top-[5px] h-3 w-3 text-bordeaux/40"
                      fill="currentColor"
                    >
                      <path d="M1 1 11 6 1 11Z" />
                    </svg>
                  </div>
                )}
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-bordeaux/10 text-bordeaux ring-4 ring-parchment">
                  <AboutIcon name={item.icon} className="h-6 w-6" />
                </div>
                <p className="mt-3 font-body text-lg font-semibold text-ink">{item.year}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-xs text-ink/60">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- Vì sao học cùng Céline --- */}
      {about.reasons.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">Vì sao học cùng Céline?</h2>
          <div className="ribbon-rule mt-3" />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {about.reasons.map((r) => (
              <div key={r.id} className="rounded-2xl border border-mist bg-white/60 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bordeaux/10 text-bordeaux">
                  <AboutIcon name={r.icon} className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">{r.title}</p>
                <p className="mt-1 text-xs text-ink/60">{r.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- Phương pháp giảng dạy --- */}
      {about.methods.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">{about.methodTitle}</h2>
          <div className="ribbon-rule mt-3" />
          <div className="mt-6 grid gap-6 sm:grid-cols-2 sm:items-center">
            {about.methodImageUrl && (
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-mist">
                <Image src={about.methodImageUrl} alt={about.methodTitle} fill sizes="320px" className="object-cover" />
              </div>
            )}
            <ul className="flex flex-col gap-4">
              {about.methods.map((m) => (
                <li key={m.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bordeaux/10 text-bordeaux">
                    <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none">
                      <path d="M4 10.5 8 14l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{m.title}</p>
                    <p className="text-xs text-ink/60">{m.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

    </div>
  );
}
