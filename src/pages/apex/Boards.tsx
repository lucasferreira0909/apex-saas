import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { KanbanBoard } from '@/components/apex/KanbanBoard';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useBoards, useBoard, useCreateBoard, useDeleteBoard } from '@/hooks/useBoards';
import { useCreateCard, useUpdateCard, useDeleteCard } from '@/hooks/useBoardCards';
import { useCreateColumn, useUpdateMultipleColumnsOrder, useUpdateColumnTitle, useDeleteColumn, useUpdateColumnIcon } from '@/hooks/useBoardColumns';
import { Board, BoardCard, BoardTemplate } from '@/types/board';
import { Plus, ArrowLeft, Trash2, Search, MoreHorizontal, Edit } from 'lucide-react';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { IconPickerDialog } from '@/components/apex/IconPickerDialog';
import { toast } from 'sonner';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

export default function Boards() {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isAddCardSheetOpen, setIsAddCardSheetOpen] = useState(false);
  
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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);
  
  // Column editing states
  const [isEditColumnSheetOpen, setIsEditColumnSheetOpen] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [columnDeleteDialogOpen, setColumnDeleteDialogOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  
  // Add column states
  const [isAddColumnSheetOpen, setIsAddColumnSheetOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  
  // Card delete confirmation states
  const [cardDeleteDialogOpen, setCardDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  
  // Card editing states
  const [isEditCardSheetOpen, setIsEditCardSheetOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<BoardCard | null>(null);
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardDescription, setEditCardDescription] = useState('');
  const [editCardPriority, setEditCardPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Icon picker states
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconPickerColumnId, setIconPickerColumnId] = useState<string | null>(null);
  const { data: boards, isLoading: loadingBoards } = useBoards();
  const { data: boardData, isLoading: loadingBoard } = useBoard(selectedBoardId);
  const createBoard = useCreateBoard();
  const deleteBoard = useDeleteBoard();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();
  const updateColumnsOrder = useUpdateMultipleColumnsOrder();
  const updateColumnTitle = useUpdateColumnTitle();
  const updateColumnIcon = useUpdateColumnIcon();
  const deleteColumn = useDeleteColumn();
  const createColumn = useCreateColumn();

  // Pre-select free template (only template available)
  const freeTemplate: BoardTemplate = {
    id: 'free',
    title: 'Quadro Livre',
    description: 'Crie seu próprio quadro personalizado com colunas customizáveis',
    icon: null as any,
    color: 'text-purple-600',
    features: ['Colunas personalizadas', 'Flexibilidade total', 'Adaptável a qualquer processo'],
    defaultColumns: []
  };

  const handleCreateBoard = async () => {
    if (!boardName.trim()) {
      toast.error('Preencha o nome do quadro');
      return;
    }
    const columns = customColumns.filter(col => col.trim());
    if (columns.length === 0) {
      toast.error('Adicione pelo menos uma coluna');
      return;
    }
    const result = await createBoard.mutateAsync({
      name: boardName,
      description: boardDescription || undefined,
      template_type: 'free',
      columns
    });
    if (result) {
      setIsCreateSheetOpen(false);
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

  const handleColumnMove = (columnId: string, newOrderIndex: number) => {
    if (!boardData) return;
    
    const updates = boardData.columns.map((col, idx) => {
      if (col.id === columnId) {
        return { id: col.id, order_index: newOrderIndex };
      }
      // Adjust other columns
      if (col.order_index >= newOrderIndex) {
        return { id: col.id, order_index: col.order_index + 1 };
      }
      return { id: col.id, order_index: col.order_index };
    });

    updateColumnsOrder.mutate(updates);
  };

  const handleDeleteCard = (cardId: string) => {
    setCardToDelete(cardId);
    setCardDeleteDialogOpen(true);
  };

  const handleConfirmDeleteCard = () => {
    if (!selectedBoardId || !cardToDelete) return;
    deleteCard.mutate({
      id: cardToDelete,
      board_id: selectedBoardId
    });
    setCardDeleteDialogOpen(false);
    setCardToDelete(null);
  };

  // Add column handler
  const handleAddColumn = async () => {
    if (!selectedBoardId || !newColumnName.trim()) {
      toast.error('Digite um nome para a coluna');
      return;
    }
    await createColumn.mutateAsync({ boardId: selectedBoardId, title: newColumnName });
    setIsAddColumnSheetOpen(false);
    setNewColumnName('');
  };

  // Edit card handlers
  const handleEditCard = (card: BoardCard) => {
    setEditingCard(card);
    setEditCardTitle(card.title);
    setEditCardDescription(card.description || '');
    setEditCardPriority((card.priority as 'low' | 'medium' | 'high') || 'medium');
    setIsEditCardSheetOpen(true);
  };

  const handleSaveCard = async () => {
    if (!editingCard || !selectedBoardId || !editCardTitle.trim()) {
      toast.error('Preencha o título do card');
      return;
    }
    await updateCard.mutateAsync({
      id: editingCard.id,
      board_id: selectedBoardId,
      title: editCardTitle,
      description: editCardDescription || undefined,
      priority: editCardPriority
    });
    toast.success('Card atualizado');
    setIsEditCardSheetOpen(false);
    setEditingCard(null);
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

  // Column handlers
  const handleEditColumn = (columnId: string, currentName: string) => {
    setEditingColumnId(columnId);
    setEditingColumnName(currentName);
    setIsEditColumnSheetOpen(true);
  };

  const handleSaveColumnName = async () => {
    if (!editingColumnId || !editingColumnName.trim()) {
      toast.error('Digite um nome para a coluna');
      return;
    }
    await updateColumnTitle.mutateAsync({ columnId: editingColumnId, title: editingColumnName });
    setIsEditColumnSheetOpen(false);
    setEditingColumnId(null);
    setEditingColumnName('');
  };

  const handleOpenDeleteColumnDialog = (columnId: string) => {
    setColumnToDelete(columnId);
    setColumnDeleteDialogOpen(true);
  };

  const handleDeleteColumn = async () => {
    if (!columnToDelete) return;
    await deleteColumn.mutateAsync(columnToDelete);
    setColumnDeleteDialogOpen(false);
    setColumnToDelete(null);
  };

  // Icon picker handlers
  const handleEditColumnIcon = (columnId: string) => {
    setIconPickerColumnId(columnId);
    setIsIconPickerOpen(true);
  };

  const handleSelectIcon = async (iconName: string | null) => {
    if (!iconPickerColumnId) return;
    await updateColumnIcon.mutateAsync({ columnId: iconPickerColumnId, icon: iconName });
    setIconPickerColumnId(null);
  };

  // Filter boards based on search
  const filteredBoards = useMemo(() => {
    return boards?.filter(board => 
      searchTerm === "" || board.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [boards, searchTerm]);

  const columns = useMemo<ColumnDef<Board>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
      size: 250,
    },
    {
      accessorKey: 'template_type',
      header: 'Tipo',
      cell: () => (
        <Badge variant="secondary">Livre</Badge>
      ),
      size: 120,
    },
    {
      accessorKey: 'created_at',
      header: 'Criado em',
      cell: (info) => new Date(info.getValue() as string).toLocaleDateString('pt-BR'),
      size: 150,
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setSelectedBoardId(row.original.id);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Abrir
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDeleteDialog(row.original.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      size: 80,
      enableSorting: false,
      meta: {
        headerClassName: 'text-right',
        cellClassName: 'text-right',
      },
    },
  ], []);

  const table = useReactTable({
    columns,
    data: filteredBoards,
    pageCount: Math.ceil(filteredBoards.length / pagination.pageSize),
    getRowId: (row) => row.id,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const isLeadsBoard = false; // Leads template removed - all boards are free boards

  if (selectedBoardId && boardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedBoardId(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{boardData.board.name}</h1>
              {boardData.board.description && <p className="text-muted-foreground">{boardData.board.description}</p>}
            </div>
          </div>
          {!isLeadsBoard && (
            <Button onClick={() => setIsAddColumnSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Coluna
            </Button>
          )}
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
            onColumnMove={handleColumnMove}
            onAddCard={columnId => {
              setSelectedColumnId(columnId);
              setIsAddCardSheetOpen(true);
            }} 
            onDeleteCard={handleDeleteCard}
            onEditColumn={handleEditColumn}
            onDeleteColumn={handleOpenDeleteColumnDialog}
            onEditCard={handleEditCard}
            onEditColumnIcon={handleEditColumnIcon}
            hideColumnActions={isLeadsBoard}
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

        {/* Edit Column Sheet */}
        <Sheet open={isEditColumnSheetOpen} onOpenChange={setIsEditColumnSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Editar Coluna</SheetTitle>
              <SheetDescription>Altere o nome da coluna</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <div className="flex flex-col gap-2">
                <Label htmlFor="column-name">Nome da Coluna *</Label>
                <Input 
                  id="column-name" 
                  placeholder="Digite o nome da coluna" 
                  value={editingColumnName} 
                  onChange={e => setEditingColumnName(e.target.value)} 
                />
              </div>
            </SheetBody>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
              <Button onClick={handleSaveColumnName}>Salvar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Delete Column Dialog */}
        <DeleteConfirmationDialog
          open={columnDeleteDialogOpen}
          onOpenChange={setColumnDeleteDialogOpen}
          onConfirm={handleDeleteColumn}
          title="Excluir Coluna"
          description="Tem certeza que deseja excluir esta coluna? Todos os cards nela serão excluídos também."
        />

        {/* Delete Card Dialog */}
        <DeleteConfirmationDialog
          open={cardDeleteDialogOpen}
          onOpenChange={setCardDeleteDialogOpen}
          onConfirm={handleConfirmDeleteCard}
          title="Excluir Card"
          description="Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita."
        />

        {/* Add Column Sheet */}
        <Sheet open={isAddColumnSheetOpen} onOpenChange={setIsAddColumnSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Nova Coluna</SheetTitle>
              <SheetDescription>Adicione uma nova coluna ao quadro</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-column-name">Nome da Coluna *</Label>
                <Input 
                  id="new-column-name" 
                  placeholder="Digite o nome da coluna" 
                  value={newColumnName} 
                  onChange={e => setNewColumnName(e.target.value)} 
                />
              </div>
            </SheetBody>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
              <Button onClick={handleAddColumn}>Criar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Card Sheet */}
        <Sheet open={isEditCardSheetOpen} onOpenChange={setIsEditCardSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Editar Card</SheetTitle>
              <SheetDescription>Altere as informações do card</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <div className="grid gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-card-title">Título *</Label>
                  <Input 
                    id="edit-card-title" 
                    placeholder="Digite o título do card" 
                    value={editCardTitle} 
                    onChange={e => setEditCardTitle(e.target.value)} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-card-description">Descrição</Label>
                  <Textarea 
                    id="edit-card-description" 
                    placeholder="Adicione uma descrição (opcional)" 
                    rows={4} 
                    value={editCardDescription} 
                    onChange={e => setEditCardDescription(e.target.value)} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-card-priority">Prioridade</Label>
                  <Select value={editCardPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setEditCardPriority(value)}>
                    <SelectTrigger id="edit-card-priority">
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
              <Button onClick={handleSaveCard}>Salvar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Icon Picker Dialog */}
        <IconPickerDialog
          open={isIconPickerOpen}
          onOpenChange={setIsIconPickerOpen}
          onSelect={handleSelectIcon}
          currentIcon={iconPickerColumnId ? boardData.columns.find(c => c.id === iconPickerColumnId)?.icon : null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <Input 
            placeholder="Buscar quadros..." 
            className="pl-10 bg-input border-border" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* Boards List with DataGrid */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Meus Quadros</CardTitle>
          <CardDescription>Todos os seus quadros organizados</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredBoards.length === 0 ? (
            <div className="text-center py-12 px-6">
              <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhum quadro encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente ajustar a busca" : "Crie seu primeiro quadro para começar"}
              </p>
            </div>
          ) : (
            <DataGrid table={table} recordCount={filteredBoards.length}>
              <div className="w-full">
                <DataGridContainer className="border-0 rounded-none">
                  <ScrollArea>
                    <DataGridTable />
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </DataGridContainer>
                <DataGridPagination className="border-t px-4" />
              </div>
            </DataGrid>
          )}
        </CardContent>
      </Card>

      {/* Create Board Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={open => {
        setIsCreateSheetOpen(open);
        if (!open) {
          setBoardName('');
          setBoardDescription('');
          setCustomColumns(['']);
        }
      }}>
        <SheetContent className="sm:max-w-xl md:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Novo Quadro</SheetTitle>
            <SheetDescription>Preencha as informações do seu quadro</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className="grid gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="board-name">Nome do Quadro *</Label>
                <Input id="board-name" placeholder="Digite o nome do quadro" value={boardName} onChange={e => setBoardName(e.target.value)} />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label>Colunas</Label>
                {customColumns.map((col, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      placeholder={`Coluna ${index + 1}`} 
                      value={col} 
                      onChange={e => {
                        const newCols = [...customColumns];
                        newCols[index] = e.target.value;
                        setCustomColumns(newCols);
                      }} 
                    />
                    {customColumns.length > 1 && (
                      <Button variant="outline" size="icon" onClick={() => {
                        setCustomColumns(customColumns.filter((_, i) => i !== index));
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setCustomColumns([...customColumns, ''])}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Coluna
                </Button>
              </div>
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancelar</Button>
            </SheetClose>
            <Button onClick={handleCreateBoard}>Criar Quadro</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
