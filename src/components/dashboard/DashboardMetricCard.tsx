import { LucideIcon, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  verified?: boolean;
  className?: string;
}

export function DashboardMetricCard({
  title,
  value,
  icon: Icon,
  verified = false,
  className,
}: DashboardMetricCardProps) {
  return (
    <Card
      className={cn(
        "bg-card border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {verified && (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success/20">
                  <Check className="w-3 h-3 text-success" />
                </div>
              )}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
