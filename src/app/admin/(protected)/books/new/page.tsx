import BookForm from "@/components/BookForm";

export default function NewBookPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Thêm sách</h1>
        <div className="ribbon-rule mt-3" />
      </div>
      <BookForm />
    </div>
  );
}
