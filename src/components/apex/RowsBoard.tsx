import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MoreHorizontal, Edit, Trash2, GripVertical, FileText, Image, File, Link as LinkIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sortable, SortableItem, SortableItemHandle } from "@/components/ui/sortable";
import { CardAttachment } from "@/hooks/useCardAttachments";

interface RowsCard {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  order_index: number;
  is_completed: boolean;
  attachments?: CardAttachment[];
}

interface RowsBoardProps {
  cards: RowsCard[];
  onAddCard: () => void;
  onEditCard: (card: RowsCard) => void;
  onDeleteCard: (cardId: string) => void;
  onReorderCards?: (cards: RowsCard[]) => void;
  onToggleCompleted?: (cardId: string, isCompleted: boolean) => void;
}

interface SortableCardContentProps {
  card: RowsCard;
  onEditCard: (card: RowsCard) => void;
  onDeleteCard: (cardId: string) => void;
  onToggleCompleted?: (cardId: string, isCompleted: boolean) => void;
  listeners?: any;
  isDragging?: boolean;
}

function getPriorityBadge(priority: 'low' | 'medium' | 'high' | null) {
  switch (priority) {
    case 'high':
      return <Badge variant="destructive" className="text-xs">Alta</Badge>;
    case 'medium':
      return <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-600 hover:bg-amber-500/30">Média</Badge>;
    case 'low':
      return <Badge variant="secondary" className="text-xs bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30">Baixa</Badge>;
    default:
      return null;
  }
}

function getFileIcon(fileType: string | null) {
  if (!fileType) return File;
  if (fileType.startsWith('image/')) return Image;
  if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) return FileText;
  return File;
}

function isExternalLink(url: string) {
  return url.startsWith('http://') || url.startsWith('https://');
}

function SortableCardContent({ card, onEditCard, onDeleteCard, onToggleCompleted, listeners, isDragging }: SortableCardContentProps) {
  const attachments = card.attachments || [];
  
  return (
    <Card className={`bg-card border-border transition-all ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : 'hover:shadow-md'} ${card.is_completed ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 mt-0.5">
            <Checkbox 
              checked={card.is_completed}
              onCheckedChange={(checked) => onToggleCompleted?.(card.id, checked as boolean)}
              className="h-5 w-5"
            />
            <SortableItemHandle listeners={listeners} className="text-muted-foreground hover:text-foreground">
              <GripVertical className="h-5 w-5" />
            </SortableItemHandle>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className={`font-medium text-foreground truncate ${card.is_completed ? 'line-through' : ''}`}>
                {card.title}
              </h3>
              {getPriorityBadge(card.priority)}
            </div>
            
            {card.description && (
              <p className={`text-sm text-muted-foreground whitespace-pre-wrap line-clamp-2 ${card.is_completed ? 'line-through' : ''}`}>
                {card.description}
              </p>
            )}
            
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {attachments.map((attachment) => {
                  const FileIcon = getFileIcon(attachment.file_type);
                  const isLink = isExternalLink(attachment.file_url);
                  
                  return (
                    <a
                      key={attachment.id}
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isLink ? (
                        <LinkIcon className="h-3.5 w-3.5" />
                      ) : (
                        <FileIcon className="h-3.5 w-3.5" />
                      )}
                      <span className="truncate max-w-[120px]">{attachment.file_name}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditCard(card)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDeleteCard(card.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

type StatusFilter = 'all' | 'completed' | 'pending';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high';

export function RowsBoard({ cards, onAddCard, onEditCard, onDeleteCard, onReorderCards, onToggleCompleted }: RowsBoardProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  // Apply filters
  const filteredCards = cards.filter(card => {
    if (statusFilter === 'completed' && !card.is_completed) return false;
    if (statusFilter === 'pending' && card.is_completed) return false;
    if (priorityFilter !== 'all' && card.priority !== priorityFilter) return false;
    return true;
  });

  const sortedCards = [...filteredCards].sort((a, b) => a.order_index - b.order_index);

  const handleValueChange = (newCards: RowsCard[]) => {
    const updatedCards = newCards.map((card, index) => ({
      ...card,
      order_index: index,
    }));
    
    if (onReorderCards) {
      onReorderCards(updatedCards);
    }
  };

  const getItemValue = (card: RowsCard) => card.id;

  const completedCount = cards.filter(c => c.is_completed).length;
  const pendingCount = cards.filter(c => !c.is_completed).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as StatusFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas ({cards.length})</SelectItem>
              <SelectItem value="pending">Pendentes ({pendingCount})</SelectItem>
              <SelectItem value="completed">Concluídas ({completedCount})</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val as PriorityFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as prioridades</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={onAddCard}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Elemento
        </Button>
      </div>

      {sortedCards.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {cards.length === 0 
                ? 'Nenhum elemento adicionado ainda' 
                : 'Nenhum elemento encontrado com os filtros selecionados'}
            </p>
            {cards.length === 0 && (
              <Button variant="outline" onClick={onAddCard}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeiro elemento
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Sortable
          value={sortedCards}
          onValueChange={handleValueChange}
          getItemValue={getItemValue}
        >
          {sortedCards.map((card) => (
            <SortableItem key={card.id} value={card.id}>
              <SortableCardContent
                card={card}
                onEditCard={onEditCard}
                onDeleteCard={onDeleteCard}
                onToggleCompleted={onToggleCompleted}
              />
            </SortableItem>
          ))}
        </Sortable>
      )}
    </div>
  );
}