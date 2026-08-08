import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPaymentInfo } from "@/lib/vietqr";
import BookPurchaseButton from "@/components/BookPurchaseButton";
import { RichText } from "@/lib/richtext";
import { formatVnd } from "@/lib/format";

function TagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M20.59 13.41 12 22 2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M10 3v9.5M6.2 9 10 12.8 13.8 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 14.5v1.3c0 .7.55 1.2 1.2 1.2h10.6c.65 0 1.2-.55 1.2-1.2v-1.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function BookDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { buy?: string };
}) {
  const book = await prisma.book.findUnique({ where: { id: params.id } });
  if (!book) notFound();

  const session = await getServerSession(authOptions);
  if (session?.user?.role === "ADMIN") redirect("/admin");

  let purchase: { id: string; status: string } | null = null;
  if (session?.user) {
    purchase = await prisma.bookPurchase.findUnique({
      where: { userId_bookId: { userId: session.user.id, bookId: book.id } },
      select: { id: true, status: true },
    });
  }

  const isFree = book.price <= 0;
  const isOwned = isFree || purchase?.status === "CONFIRMED";

  const payment =
    purchase && purchase.status === "PENDING_PAYMENT"
      ? buildPaymentInfo({ enrollmentId: purchase.id, amount: book.price })
      : null;

  const initial = book.title.trim().slice(0, 1).toUpperCase();
  const downloadHref = `/api/download?url=${encodeURIComponent(
    book.contentUrl,
  )}&name=${encodeURIComponent(book.title)}.pdf`;

  return (
    <div className="grid min-w-0 gap-8 md:grid-cols-3 md:items-stretch">
      <div className="min-w-0 md:col-span-2">
        <div className="transform-gpu overflow-hidden rounded-2xl border border-mist bg-white shadow-sm">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-white sm:aspect-[21/9]">
            <div className="h-full w-full p-2 sm:p-3">
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-indigo-100 via-indigo-50/70 to-white">
                    <div
                      className="absolute left-6 top-6 grid grid-cols-4 grid-rows-5 gap-x-6 gap-y-3 opacity-50 sm:left-8 sm:top-8 sm:gap-x-7"
                      aria-hidden
                    >
                      {Array.from({ length: 20 }).map((_, i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-indigo-400"
                        />
                      ))}
                    </div>
                    <div
                      className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-200/45"
                      aria-hidden
                    />
                    <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-body text-8xl font-bold leading-none text-indigo-400 sm:text-9xl">
                      {initial}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!book.published && (
              <span className="absolute left-4 top-4 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-medium text-parchment shadow-sm">
                Bản nháp
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <h1 className="break-words font-display text-lg font-bold text-ink">
              {book.title}
            </h1>
            <RichText
              content={book.description}
              className="mt-3 break-words text-lg text-ink/60"
            />
          </div>
        </div>
      </div>

      <div className="min-w-0 flex flex-col gap-6">
        <aside className="rounded-2xl border border-mist bg-white/60 p-6">
          <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-amber-50 px-3 py-3.5">
            <TagIcon className="h-6 w-6 shrink-0 text-amber-500" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink sm:text-base">
                {book.price > 0 ? formatVnd(book.price) : "Miễn phí"}
              </p>
              <p className="truncate text-[11px] text-ink/50">Giá sách</p>
            </div>
          </div>

          <div className="mt-4">
            {isOwned ? (
              <a
                href={downloadHref}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-bordeaux px-6 py-3 text-sm font-semibold text-parchment transition hover:bg-bordeaux/90"
              >
                <DownloadIcon className="h-4 w-4" />
                Tải xuống sách (PDF)
              </a>
            ) : (
              <BookPurchaseButton
                bookId={book.id}
                bookTitle={book.title}
                initialPurchaseId={purchase?.id ?? null}
                initialStatus={(purchase?.status as any) ?? null}
                initialPayment={payment}
                autoStart={searchParams?.buy === "1"}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
