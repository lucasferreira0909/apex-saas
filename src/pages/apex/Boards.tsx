import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BoardTemplates } from '@/components/apex/BoardTemplates';
import { KanbanBoard } from '@/components/apex/KanbanBoard';
import { useBoards, useBoard, useCreateBoard, useDeleteBoard } from '@/hooks/useBoards';
import { useCreateCard, useUpdateCard, useDeleteCard } from '@/hooks/useBoardCards';
import { BoardTemplate } from '@/types/board';
import { Plus, ArrowLeft, Trash2, Search, MoreHorizontal, Edit } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const {
    data: boards,
    isLoading: loadingBoards
  } = useBoards();
  const {
    data: boardData,
    isLoading: loadingBoard
  } = useBoard(selectedBoardId);
  const createBoard = useCreateBoard();
  const deleteBoard = useDeleteBoard();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();
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
    const columns = selectedTemplate.id === 'leads' ? selectedTemplate.defaultColumns || [] : customColumns.filter(col => col.trim());
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
    const maxOrderIndex = columnCards.length > 0 ? Math.max(...columnCards.map(c => c.order_index)) : -1;
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
    deleteCard.mutate({
      id: cardId,
      board_id: selectedBoardId
    });
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

  // Filter boards based on search
  const filteredBoards = boards?.filter(board => searchTerm === "" || board.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];
  if (selectedBoardId && boardData) {
    return <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedBoardId(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{boardData.board.name}</h1>
              {boardData.board.description && <p className="text-muted-foreground">{boardData.board.description}</p>}
            </div>
          </div>
          
        </div>

        {loadingBoard ? <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Carregando...</p>
          </div> : <KanbanBoard columns={boardData.columns} cards={boardData.cards} onCardMove={handleCardMove} onAddCard={columnId => {
        setSelectedColumnId(columnId);
        setIsAddCardSheetOpen(true);
      }} onDeleteCard={handleDeleteCard} />}

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
                  <Input id="card-title" placeholder="Digite o título do card" value={cardTitle} onChange={e => setCardTitle(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-description">Descrição</Label>
                  <Textarea id="card-description" placeholder="Adicione uma descrição (opcional)" rows={4} value={cardDescription} onChange={e => setCardDescription(e.target.value)} />
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
      </div>;
  }
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quadros</h1>
          <p className="text-muted-foreground">Organize suas tarefas e projetos</p>
        </div>
        <Button onClick={() => setIsCreateSheetOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Quadro
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar quadros..." className="pl-10 bg-input border-border" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Boards List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Meus Quadros ({filteredBoards.length})</CardTitle>
          <CardDescription>Todos os seus quadros organizados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBoards.length === 0 ? <div className="text-center py-12">
              <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhum quadro encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente ajustar a busca" : "Crie seu primeiro quadro para começar"}
              </p>
            </div> : <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBoards.map(board => <TableRow key={board.id} className="cursor-pointer" onClick={() => setSelectedBoardId(board.id)}>
                    <TableCell className="font-medium">{board.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {board.template_type === 'leads' ? 'Leads' : 'Livre'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(board.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={e => {
                      e.stopPropagation();
                      setSelectedBoardId(board.id);
                    }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Abrir
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={e => {
                      e.stopPropagation();
                      handleOpenDeleteDialog(board.id);
                    }}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>}
        </CardContent>
      </Card>

      {/* Create Board Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={open => {
      setIsCreateSheetOpen(open);
      if (!open) {
        setSelectedTemplate(null);
        setBoardName('');
        setBoardDescription('');
        setCustomColumns(['']);
      }
    }}>
        <SheetContent className="sm:max-w-xl md:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {!selectedTemplate ? 'Escolha um Modelo' : 'Configurar Quadro'}
            </SheetTitle>
            <SheetDescription>
              {!selectedTemplate ? 'Selecione o tipo de quadro que deseja criar' : 'Preencha as informações do seu quadro'}
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            {!selectedTemplate ? <BoardTemplates onSelectTemplate={handleTemplateSelect} /> : <div className="grid gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="board-name">Nome do Quadro *</Label>
                  <Input id="board-name" placeholder="Digite o nome do quadro" value={boardName} onChange={e => setBoardName(e.target.value)} />
                </div>
                
                {selectedTemplate.id === 'free' && <div className="flex flex-col gap-2">
                    <Label>Colunas</Label>
                    {customColumns.map((col, index) => <div key={index} className="flex gap-2">
                        <Input placeholder={`Coluna ${index + 1}`} value={col} onChange={e => {
                  const newCols = [...customColumns];
                  newCols[index] = e.target.value;
                  setCustomColumns(newCols);
                }} />
                        {customColumns.length > 1 && <Button variant="outline" size="sm" onClick={() => {
                  setCustomColumns(customColumns.filter((_, i) => i !== index));
                }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>}
                      </div>)}
                    <Button variant="outline" size="sm" onClick={() => setCustomColumns([...customColumns, ''])}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Coluna
                    </Button>
                  </div>}
                {selectedTemplate.id === 'leads' && <div className="flex flex-col gap-2">
                    <Label>Colunas (Pré-definidas)</Label>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {selectedTemplate.defaultColumns?.map((col, index) => <li key={index} className="flex items-center">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                          {col}
                        </li>)}
                    </ul>
                  </div>}
              </div>}
          </SheetBody>
          <SheetFooter>
            {selectedTemplate && <>
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Voltar
                </Button>
                <Button onClick={handleCreateBoard}>Criar Quadro</Button>
              </>}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteBoard} title="Excluir Quadro" description="Tem certeza que deseja excluir este quadro? Todos os cards serão removidos. Esta ação não pode ser desfeita." />
    </div>;
}