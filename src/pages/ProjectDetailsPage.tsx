import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { projectsApi, tasksApi, Project, Task } from '@/lib/api';
import { ArrowLeft, Plus, CheckCircle, Clock, ListTodo, Filter } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import TaskCard from '@/components/tasks/TaskCard';
import TaskModal from '@/components/tasks/TaskModal';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data for demo
const mockProject: Project = {
  id: '1',
  name: 'Website Redesign',
  description: 'Complete overhaul of the company website with modern design patterns and improved user experience.',
  created_at: '2024-01-01',
  updated_at: '2024-01-15',
  task_count: 12,
  completed_task_count: 8,
};

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design homepage mockup',
    description: 'Create Figma designs for the new homepage layout',
    status: 'completed',
    priority: 'high',
    deadline: '2024-01-10',
    project_id: '1',
    created_at: '2024-01-01',
    updated_at: '2024-01-10',
  },
  {
    id: '2',
    title: 'Implement responsive navigation',
    description: 'Build mobile-friendly navigation component',
    status: 'in_progress',
    priority: 'high',
    deadline: '2024-01-20',
    project_id: '1',
    created_at: '2024-01-05',
    updated_at: '2024-01-15',
  },
  {
    id: '3',
    title: 'Set up analytics tracking',
    description: 'Integrate Google Analytics and event tracking',
    status: 'todo',
    priority: 'medium',
    deadline: '2024-01-25',
    project_id: '1',
    created_at: '2024-01-08',
    updated_at: '2024-01-08',
  },
  {
    id: '4',
    title: 'Optimize images for web',
    description: 'Compress and convert images to WebP format',
    status: 'todo',
    priority: 'low',
    project_id: '1',
    created_at: '2024-01-10',
    updated_at: '2024-01-10',
  },
];

const ProjectDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchData = async () => {
    if (!id) return;

    const [projectRes, tasksRes] = await Promise.all([
      projectsApi.getById(id),
      tasksApi.getByProject(id),
    ]);

    setProject(projectRes.data || mockProject);
    setTasks(tasksRes.data || mockTasks);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateTask = async (data: {
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    deadline?: string;
  }) => {
    if (!id) return;
    setIsSubmitting(true);

    const { data: newTask, error } = await tasksApi.create({
      ...data,
      project_id: id,
    });

    setIsSubmitting(false);

    if (newTask) {
      setTasks([newTask, ...tasks]);
      setModalOpen(false);
      toast({ title: 'Task created successfully' });
    } else if (error) {
      // Demo: add mock task
      const mockTask: Task = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        status: (data.status as Task['status']) || 'todo',
        priority: (data.priority as Task['priority']) || 'medium',
        deadline: data.deadline,
        project_id: id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTasks([mockTask, ...tasks]);
      setModalOpen(false);
      toast({ title: 'Task created successfully' });
    }
  };

  const handleEditTask = async (data: {
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    deadline?: string;
  }) => {
    if (!editingTask) return;
    setIsSubmitting(true);

    const updatePayload: Partial<Task> = {
      title: data.title,
      description: data.description,
      priority: data.priority as Task['priority'],
      status: data.status as Task['status'],
      deadline: data.deadline,
    };

    const { data: updatedTask, error } = await tasksApi.update(editingTask.id, updatePayload);

    setIsSubmitting(false);

    if (updatedTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? updatedTask : t)));
      setEditingTask(null);
      toast({ title: 'Task updated successfully' });
    } else if (error) {
      // Demo: update locally
      setTasks(
        tasks.map((t) =>
          t.id === editingTask.id
            ? { ...t, ...data, updated_at: new Date().toISOString() } as Task
            : t
        )
      );
      setEditingTask(null);
      toast({ title: 'Task updated successfully' });
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    await tasksApi.delete(deletingTask.id);

    // Demo: always delete locally
    setTasks(tasks.filter((t) => t.id !== deletingTask.id));
    setDeletingTask(null);
    toast({ title: 'Task deleted successfully' });
  };

  const handleStatusChange = async (task: Task, status: Task['status']) => {
    const { data: updatedTask, error } = await tasksApi.update(task.id, { status });

    if (updatedTask) {
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    } else {
      // Demo: update locally
      setTasks(
        tasks.map((t) =>
          t.id === task.id ? { ...t, status, updated_at: new Date().toISOString() } : t
        )
      );
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-foreground mb-2">Project not found</h2>
          <Link to="/projects">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const filteredTasks = statusFilter === 'all' 
    ? tasks 
    : tasks.filter((t) => t.status === statusFilter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link
            to="/projects"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground mt-2 max-w-2xl">{project.description}</p>
              )}
            </div>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <ListTodo className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{todoTasks.length}</p>
                  <p className="text-sm text-muted-foreground">To Do</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-1/10 rounded-lg">
                  <Clock className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{inProgressTasks.length}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedTasks.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Tasks</CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {statusFilter === 'all'
                    ? 'No tasks yet. Create your first task to get started.'
                    : `No ${statusFilter.replace('_', ' ')} tasks.`}
                </p>
                {statusFilter === 'all' && (
                  <Button onClick={() => setModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={(t) => setEditingTask(t)}
                    onDelete={(t) => setDeletingTask(t)}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Task Modal */}
      <TaskModal
        open={modalOpen || !!editingTask}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleEditTask : handleCreateTask}
        task={editingTask}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTask?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default ProjectDetailsPage;
