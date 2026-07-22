import AchievementForm from "@/components/AchievementForm";

export default function NewAchievementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Thêm thành tích</h1>
        <div className="ribbon-rule mt-3" />
      </div>
      <AchievementForm />
    </div>
  );
}
