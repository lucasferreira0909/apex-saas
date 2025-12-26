import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Search } from "lucide-react";
import { useState } from "react";
import { useFunnels } from "@/hooks/useFunnels";
import { useBoards } from "@/hooks/useBoards";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentItem {
  id: string;
  name: string;
  type: "funnel" | "board";
  updatedAt: string;
  owner: {
    name: string;
    avatar?: string;
  };
}

export function RecentItemsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: funnels } = useFunnels();
  const { data: boards } = useBoards();
  const { profile } = useAuth();

  const ownerName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : profile?.email?.split("@")[0] || "User";

  // Combine and sort items by updated_at
  const recentItems: RecentItem[] = [
    ...(funnels || []).map((funnel) => ({
      id: funnel.id,
      name: funnel.name,
      type: "funnel" as const,
      updatedAt: funnel.updated_at,
      owner: {
        name: ownerName,
        avatar: profile?.avatar_url || undefined,
      },
    })),
    ...(boards || []).map((board) => ({
      id: board.id,
      name: board.name,
      type: "board" as const,
      updatedAt: board.updated_at,
      owner: {
        name: ownerName,
        avatar: profile?.avatar_url || undefined,
      },
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const filteredItems = recentItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-card border-border rounded-xl h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          Recent Funnels/Boards
        </CardTitle>
        <div className="relative w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-border"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No items found</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-muted/50 ${
                  index % 2 === 0 ? "bg-transparent" : "bg-muted/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={item.owner.avatar} />
                    <AvatarFallback className="text-xs">
                      {item.owner.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground min-w-[100px] text-right">
                    {format(new Date(item.updatedAt), "dd MMM yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
