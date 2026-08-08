import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TrustedWebsiteForm from "@/components/TrustedWebsiteForm";

export default async function EditTrustedWebsitePage({
  params,
}: {
  params: { id: string };
}) {
  const website = await prisma.trustedWebsite.findUnique({ where: { id: params.id } });
  if (!website) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Sửa website</h1>
        <div className="ribbon-rule mt-3" />
      </div>
      <TrustedWebsiteForm websiteId={website.id} initial={website as any} />
    </div>
  );
}
