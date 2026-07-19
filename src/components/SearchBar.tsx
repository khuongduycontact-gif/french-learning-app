"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  level: string;
  onLevelChange: (level: string) => void;
};

const levels = ["", "A1", "A2", "B1", "B2", "C1"];

export default function SearchBar({ value, onChange, level, onLevelChange }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tìm khoá học theo tên hoặc mô tả..."
        className="w-full rounded-full border border-mist bg-white/70 px-5 py-2.5 text-sm text-ink placeholder:text-ink/40"
        aria-label="Tìm kiếm khoá học"
      />
      <select
        value={level}
        onChange={(e) => onLevelChange(e.target.value)}
        className="rounded-full border border-mist bg-white/70 px-4 py-2.5 text-sm text-ink"
        aria-label="Lọc theo trình độ"
      >
        {levels.map((l) => (
          <option key={l} value={l}>
            {l === "" ? "Tất cả trình độ" : l}
          </option>
        ))}
      </select>
    </div>
  );
}
