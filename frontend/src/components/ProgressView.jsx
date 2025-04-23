import React, {useEffect, useState} from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../styles/progressview.css';

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
}

const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;
    console.log(result);
    return result;
}

export const ProgressView = ({ tasks, onUpdateTaskStatus }) => {

    const [columns, setColumns] = useState({
        pending: { name: 'Pending', items: [] },
        on_progress: { name: 'On Progress', items: [] },
        done: { name: 'Done', items: [] },
    });

    useEffect(() => {
        const pendingItems = tasks.filter((task) => task.status === "pending");
        const onProgressItems = tasks.filter((task) => task.status === "on progress");
        const doneItems = tasks.filter((task) => task.status === "done");

        setColumns({
            pending: { ...columns.pending, items: pendingItems },
            on_progress: { ...columns.on_progress, items: onProgressItems },
            done: { ...columns.done, items: doneItems },
        });
    }, [tasks]);

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) {
            return;
        }

        const sourceColId = source.droppableId;
        const destColId = destination.droppableId;

        if (sourceColId === destColId && source.index === destination.index) {
            return;
        }

        const sourceColumn = columns[sourceColId];
        const destColumn = columns[destColId];

        const draggedTask = tasks.find(task => String(task.id) === draggableId);
         if (!draggedTask) {
             console.error("Dragged task not found!");
             return;
         }


        if (sourceColId === destColId) {
            const newItems = reorder(
                sourceColumn.items,
                source.index,
                destination.index
            );

            setColumns({
                ...columns,
                [sourceColId]: {
                    ...sourceColumn,
                    items: newItems,
                },
            });
        } else {
            const result = move(
                sourceColumn.items,
                destColumn.items,
                source,
                destination
            );

            setColumns({
                ...columns,
                [sourceColId]: {
                    ...sourceColumn,
                    items: result[sourceColId],
                },
                [destColId]: {
                    ...destColumn,
                    items: result[destColId],
                },
            });
            let newStatus = destColId;

            if (destColId === 'on_progress') {
                newStatus = 'on progress';
            }

            if (onUpdateTaskStatus && draggedTask.status !== newStatus) {
                onUpdateTaskStatus(draggedTask.id, newStatus);
            }
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="sections-wrapper">
                {Object.entries(columns).map(([columnId, column]) => (
                    <div className="section" key={columnId}>
                        <h3>{column.name}</h3>
                        <Droppable droppableId={columnId}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`tasks-wrapper ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                                >
                                    {column.items.map((task, index) => (
                                        <Draggable
                                            key={String(task.id)}
                                            draggableId={String(task.id)}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`task ${snapshot.isDragging ? 'dragging' : ''}`}
                                                    style={{
                                                        userSelect: 'none',
                                                         ...provided.draggableProps.style,
                                                         ...(snapshot.isDragging && {
                                                            background: 'lightgreen',
                                                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                                          }),
                                                    }}

                                                >
                                                    {task.title}<br/>
                                                    Prio: {task.priority}<br/>
                                                    Deadline: {task.due_date.split('T')[0]}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}