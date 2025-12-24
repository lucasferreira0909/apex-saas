import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { RowsBoard } from '@/components/apex/RowsBoard';
import { CardAttachments } from '@/components/apex/CardAttachments';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useBoards, useBoard, useCreateBoard, useDeleteBoard, useDeleteMultipleBoards } from '@/hooks/useBoards';
import { useCreateCard, useUpdateCard, useDeleteCard, useReorderCards, useToggleCardCompleted } from '@/hooks/useBoardCards';
import { useUploadAttachment, useBoardCardAttachments } from '@/hooks/useCardAttachments';
import { useCreateColumn, useUpdateMultipleColumnsOrder, useUpdateColumnTitle, useDeleteColumn, useUpdateColumnIcon } from '@/hooks/useBoardColumns';
import { Board, BoardCard, BoardTemplate } from '@/types/board';
import { Plus, ArrowLeft, Trash2, Search, MoreHorizontal, Edit, Upload, X, FileText, Image, File, Loader2, LayoutGrid, List } from 'lucide-react';
import { icons } from 'lucide-react';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { IconPickerDialog } from '@/components/apex/IconPickerDialog';
import { toast } from 'sonner';

// Helper component to preview column icon
function ColumnIconPreview({ iconName }: { iconName: string }) {
  const LucideIcon = icons[iconName as keyof typeof icons];
  if (!LucideIcon) return null;
  return <LucideIcon className="h-5 w-5" />;
}
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';

