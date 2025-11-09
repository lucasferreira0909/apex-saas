import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BoardTemplates } from '@/components/apex/BoardTemplates';
import { KanbanBoard } from '@/components/apex/KanbanBoard';
import { useBoards, useBoard, useCreateBoard, useDeleteBoard } from '@/hooks/useBoards';
import { useCreateCard, useUpdateCard, useDeleteCard, useUpdateMultipleCards } from '@/hooks/useBoardCards';
import { BoardTemplate } from '@/types/board';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { toast } from 'sonner';

export default function Boards() {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isAddCardSheetOpen, setIsAddCardSheetOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [customColumns, setCustomColumns] = useState<string[]>(['']);
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const [cardPriority, setCardPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);

  const { data: boards, isLoading: loadingBoards } = useBoards();
  const { data: boardData, isLoading: loadingBoard } = useBoard(selectedBoardId);
  const createBoard = useCreateBoard();
  const deleteBoard = useDeleteBoard();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();
  const updateMultipleCards = useUpdateMultipleCards();

  const handleTemplateSelect = (template: BoardTemplate) => {
    setSelectedTemplate(template);
    if (template.id === 'leads') {
      setCustomColumns(template.defaultColumns || []);
    } else {
      setCustomColumns(['']);
    }
  };

  const handleCreateBoard = async () => {
    if (!boardName.trim() || !selectedTemplate) {
      toast.error('Preencha o nome do quadro');
      return;
    }

    const columns = selectedTemplate.id === 'leads' 
      ? selectedTemplate.defaultColumns || []
      : customColumns.filter(col => col.trim());

    if (columns.length === 0) {
      toast.error('Adicione pelo menos uma coluna');
      return;
    }

    const result = await createBoard.mutateAsync({
      name: boardName,
      description: boardDescription || undefined,
      template_type: selectedTemplate.id,
      columns
    });

    if (result) {
      setIsCreateSheetOpen(false);
      setSelectedTemplate(null);
      setBoardName('');
      setBoardDescription('');
      setCustomColumns(['']);
      setSelectedBoardId(result.id);
    }
  };

  const handleAddCard = async () => {
    if (!cardTitle.trim() || !selectedColumnId || !selectedBoardId) {
      toast.error('Preencha o título do card');
      return;
    }

    const columnCards = boardData?.cards.filter(c => c.column_id === selectedColumnId) || [];
    const maxOrderIndex = columnCards.length > 0 
      ? Math.max(...columnCards.map(c => c.order_index))
      : -1;

    await createCard.mutateAsync({
      board_id: selectedBoardId,
      column_id: selectedColumnId,
      title: cardTitle,
      description: cardDescription || undefined,
      priority: cardPriority,
      order_index: maxOrderIndex + 1
    });

    setIsAddCardSheetOpen(false);
    setCardTitle('');
    setCardDescription('');
    setCardPriority('medium');
    setSelectedColumnId(null);
  };

  const handleCardMove = (cardId: string, newColumnId: string, newOrderIndex: number) => {
    if (!selectedBoardId) return;
    updateCard.mutate({
      id: cardId,
      board_id: selectedBoardId,
      column_id: newColumnId,
      order_index: newOrderIndex
    });
  };

  const handleDeleteCard = (cardId: string) => {
    if (!selectedBoardId) return;
    deleteCard.mutate({ id: cardId, board_id: selectedBoardId });
  };

  const handleDeleteBoard = async () => {
    if (!boardToDelete) return;
    await deleteBoard.mutateAsync(boardToDelete);
    if (selectedBoardId === boardToDelete) {
      setSelectedBoardId(null);
    }
    setDeleteDialogOpen(false);
    setBoardToDelete(null);
  };

  const handleOpenDeleteDialog = (boardId: string) => {
    setBoardToDelete(boardId);
    setDeleteDialogOpen(true);
  };

  if (selectedBoardId && boardData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedBoardId(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{boardData.board.name}</h1>
              {boardData.board.description && (
                <p className="text-sm text-muted-foreground">{boardData.board.description}</p>
              )}
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleOpenDeleteDialog(boardData.board.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Quadro
          </Button>
        </div>

        {loadingBoard ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <KanbanBoard
            columns={boardData.columns}
            cards={boardData.cards}
            onCardMove={handleCardMove}
            onAddCard={(columnId) => {
              setSelectedColumnId(columnId);
              setIsAddCardSheetOpen(true);
            }}
            onDeleteCard={handleDeleteCard}
          />
        )}

        <Sheet open={isAddCardSheetOpen} onOpenChange={setIsAddCardSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Adicionar Card</SheetTitle>
              <SheetDescription>Preencha as informações do novo card</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <div className="grid gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-title">Título *</Label>
                  <Input
                    id="card-title"
                    placeholder="Digite o título do card"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-description">Descrição</Label>
                  <Textarea
                    id="card-description"
                    placeholder="Adicione uma descrição (opcional)"
                    rows={4}
                    value={cardDescription}
                    onChange={(e) => setCardDescription(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-priority">Prioridade</Label>
                  <Select value={cardPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setCardPriority(value)}>
                    <SelectTrigger id="card-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetBody>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
              <Button onClick={handleAddCard}>Adicionar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quadros</h1>
        <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Quadro
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {!selectedTemplate ? 'Escolha um Modelo' : 'Configurar Quadro'}
              </SheetTitle>
              <SheetDescription>
                {!selectedTemplate 
                  ? 'Selecione o tipo de quadro que deseja criar'
                  : 'Preencha as informações do seu quadro'}
              </SheetDescription>
            </SheetHeader>
            <SheetBody>
              {!selectedTemplate ? (
                <BoardTemplates onSelectTemplate={handleTemplateSelect} />
              ) : (
                <div className="grid gap-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="board-name">Nome do Quadro *</Label>
                    <Input
                      id="board-name"
                      placeholder="Digite o nome do quadro"
                      value={boardName}
                      onChange={(e) => setBoardName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="board-description">Descrição</Label>
                    <Textarea
                      id="board-description"
                      placeholder="Adicione uma descrição (opcional)"
                      rows={3}
                      value={boardDescription}
                      onChange={(e) => setBoardDescription(e.target.value)}
                    />
                  </div>
                  {selectedTemplate.id === 'free' && (
                    <div className="flex flex-col gap-2">
                      <Label>Colunas</Label>
                      {customColumns.map((col, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Coluna ${index + 1}`}
                            value={col}
                            onChange={(e) => {
                              const newCols = [...customColumns];
                              newCols[index] = e.target.value;
                              setCustomColumns(newCols);
                            }}
                          />
                          {customColumns.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCustomColumns(customColumns.filter((_, i) => i !== index));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomColumns([...customColumns, ''])}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Coluna
                      </Button>
                    </div>
                  )}
                  {selectedTemplate.id === 'leads' && (
                    <div className="flex flex-col gap-2">
                      <Label>Colunas (Pré-definidas)</Label>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {selectedTemplate.defaultColumns?.map((col, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                            {col}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </SheetBody>
            <SheetFooter>
              {selectedTemplate && (
                <>
                  <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                    Voltar
                  </Button>
                  <Button onClick={handleCreateBoard}>Criar Quadro</Button>
                </>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {loadingBoards ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : boards && boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <Card
              key={board.id}
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setSelectedBoardId(board.id)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{board.name}</CardTitle>
                {board.description && (
                  <CardDescription className="text-xs">{board.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">
                    {board.template_type === 'leads' ? 'Quadro de Leads' : 'Quadro Livre'}
                  </span>
                  <span>{new Date(board.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground mb-4">Nenhum quadro criado ainda</p>
          <Button onClick={() => setIsCreateSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Quadro
          </Button>
        </div>
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteBoard}
        title="Excluir Quadro"
        description="Tem certeza que deseja excluir este quadro? Todos os cards serão removidos. Esta ação não pode ser desfeita."
      />
    </div>
  );
}
