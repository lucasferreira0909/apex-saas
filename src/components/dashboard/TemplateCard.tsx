import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Layout, Share2, Pencil } from "lucide-react";

interface TemplateCardProps {
  title: string;
  description: string;
  usageCount: number;
  onShare?: () => void;
  onEdit?: () => void;
}

export function TemplateCard({
  title,
  description,
  usageCount,
  onShare,
  onEdit,
}: TemplateCardProps) {
  return (
    <Card className="bg-card border-border rounded-xl min-w-[280px] max-w-[320px] flex-shrink-0 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <Layout className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              <Avatar className="w-6 h-6 border-2 border-card">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  A
                </AvatarFallback>
              </Avatar>
              <Avatar className="w-6 h-6 border-2 border-card">
                <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                  B
                </AvatarFallback>
              </Avatar>
              <Avatar className="w-6 h-6 border-2 border-card">
                <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                  C
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs font-medium text-muted-foreground ml-1">
              {usageCount}+
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-2"
            onClick={onShare}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={onEdit}
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