export default function Boards() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isTypeSelectSheetOpen, setIsTypeSelectSheetOpen] = useState(false);
  const [selectedBoardType, setSelectedBoardType] = useState<'kanban' | 'rows' | null>(null);
  const [isAddCardSheetOpen, setIsAddCardSheetOpen] = useState(false);
  const [isAddRowsCardSheetOpen, setIsAddRowsCardSheetOpen] = useState(false);
  const [rowsCardTitle, setRowsCardTitle] = useState('');
  const [rowsCardDescription, setRowsCardDescription] = useState('');
  const [rowsCardPriority, setRowsCardPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [pendingRowsFiles, setPendingRowsFiles] = useState<File[]>([]);
  const rowsCardFileInputRef = useRef<HTMLInputElement>(null);
  
  // Read board ID from URL params
  const selectedBoardId = searchParams.get('board');
  
  const setSelectedBoardId = (id: string | null) => {
    if (id) {
      setSearchParams({ board: id });
    } else {
      setSearchParams({});
    }
  };
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [customColumns, setCustomColumns] = useState<string[]>(['']);
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const [cardPriority, setCardPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
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
  const [editingColumnIcon, setEditingColumnIcon] = useState<string | null>(null);
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
  
  // Pending attachments for new card
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const addCardFileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: boards, isLoading: loadingBoards } = useBoards();
  const { data: boardData, isLoading: loadingBoard } = useBoard(selectedBoardId);
  const createBoard = useCreateBoard();
  const deleteBoard = useDeleteBoard();
  const deleteMultipleBoards = useDeleteMultipleBoards();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();
  const reorderCards = useReorderCards();
  const uploadAttachment = useUploadAttachment();
  const toggleCardCompleted = useToggleCardCompleted();
  const updateColumnsOrder = useUpdateMultipleColumnsOrder();
  const updateColumnTitle = useUpdateColumnTitle();
  const updateColumnIcon = useUpdateColumnIcon();
  const deleteColumn = useDeleteColumn();
  const createColumn = useCreateColumn();
  
  // Get card attachments for rows board
  const rowsCardIds = boardData?.board.template_type === 'rows' ? boardData.cards.map(c => c.id) : [];
  const { data: cardAttachmentsMap } = useBoardCardAttachments(rowsCardIds);

  // Toggle card completion handler
  const handleToggleCompleted = (cardId: string, isCompleted: boolean) => {
    if (!selectedBoardId) return;
    toggleCardCompleted.mutate({
      id: cardId,
      board_id: selectedBoardId,
      is_completed: isCompleted
    });
  };

  // Rows board reorder handler
  const handleReorderRowsCards = (cards: Array<{ id: string; order_index: number }>) => {
    if (!selectedBoardId) return;
    reorderCards.mutate({
      board_id: selectedBoardId,
      cards: cards.map(c => ({ id: c.id, order_index: c.order_index }))
    });
  };

  // Board type selection handler
  const handleSelectBoardType = (type: 'kanban' | 'rows') => {
    setSelectedBoardType(type);
    setIsTypeSelectSheetOpen(false);
    setIsCreateSheetOpen(true);
  };

  // Reset create board flow
  const resetCreateFlow = () => {
    setBoardName('');
    setBoardDescription('');
    setCustomColumns(['']);
    setSelectedBoardType(null);
  };

  const handleCreateBoard = async () => {
    if (!boardName.trim()) {
      toast.error('Preencha o nome do quadro');
      return;
    }
    if (!selectedBoardType) {
      toast.error('Selecione o tipo do quadro');
      return;
    }
    
    const columns = selectedBoardType === 'kanban' 
      ? customColumns.filter(col => col.trim())
      : [];
    
    const result = await createBoard.mutateAsync({
      name: boardName,
      description: boardDescription || undefined,
      template_type: selectedBoardType,
      columns: columns.length > 0 ? columns : undefined
    });
    if (result) {
      setIsCreateSheetOpen(false);
      resetCreateFlow();
      setSelectedBoardId(result.id);
    }
  };

  // Add card for rows board
  const handleAddRowsCard = async () => {
    if (!rowsCardTitle.trim() || !selectedBoardId) {
      toast.error('Preencha o nome do elemento');
      return;
    }
    
    const existingCards = boardData?.cards || [];
    const maxOrderIndex = existingCards.length > 0 
      ? Math.max(...existingCards.map(c => c.order_index)) 
      : -1;
    
    // For rows board, we use a default column or create one if needed
    let columnId = boardData?.columns[0]?.id;
    
    if (!columnId) {
      // Create a default column for rows board
      const newColumn = await createColumn.mutateAsync({ 
        boardId: selectedBoardId, 
        title: 'Elementos' 
      });
      columnId = newColumn.id;
    }
    
    const newCard = await createCard.mutateAsync({
      board_id: selectedBoardId,
      column_id: columnId,
      title: rowsCardTitle,
      description: rowsCardDescription || undefined,
      priority: rowsCardPriority,
      order_index: maxOrderIndex + 1
    });
    
    // Upload pending attachments for rows card
    if (pendingRowsFiles.length > 0 && newCard) {
      try {
        for (const file of pendingRowsFiles) {
          await uploadAttachment.mutateAsync({ cardId: newCard.id, file });
        }
      } catch (error) {
        console.error('Error uploading attachments:', error);
      }
    }
    
    setIsAddRowsCardSheetOpen(false);
    setRowsCardTitle('');
    setRowsCardDescription('');
    setRowsCardPriority('medium');
    setPendingRowsFiles([]);
  };

  const handleAddCard = async () => {
    if (!cardTitle.trim() || !selectedColumnId || !selectedBoardId) {
      toast.error('Preencha o título do card');
      return;
    }
    const columnCards = boardData?.cards.filter(c => c.column_id === selectedColumnId) || [];
    const maxOrderIndex = columnCards.length > 0 ? Math.max(...columnCards.map(c => c.order_index)) : -1;
    
    const newCard = await createCard.mutateAsync({
      board_id: selectedBoardId,
      column_id: selectedColumnId,
      title: cardTitle,
      description: cardDescription || undefined,
      priority: cardPriority,
      order_index: maxOrderIndex + 1
    });
    
    // Upload pending attachments
    if (pendingFiles.length > 0 && newCard) {
      setIsUploadingAttachments(true);
      try {
        for (const file of pendingFiles) {
          await uploadAttachment.mutateAsync({ cardId: newCard.id, file });
        }
      } catch (error) {
        console.error('Error uploading attachments:', error);
      }
      setIsUploadingAttachments(false);
    }
    
    setIsAddCardSheetOpen(false);
    setCardTitle('');
    setCardDescription('');
    setCardPriority('medium');
    setPendingFiles([]);
    setSelectedColumnId(null);
  };
  
  const handleAddPendingFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPendingFiles(prev => [...prev, ...Array.from(files)]);
    if (addCardFileInputRef.current) {
      addCardFileInputRef.current.value = '';
    }
  };
  
  const handleRemovePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) return FileText;
    return File;
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

  // Get selected row IDs
  const selectedBoardIds = useMemo(() => {
    return Object.keys(rowSelection).filter(id => rowSelection[id]);
  }, [rowSelection]);

  const handleBulkDelete = async () => {
    if (selectedBoardIds.length > 0) {
      await deleteMultipleBoards.mutateAsync(selectedBoardIds);
      setRowSelection({});
    }
    setBulkDeleteDialogOpen(false);
  };

  // Column handlers
  const handleEditColumn = (columnId: string, currentName: string, currentIcon: string | null) => {
    setEditingColumnId(columnId);
    setEditingColumnName(currentName);
    setEditingColumnIcon(currentIcon);
    setIsEditColumnSheetOpen(true);
  };

  const handleSaveColumn = async () => {
    if (!editingColumnId || !editingColumnName.trim()) {
      toast.error('Digite um nome para a coluna');
      return;
    }
    await updateColumnTitle.mutateAsync({ columnId: editingColumnId, title: editingColumnName });
    if (editingColumnIcon !== boardData?.columns.find(c => c.id === editingColumnId)?.icon) {
      await updateColumnIcon.mutateAsync({ columnId: editingColumnId, icon: editingColumnIcon });
    }
    setIsEditColumnSheetOpen(false);
    setEditingColumnId(null);
    setEditingColumnName('');
    setEditingColumnIcon(null);
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

  const handleSelectIcon = (iconName: string | null) => {
    setEditingColumnIcon(iconName);
    setIsIconPickerOpen(false);
  };

  // Filter boards based on search
  const filteredBoards = useMemo(() => {
    return boards?.filter(board => 
      searchTerm === "" || board.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [boards, searchTerm]);

  const columns = useMemo<ColumnDef<Board>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
          className="translate-y-[2px]"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
      size: 250,
    },
    {
      accessorKey: 'template_type',
      header: 'Tipo',
      cell: (info) => {
        const type = info.getValue() as string;
        if (type === 'kanban') return <Badge variant="secondary">Kanban</Badge>;
        if (type === 'rows') return <Badge variant="outline">Checklist</Badge>;
        return <Badge variant="secondary">Livre</Badge>;
      },
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
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const isLeadsBoard = false; // Leads template removed - all boards are free boards
  const isRowsBoard = boardData?.board.template_type === 'rows';

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
          {!isLeadsBoard && !isRowsBoard && (
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
        ) : isRowsBoard ? (
          <RowsBoard
            cards={boardData.cards.map(c => ({
              id: c.id,
              title: c.title,
              description: c.description,
              priority: c.priority,
              order_index: c.order_index,
              is_completed: c.is_completed ?? false,
              attachments: cardAttachmentsMap?.[c.id] || []
            }))}
            onAddCard={() => setIsAddRowsCardSheetOpen(true)}
            onEditCard={(card) => {
              const fullCard = boardData.cards.find(c => c.id === card.id);
              if (fullCard) handleEditCard(fullCard);
            }}
            onDeleteCard={handleDeleteCard}
            onReorderCards={handleReorderRowsCards}
            onToggleCompleted={handleToggleCompleted}
          />
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
                  <Label>Anexos</Label>
                  <div className="flex flex-col gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={() => addCardFileInputRef.current?.click()}
                      className="w-fit"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Anexar arquivo
                    </Button>
                    <input
                      ref={addCardFileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleAddPendingFile}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                    />
                    {pendingFiles.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-1">
                        {pendingFiles.map((file, index) => {
                          const FileIcon = getFileIcon(file.type);
                          return (
                            <div 
                              key={index}
                              className="flex items-center gap-2 p-2 rounded-md border bg-muted/30 group"
                            >
                              <div className="h-8 w-8 flex items-center justify-center bg-muted rounded">
                                <FileIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="flex-1 text-sm truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleRemovePendingFile(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SheetBody>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
              <Button onClick={handleAddCard} disabled={isUploadingAttachments || createCard.isPending}>
                {(isUploadingAttachments || createCard.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Adicionar
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Column Sheet */}
        <Sheet open={isEditColumnSheetOpen} onOpenChange={setIsEditColumnSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Editar Coluna</SheetTitle>
              <SheetDescription>Altere as configurações da coluna</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <div className="grid gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="column-name">Nome da Coluna *</Label>
                  <Input 
                    id="column-name" 
                    placeholder="Digite o nome da coluna" 
                    value={editingColumnName} 
                    onChange={e => setEditingColumnName(e.target.value)} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Ícone da Coluna</Label>
                  <div className="flex items-center gap-2">
                    {editingColumnIcon ? (
                      <ColumnIconPreview iconName={editingColumnIcon} />
                    ) : (
                      <span className="text-sm text-muted-foreground">Nenhum ícone selecionado</span>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setIsIconPickerOpen(true)}>
                      {editingColumnIcon ? 'Alterar' : 'Adicionar'}
                    </Button>
                    {editingColumnIcon && (
                      <Button variant="ghost" size="sm" onClick={() => setEditingColumnIcon(null)}>
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </SheetBody>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
              <Button onClick={handleSaveColumn}>Salvar</Button>
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
                {editingCard && (
                  <CardAttachments cardId={editingCard.id} />
                )}
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
          currentIcon={editingColumnIcon}
        />

        {/* Add Rows Card Sheet */}
        <Sheet open={isAddRowsCardSheetOpen} onOpenChange={open => {
          setIsAddRowsCardSheetOpen(open);
          if (!open) {
            setRowsCardTitle('');
            setRowsCardDescription('');
            setRowsCardPriority('medium');
            setPendingRowsFiles([]);
          }
        }}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Adicionar Elemento</SheetTitle>
              <SheetDescription>Preencha as informações do novo elemento</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <div className="grid gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="rows-card-title">Nome *</Label>
                  <Input 
                    id="rows-card-title" 
                    placeholder="Digite o nome do elemento" 
                    value={rowsCardTitle} 
                    onChange={e => setRowsCardTitle(e.target.value)} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="rows-card-description">Descrição</Label>
                  <Textarea 
                    id="rows-card-description" 
                    placeholder="Digite a descrição do elemento" 
                    rows={4} 
                    value={rowsCardDescription} 
                    onChange={e => setRowsCardDescription(e.target.value)} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Prioridade</Label>
                  <Select value={rowsCardPriority} onValueChange={(val) => setRowsCardPriority(val as 'low' | 'medium' | 'high')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Anexos</Label>
                  <div className="flex flex-col gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={() => rowsCardFileInputRef.current?.click()}
                      className="w-fit"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Anexar arquivo
                    </Button>
                    <input
                      ref={rowsCardFileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) setPendingRowsFiles(prev => [...prev, ...Array.from(files)]);
                        if (rowsCardFileInputRef.current) rowsCardFileInputRef.current.value = '';
                      }}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                    />
                    {pendingRowsFiles.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-1">
                        {pendingRowsFiles.map((file, index) => {
                          const FileIcon = getFileIcon(file.type);
                          return (
                            <div 
                              key={index}
                              className="flex items-center gap-2 p-2 rounded-md border bg-muted/30 group"
                            >
                              <div className="h-8 w-8 flex items-center justify-center bg-muted rounded">
                                <FileIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="flex-1 text-sm truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setPendingRowsFiles(prev => prev.filter((_, i) => i !== index))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SheetBody>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
              <Button onClick={handleAddRowsCard} disabled={createCard.isPending || uploadAttachment.isPending}>
                {(createCard.isPending || uploadAttachment.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Adicionar
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
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
        <Button onClick={() => setIsTypeSelectSheetOpen(true)}>
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
        
        {/* Bulk delete button */}
        {selectedBoardIds.length > 0 && (
          <Button 
            variant="destructive" 
            onClick={() => setBulkDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir {selectedBoardIds.length} selecionado{selectedBoardIds.length > 1 ? 's' : ''}
          </Button>
        )}
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

      {/* Type Selection Sheet */}
      <Sheet open={isTypeSelectSheetOpen} onOpenChange={open => {
        setIsTypeSelectSheetOpen(open);
        if (!open) resetCreateFlow();
      }}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Escolha o tipo de quadro</SheetTitle>
            <SheetDescription>Selecione o formato que melhor se adapta às suas necessidades</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className="grid gap-4">
              <Card 
                className="bg-card border-border hover:shadow-lg transition-all cursor-pointer hover:border-primary"
                onClick={() => handleSelectBoardType('kanban')}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <LayoutGrid className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">Kanban</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    Organize seus cards em colunas arrastáveis. Ideal para gerenciar fluxos de trabalho e processos.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card 
                className="bg-card border-border hover:shadow-lg transition-all cursor-pointer hover:border-primary"
                onClick={() => handleSelectBoardType('rows')}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <List className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">Checklist</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    Visualize seus elementos em formato de lista. Ideal para anotações, listas e conteúdos simples.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </SheetBody>
        </SheetContent>
      </Sheet>

      {/* Create Board Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={open => {
        setIsCreateSheetOpen(open);
        if (!open) resetCreateFlow();
      }}>
        <SheetContent className="sm:max-w-xl md:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Novo Quadro {selectedBoardType === 'kanban' ? 'Kanban' : 'Checklist'}</SheetTitle>
            <SheetDescription>Preencha as informações do seu quadro</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className="grid gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="board-name">Nome do Quadro *</Label>
                <Input id="board-name" placeholder="Digite o nome do quadro" value={boardName} onChange={e => setBoardName(e.target.value)} />
              </div>
              
              {selectedBoardType === 'kanban' && (
                <div className="flex flex-col gap-2">
                  <Label>Colunas (opcional)</Label>
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
              )}
            </div>
          </SheetBody>
          <SheetFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateSheetOpen(false);
              setIsTypeSelectSheetOpen(true);
            }}>Voltar</Button>
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

      {/* Bulk Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        open={bulkDeleteDialogOpen} 
        onOpenChange={setBulkDeleteDialogOpen} 
        onConfirm={handleBulkDelete} 
        title="Excluir Quadros Selecionados" 
        description={`Tem certeza que deseja excluir ${selectedBoardIds.length} quadros? Todos os cards serão removidos. Esta ação não pode ser desfeita.`} 
      />
    </div>
  );
}
