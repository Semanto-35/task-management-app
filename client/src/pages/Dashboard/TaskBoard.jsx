import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import axios from 'axios';
import TaskColumn from './TaskColumn';
import AddTaskModal from './AddTaskModal';
import useAuth from '@/hooks/useAuth';

const TaskBoard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState({ 'To-Do': [], 'In Progress': [], 'Done': [] });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user?.uid) {
      fetchTasks(user.uid);
    }
  }, [user]);

  const fetchTasks = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/tasks`, {
        params: { userId }
      });
      
      const categorizedTasks = {
        'To-Do': [],
        'In Progress': [],
        'Done': []
      };
      
      response.data.forEach(task => {
        if (categorizedTasks[task.category]) {
          categorizedTasks[task.category].push(task);
        }
      });
      
      setTasks(categorizedTasks);
    } catch (error) {
      setError('Failed to fetch tasks. Please try again.');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const findContainer = (id) => {
    if (id in tasks) return id;
    
    return Object.keys(tasks).find(key => 
      tasks[key].some(task => task._id === id)
    );
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setTasks(prev => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      
      const activeIndex = activeItems.findIndex(item => item._id === active.id);
      const overIndex = overItems.findIndex(item => item._id === over.id);
      
      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter(item => item._id !== active.id)
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, overIndex),
          { ...activeItems[activeIndex], category: overContainer },
          ...prev[overContainer].slice(overIndex)
        ]
      };
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    
    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    const activeIndex = tasks[activeContainer].findIndex(
      task => task._id === active.id
    );
    const overIndex = tasks[overContainer].findIndex(
      task => task._id === over.id
    );

    if (activeContainer !== overContainer) {
      try {
        const taskToMove = tasks[activeContainer][activeIndex];
        
        // Optimistic update
        setTasks(prev => ({
          ...prev,
          [activeContainer]: prev[activeContainer].filter(
            task => task._id !== active.id
          ),
          [overContainer]: [
            ...prev[overContainer].slice(0, overIndex),
            { ...taskToMove, category: overContainer },
            ...prev[overContainer].slice(overIndex)
          ]
        }));

        // API update
        await axios.put(`${import.meta.env.VITE_API_URL}/tasks/${active.id}`, {
          category: overContainer,
          position: overIndex
        });
      } catch (error) {
        console.error('Error updating task position:', error);
        // Revert on failure
        fetchTasks(user.uid);
      }
    } else if (activeIndex !== overIndex) {
      // Handle reordering within the same container
      setTasks(prev => ({
        ...prev,
        [activeContainer]: arrayMove(
          prev[activeContainer],
          activeIndex,
          overIndex
        )
      }));

      try {
        const taskToMove = tasks[activeContainer][activeIndex];
        await axios.put(`${import.meta.env.VITE_API_URL}/tasks/${active.id}`, {
          position: overIndex
        });
      } catch (error) {
        console.error('Error updating task position:', error);
        fetchTasks(user.uid);
      }
    }

    setActiveId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Tasks</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Task
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(tasks).map(([category, categoryTasks]) => (
            <TaskColumn
              key={category}
              category={category}
              tasks={categoryTasks}
              onTaskUpdate={fetchTasks}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <TaskColumn.Task
              task={tasks[findContainer(activeId)].find(
                task => task._id === activeId
              )}
              overlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTaskAdded={() => {
          fetchTasks(user.uid);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
};

export default TaskBoard;