import { TemplateCard } from "./TemplateCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

const templates = [
  {
    id: "1",
    title: "Funil de Vendas Pro",
    description: "Template completo de funil de vendas com landing page, sequências de e-mail e checkout.",
    usageCount: 240,
  },
  {
    id: "2",
    title: "Geração de Leads",
    description: "Capture leads com formulários otimizados e sequências de follow-up automatizadas.",
    usageCount: 185,
  },
  {
    id: "3",
    title: "Funil de Webinar",
    description: "Hospede webinars envolventes com registro, lembretes e páginas de replay.",
    usageCount: 156,
  },
  {
    id: "4",
    title: "Lançamento de Produto",
    description: "Lance seu produto com sequências de pré-lançamento, lançamento e pós-lançamento.",
    usageCount: 132,
  },
  {
    id: "5",
    title: "Site de Membros",
    description: "Crie uma área de membros com conteúdo restrito e gerenciamento de assinaturas.",
    usageCount: 98,
  },
];

export function TemplatesGallery() {
  const handleShare = (title: string) => {
    toast({
      title: "Compartilhar Template",
      description: `Compartilhando template "${title}"...`,
    });
  };

  const handleEdit = (title: string) => {
    toast({
      title: "Editar Template",
      description: `Abrindo "${title}" para edição...`,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Modelos</h2>
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
