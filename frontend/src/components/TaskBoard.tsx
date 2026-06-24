import React from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '../types/task';

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange: (id: number, status: TaskStatus) => void;
  onSelectTask: (task: Task) => void;
}

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
];

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onStatusChange, onSelectTask }) => {
  const tasksByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as TaskStatus;
    onStatusChange(Number(draggableId), newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => (
          <Droppable droppableId={column.key} key={column.key}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="min-h-[300px] rounded-xl bg-gray-100 p-3 dark:bg-gray-800"
              >
                <h3 className="mb-3 flex items-center justify-between text-sm font-semibold uppercase text-gray-500">
                  {column.label}
                  <span className="rounded-full bg-gray-200 px-2 text-xs dark:bg-gray-700">
                    {tasksByStatus(column.key).length}
                  </span>
                </h3>

                <div className="space-y-3">
                  {tasksByStatus(column.key).map((task, index) => (
                    <Draggable draggableId={String(task.id)} index={index} key={task.id}>
                      {(dragProvided) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          onClick={() => onSelectTask(task)}
                          className="cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow dark:border-gray-700 dark:bg-gray-900"
                        >
                          <p className="font-medium">{task.title}</p>
                          {task.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <span
                              className={`rounded px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}
                            >
                              {task.priority}
                            </span>
                            {task.assigneeName && (
                              <span className="text-xs text-gray-400">{task.assigneeName}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};
