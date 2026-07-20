"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  level: string;
  onLevelChange: (level: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
};

const levels = ["", "A1", "A2", "B1", "B2", "C1"];

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá: Thấp đến cao" },
  { value: "price_desc", label: "Giá: Cao đến thấp" },
  { value: "title_asc", label: "Tên: A đến Z" },
];

function SelectField({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="h-12 w-full appearance-none rounded-2xl border border-mist bg-white px-4 pr-10 text-[15px] font-medium text-ink shadow-sm outline-none transition hover:border-ink/30 focus:border-bordeaux focus:ring-2 focus:ring-bordeaux/20 sm:h-11 sm:min-w-[9.5rem] sm:rounded-full sm:text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function SearchBar({
  value,
  onChange,
  level,
  onLevelChange,
  sort,
  onSortChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-[14rem]">
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tìm khoá học theo tên hoặc mô tả..."
          className="h-12 w-full rounded-2xl border border-mist bg-white/70 px-5 text-[15px] text-ink placeholder:text-ink/40 outline-none transition focus:border-bordeaux focus:ring-2 focus:ring-bordeaux/20 sm:h-11 sm:rounded-full sm:text-sm"
          aria-label="Tìm kiếm khoá học"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SelectField
          value={level}
          onChange={onLevelChange}
          ariaLabel="Lọc theo trình độ"
          options={[
            { value: "", label: "Tất cả trình độ" },
            ...levels.filter((l) => l).map((l) => ({ value: l, label: l })),
          ]}
        />
        <SelectField
          value={sort}
          onChange={onSortChange}
          ariaLabel="Sắp xếp"
          options={sortOptions}
        />
      </div>
    </div>
  );
}
