import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import TaskItem from './TaskItem';


const TaskColumn = ({ 
  category, 
  tasks = [], 
  onTaskUpdate,
  className = "" 
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: category,
    data: {
      type: 'container',
      container: category
    }
  });

  // Get background color based on drag state
  const getBackgroundColor = () => {
    if (isOver) {
      return 'bg-gray-100 dark:bg-gray-700';
    }
    return 'bg-gray-50 dark:bg-gray-800';
  };

  return (
    <Card 
      className={`transition-colors duration-200 ${getBackgroundColor()} ${className}`}
    >
      <CardHeader className="bg-white/50 dark:bg-gray-900/50 py-3 px-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{category}</span>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent 
        ref={setNodeRef}
        className={`
          min-h-[500px] p-3
          transition-colors duration-200
          ${isOver ? 'bg-gray-100/50 dark:bg-gray-700/50' : ''}
        `}
      >
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            Drop tasks here
          </div>
        ) : (
          <SortableContext
            items={tasks.map(task => task._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tasks.map(task => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onUpdate={onTaskUpdate}
                  columnId={category}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </CardContent>
    </Card>
  );
};

// For use in drag overlay
TaskColumn.Task = TaskItem;

export default TaskColumn;