import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AchievementForm from "@/components/AchievementForm";

export default async function EditAchievementPage({
  params,
}: {
  params: { id: string };
}) {
  const achievement = await prisma.achievement.findUnique({
    where: { id: params.id },
  });
  if (!achievement) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Sửa thành tích
        </h1>
        <div className="ribbon-rule mt-3" />
      </div>
      <AchievementForm achievementId={achievement.id} initial={achievement as any} />
    </div>
  );
}
