import { TemplateCard } from "./TemplateCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

const templates = [
  {
    id: "1",
    title: "Sales Funnel Pro",
    description: "Complete sales funnel template with landing page, email sequences, and checkout.",
    usageCount: 240,
  },
  {
    id: "2",
    title: "Lead Generation",
    description: "Capture leads with optimized forms and automated follow-up sequences.",
    usageCount: 185,
  },
  {
    id: "3",
    title: "Webinar Funnel",
    description: "Host engaging webinars with registration, reminders, and replay pages.",
    usageCount: 156,
  },
  {
    id: "4",
    title: "Product Launch",
    description: "Launch your product with pre-launch, launch, and post-launch sequences.",
    usageCount: 132,
  },
  {
    id: "5",
    title: "Membership Site",
    description: "Create a membership area with gated content and subscription management.",
    usageCount: 98,
  },
];

export function TemplatesGallery() {
  const handleShare = (title: string) => {
    toast({
      title: "Share Template",
      description: `Sharing "${title}" template...`,
    });
  };

  const handleEdit = (title: string) => {
    toast({
      title: "Edit Template",
      description: `Opening "${title}" for editing...`,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Templates</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              title={template.title}
              description={template.description}
              usageCount={template.usageCount}
              onShare={() => handleShare(template.title)}
              onEdit={() => handleEdit(template.title)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
