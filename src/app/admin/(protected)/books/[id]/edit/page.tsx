import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookForm from "@/components/BookForm";

export default async function EditBookPage({
  params,
}: {
  params: { id: string };
}) {
  const book = await prisma.book.findUnique({ where: { id: params.id } });
  if (!book) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Sửa sách</h1>
        <div className="ribbon-rule mt-3" />
      </div>
      <BookForm bookId={book.id} initial={book as any} />
    </div>
  );
}
