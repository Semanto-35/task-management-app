import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Calendar } from 'lucide-react';
import axios from 'axios';
import EditTaskModal from './EditTaskModal';

const TaskItem = ({ task, onUpdate, overlay = false }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task._id,
    data: {
      type: 'task',
      task,
      container: task.category
    },
    disabled: overlay
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      setError(null);
      await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${task._id}`);
      onUpdate();
    } catch (error) {
      setError('Failed to delete task');
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const formatDate = (date) => {
    if (!date) return 'No date set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPastDue = task.dueDate && new Date(task.dueDate) < new Date();

  const cardContent = (
    <CardContent className="p-3">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base truncate">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
              {formatDate(task.timestamp)}
            </div>
            {task.dueDate && (
              <div className={`flex items-center ${isPastDue ? 'text-red-500' : ''}`}>
                Due: {formatDate(task.dueDate)}
              </div>
            )}
          </div>
          {error && (
            <div className="text-xs text-red-500 mt-1">{error}</div>
          )}
        </div>
        
        <div className="flex flex-shrink-0 space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0 hover:text-blue-500"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 p-0 hover:text-red-500"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </CardContent>
  );

  if (overlay) {
    return (
      <Card className="shadow-lg border-2 border-blue-500/50">
        {cardContent}
      </Card>
    );
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          mb-2 cursor-move 
          hover:shadow-md transition-all
          ${isDragging ? 'shadow-lg ring-2 ring-blue-500/50' : ''}
          ${isPastDue ? 'border-red-200 dark:border-red-800' : ''}
        `}
      >
        {cardContent}
      </Card>

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onTaskUpdated={() => {
          onUpdate();
          setIsEditModalOpen(false);
        }}
      />
    </>
  );
};

export default TaskItem;