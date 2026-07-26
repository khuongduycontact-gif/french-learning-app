export const dynamic = "force-dynamic";

import { Fragment } from "react";
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
          <p className="mt-3 text-ink/70">{about.heroDescription}</p>
        </div>
        <div className="relative ml-auto w-full max-w-[15rem] md:mr-0 md:max-w-xs">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-mist bg-white/50">
            {about.heroImageUrl ? (
              <Image
                src={about.heroImageUrl}
                alt={about.heroGreeting}
                fill
                sizes="320px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink/30">Chưa có ảnh</div>
            )}
          </div>
        </div>
      </section>

      {/* --- Hành trình của tôi --- */}
      {about.timeline.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">Hành trình của tôi</h2>
          <div className="ribbon-rule mt-3" />

          {/* Màn nhỏ/trung: xếp dạng lưới đơn giản, không có mũi tên nối */}
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:hidden">
            {about.timeline.map((item) => (
              <div key={item.id} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bordeaux/10 text-bordeaux ring-4 ring-parchment">
                  <AboutIcon name={item.icon} className="h-6 w-6" />
                </div>
                <p className="mt-3 font-body text-lg font-semibold text-ink">{item.year}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-xs text-ink/60">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Màn lớn: lưới chính xác để mũi tên chạm sát mép 2 hình tròn */}
          <div
            className="mt-10 hidden lg:grid"
            style={{
              gridTemplateColumns: about.timeline
                .map((_, i) => (i === 0 ? "3.5rem" : "1fr 3.5rem"))
                .join(" "),
            }}
          >
            {about.timeline.map((item, i) => (
              <Fragment key={item.id}>
                <div
                  className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-bordeaux/10 text-bordeaux ring-4 ring-parchment"
                  style={{ gridColumn: 2 * i + 1, gridRow: 1 }}
                >
                  <AboutIcon name={item.icon} className="h-6 w-6" />
                </div>
                <div
                  className="w-40 justify-self-center pt-3 text-center"
                  style={{ gridColumn: 2 * i + 1, gridRow: 2 }}
                >
                  <p className="font-body text-lg font-semibold text-ink">{item.year}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-xs text-ink/60">{item.description}</p>
                </div>
                {i < about.timeline.length - 1 && (
                  <div
                    className="flex items-center justify-center"
                    style={{ gridColumn: 2 * i + 2, gridRow: 1 }}
                  >
                    <svg
                      viewBox="0 0 32 10"
                      preserveAspectRatio="none"
                      className="h-2.5 w-full text-bordeaux/50"
                      fill="none"
                    >
                      <path
                        d="M1 5H28M28 5L21 1.5M28 5L21 8.5"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                )}
              </Fragment>
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
        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">
              {about.methodTitle}
            </h2>
            <div className="ribbon-rule mt-3" />
            {about.methodImageUrl && (
              <div className="relative mx-auto mt-8 aspect-[21/9] w-full max-w-2xl overflow-hidden rounded-2xl border border-mist shadow-sm">
                <Image
                  src={about.methodImageUrl}
                  alt={about.methodTitle}
                  fill
                  sizes="(min-width: 768px) 672px, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {about.methods.map((m) => (
                <div key={m.id} className="rounded-2xl border border-mist bg-white/70 p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bordeaux/10 text-bordeaux">
                    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                      <path
                        d="M4 10.5 8 14l8-8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink">{m.title}</p>
                  <p className="mt-1 text-xs text-ink/60">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
