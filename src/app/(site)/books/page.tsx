"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BookCard from "@/components/BookCard";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import Select from "@/components/Select";
import { bookPurchaseStatusMap } from "@/lib/bookPurchaseStatus";
import type { Book } from "@/types";

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "price_asc", label: "Giá: Thấp đến cao" },
  { value: "price_desc", label: "Giá: Cao đến thấp" },
  { value: "popular_desc", label: "Lượt mua: Nhiều nhất" },
  { value: "popular_asc", label: "Lượt mua: Ít nhất" },
];

export default function BooksPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [books, setBooks] = useState<Book[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const isFirstLoad = useRef(true);

  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [session, router]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);

    function run() {
      setLoading(true);
      setError("");
      fetch(`/api/books?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được danh sách sách.");
          return res.json();
        })
        .then((data) => {
          setBooks(data);
          setPage(1);
          setLoading(false);
        })
        .catch((err) => {
          if (err?.name === "AbortError" || controller.signal.aborted) return;
          setError("Không tải được danh sách sách, vui lòng thử lại.");
          setLoading(false);
        });
    }

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      run();
      return () => controller.abort();
    }

    const timeout = setTimeout(run, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [q, sort, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(books.length / PAGE_SIZE));
  const pageBooks = books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Tất cả sách</h1>
        <div className="ribbon-rule mt-3" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
        <div className="relative flex-1 sm:min-w-[14rem]">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm sách theo tên hoặc mô tả..."
            className="h-12 w-full rounded-2xl border border-mist bg-white/70 px-5 text-[15px] text-ink placeholder:text-ink/40 outline-none transition focus:border-bordeaux focus:ring-2 focus:ring-bordeaux/20 sm:h-11 sm:rounded-full sm:text-sm"
            aria-label="Tìm kiếm sách"
          />
        </div>
        <Select value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      {loading ? (
        <Loader label="Đang tải sách..." />
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-bordeaux/40 p-10 text-center">
          <p className="text-bordeaux">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-3 rounded-full border border-bordeaux/40 px-4 py-2 text-sm font-medium text-bordeaux hover:bg-bordeaux/5"
          >
            Thử lại
          </button>
        </div>
      ) : books.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mist p-10 text-center text-ink/60">
          Không tìm thấy sách phù hợp. Thử từ khoá khác nhé.
        </p>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pageBooks.map((b) => (
              <BookCard
                key={b.id}
                book={b}
                statusBadge={
                  b.myPurchaseStatus ? bookPurchaseStatusMap[b.myPurchaseStatus] : undefined
                }
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
