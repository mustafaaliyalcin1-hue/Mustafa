// Senin verdiğin örnek kullanım (referans için). Panelde gerçek veriyle kullanım: src/App.tsx
import { Button } from "@/components/ui/button";
import { CourseDesignCard, type CardData } from "@/components/ui/course-design-cards";

export function ComponentsIntegrationDemo() {
  const sampleCards: CardData[] = [
    {
      id: 1,
      colorClass: "green",
      date: "Feb 2, 2021",
      title: "web designing",
      description: "Prototyping",
      progressPercent: "90%",
      progressValue: "90%",
      countdownText: "2 days left",
    },
    {
      id: 2,
      colorClass: "orange",
      date: "Feb 05, 2021",
      title: "mobile app",
      description: "Shopping",
      progressPercent: "30%",
      progressValue: "30%",
      countdownText: "3 weeks left",
    },
  ];

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="default">Başla</Button>
        <Button variant="secondary">İncele</Button>
        <Button variant="outline">Ayarlar</Button>
      </div>
      <div className="grid gap-4">
        {sampleCards.map((card) => (
          <CourseDesignCard key={card.id} data={card} />
        ))}
      </div>
    </div>
  );
}
