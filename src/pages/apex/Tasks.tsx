import { useState } from "react";
import { CheckSquare, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}
const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const addTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um título para a tarefa",
        variant: "destructive"
      });
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      createdAt: new Date()
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setIsSheetOpen(false);
    toast({
      title: "Tarefa criada",
      description: "Sua tarefa foi adicionada com sucesso"
    });
  };
  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? {
      ...task,
      completed: !task.completed
    } : task));
  };
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
      title: "Tarefa removida",
      description: "A tarefa foi excluída com sucesso"
    });
  };
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  return <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tarefas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas tarefas e acompanhe seu progresso
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              {completedCount} de {totalCount} concluídas
            </span>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Tarefa
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Nova Tarefa</SheetTitle>
                <SheetDescription>
                  Crie uma nova tarefa para acompanhar suas atividades
                </SheetDescription>
              </SheetHeader>
              <SheetBody>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Título da Tarefa</Label>
                    <Input
                      id="task-title"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Ex: Revisar proposta comercial"
                      className="bg-input border-border"
                    />
                  </div>
                </div>
              </SheetBody>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </SheetClose>
                <Button onClick={addTask} disabled={!newTaskTitle.trim()}>
                  Criar Tarefa
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tarefas</CardTitle>
          <CardDescription>
            {totalCount === 0 ? "Nenhuma tarefa criada ainda" : `${totalCount} ${totalCount === 1 ? "tarefa" : "tarefas"} no total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? <div className="text-center py-12 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma tarefa adicionada ainda.</p>
              <p className="text-sm">Comece criando sua primeira tarefa.</p>
            </div> : <div className="space-y-3">
              {tasks.map(task => <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />
                  <div className="flex-1">
                    <p className={`${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {task.createdAt.toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>)}
            </div>}
        </CardContent>
      </Card>
    </div>;
};
export default Tasks;