"use client";

import { useEffect, useRef, useState } from "react";

type HistoryItem = {
  id: string;
  word: string;
  translation: string;
};

const STORAGE_KEY = "fr_dictionary_history_v1";
// Chỉ lưu tối đa 2 lượt tra cứu gần nhất: khi vượt quá số lượng này,
// từ được thêm SỚM NHẤT (bên trái) sẽ tự bị xoá bớt.
const MAX_HISTORY = 2;

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // sessionStorage có thể bị chặn (chế độ ẩn danh nghiêm ngặt...) — bỏ qua an toàn
  }
}

// Đọc to một từ/câu tiếng Pháp bằng Web Speech API của trình duyệt.
// Một số trình duyệt (đặc biệt trên mobile) chưa hỗ trợ — khi đó bỏ qua an toàn.
function speakFrench(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const clean = text.trim();
  if (!clean) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "fr-FR";
    const frVoice = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.toLowerCase().startsWith("fr"));
    if (frVoice) utterance.voice = frVoice;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Trình duyệt không hỗ trợ đọc giọng nói — bỏ qua an toàn
  }
}

function FrenchFlag() {
  return (
    <svg
      viewBox="0 0 3 2"
      className="inline-block h-[1em] w-[1.5em] shrink-0 rounded-[2px] ring-1 ring-white/30"
      aria-hidden="true"
    >
      <rect width="1" height="2" x="0" fill="#0055A4" />
      <rect width="1" height="2" x="1" fill="#FFFFFF" />
      <rect width="1" height="2" x="2" fill="#EF4135" />
    </svg>
  );
}

function VietnamFlag() {
  return (
    <svg
      viewBox="0 0 3 2"
      className="inline-block h-[1em] w-[1.5em] shrink-0 rounded-[2px] ring-1 ring-white/30"
      aria-hidden="true"
    >
      <rect width="3" height="2" fill="#DA251D" />
      <polygon
        points="1.5,0.4 1.66,0.87 2.15,0.87 1.75,1.16 1.9,1.63 1.5,1.34 1.1,1.63 1.25,1.16 0.85,0.87 1.34,0.87"
        fill="#FFFF00"
      />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M3 8v4h3l4 3.5v-11L6 8H3Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M13.2 6.8a4.2 4.2 0 0 1 0 6.4M15.6 4.7a7.6 7.6 0 0 1 0 10.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DictionaryLookup() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [resultWord, setResultWord] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Chỉ đọc sessionStorage sau khi mount (tránh lệch nội dung SSR/CSR)
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function lookup(term: string) {
    const word = term.trim();
    if (!word) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Dịch qua route nội bộ /api/translate (server gọi DeepL), tránh lộ
      // API key ra client và tránh lỗi CORS khi gọi DeepL thẳng từ trình duyệt.
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: word, sourceLang: "FR", targetLang: "VI" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "request-failed");
      const translated: string | undefined = data?.translation;
      if (!translated) throw new Error("empty-result");

      setResult(translated);
      setResultWord(word);

      const historyId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      setHistory((prev) => {
        const withoutDup = prev.filter(
          (item) => item.word.toLowerCase() !== word.toLowerCase()
        );
        const next = [
          ...withoutDup,
          { id: historyId, word, translation: translated },
        ];
        // Chỉ giữ tối đa MAX_HISTORY lượt: cắt bớt (các) từ cũ nhất khi vượt quá
        const trimmed = next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
        saveHistory(trimmed);
        return trimmed;
      });
    } catch (err) {
      const message =
        err instanceof Error && err.message && err.message !== "empty-result"
          ? err.message
          : "Không tra được từ này, vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function removeHistoryItem(id: string) {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveHistory(next);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    lookup(query);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-mist bg-white shadow-xl">
          <div className="flex items-center justify-between bg-ink px-4 py-2.5">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-parchment">
              <span className="flex items-center gap-1">
                Từ điển Pháp
                <FrenchFlag />
              </span>
              <span>–</span>
              <span className="flex items-center gap-1">
                Việt
                <VietnamFlag />
              </span>
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-parchment/70 transition hover:text-parchment"
              aria-label="Đóng từ điển"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 px-4 py-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập từ tiếng Pháp..."
                className="w-full rounded-lg border border-mist bg-parchment/40 px-3 py-1.5 text-sm text-ink outline-none focus:border-bordeaux"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="shrink-0 rounded-lg bg-bordeaux px-3 py-1.5 text-sm font-medium text-white transition hover:bg-bordeaux/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "..." : "Tra"}
              </button>
            </form>

            {error && <p className="text-xs text-bordeaux">{error}</p>}

            {result && !error && (
              <div className="rounded-lg bg-parchment/60 px-3 py-2 text-sm text-ink">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold">{resultWord}</span>
                  <button
                    type="button"
                    onClick={() => speakFrench(resultWord)}
                    aria-label={`Đọc phát âm từ ${resultWord}`}
                    title="Nghe phát âm"
                    className="text-bordeaux transition hover:text-bordeaux/70"
                  >
                    <SpeakerIcon />
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-ink/40">→</span>
                  <span>{result}</span>
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-ink/50">
                  Lịch sử tra cứu
                </p>
                {/* Luôn giữ trên 1 dòng: flex-nowrap + overflow-x-auto,
                    không xuống dòng; danh sách đã được cắt gọn ở MAX_HISTORY. */}
                <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-1">
                  {history.map((item) => (
                    <span
                      key={item.id}
                      title={item.translation}
                      className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-mist bg-white px-2.5 py-1 text-xs text-ink"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(item.word);
                          lookup(item.word);
                        }}
                        className="hover:text-bordeaux"
                      >
                        {item.word}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeHistoryItem(item.id)}
                        aria-label={`Xoá ${item.word} khỏi lịch sử`}
                        className="text-ink/40 transition hover:text-bordeaux"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-bordeaux text-white shadow-lg transition hover:bg-bordeaux/90"
        aria-label="Mở từ điển tra cứu"
        title="Từ điển tra cứu"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M4 4.5A1.5 1.5 0 0 1 5.5 3H15a1 1 0 0 1 1 1v11.5a1 1 0 0 1-1 1H5.5A1.5 1.5 0 0 1 4 15V4.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M4 15.5A1.5 1.5 0 0 1 5.5 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M7 6.5h6M7 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default DictionaryLookup;
