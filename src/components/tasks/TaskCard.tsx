import { Task } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreVertical, Pencil, Trash, Calendar, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: Task['status']) => void;
}

const priorityConfig = {
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', className: 'bg-chart-4/20 text-chart-4' },
  high: { label: 'High', className: 'bg-destructive/20 text-destructive' },
};

const statusConfig = {
  todo: { label: 'To Do', className: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', className: 'bg-blue-500/20 text-blue-500' },
  in_review: { label: 'In Review', className: 'bg-orange-500/20 text-orange-500' },
  completed: { label: 'Completed', className: 'bg-green-500/20 text-green-500' },
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) => {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const isCompleted = task.status === 'completed';
  const deadline = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadline && isPast(deadline) && !isCompleted;
  const isDueToday = deadline && isToday(deadline);

  const handleCheckboxChange = () => {
    onStatusChange(task, isCompleted ? 'todo' : 'completed');
  };

  return (
    <Card className={cn('group transition-all', isCompleted && 'opacity-60')}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleCheckboxChange}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4
                className={cn(
                  'font-medium text-foreground',
                  isCompleted && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </h4>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(task)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant="outline" className={priority.className}>
                <Flag className="h-3 w-3 mr-1" />
                {priority.label}
              </Badge>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
              {deadline && (
                <Badge
                  variant="outline"
                  className={cn(
                    isOverdue && 'bg-destructive/20 text-destructive border-destructive/30',
                    isDueToday && !isOverdue && 'bg-chart-4/20 text-chart-4 border-chart-4/30'
                  )}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(deadline, 'MMM d, yyyy')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
