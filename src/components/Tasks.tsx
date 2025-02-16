import { useMemo, useState } from "react";
import { placeholders } from "src/content";
import { useTasksContext } from "src/contexts";
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd";
import { Check, DragVertical } from "src/icons";
import { useLocalStorage } from "src/hooks";
// you must remove Strict Mode for react-beautiful-dnd to work locally
// https://github.com/atlassian/react-beautiful-dnd/issues/2350

export function Tasks() {
  const { message, tasks, changeTask, completeTask, setTasks } = useTasksContext();
  const [someDragIsHappening, setSomeDragIsHappening] = useState(false);
  const [showTasksAreSaved, setShowTasksAreSaved] = useLocalStorage("showTasksAreSaved", true);

  const numberOfTasks = tasks.filter(Boolean).length;
  const multipleTasks = numberOfTasks > 1;

  const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const placeholder = useMemo(() => getRandomElement(placeholders), []);

  const handleChange = (event: React.FormEvent<HTMLInputElement>, i: number) => {
    const currentTask = event.currentTarget.value;
    changeTask(i, currentTask);
  };

  const handleDone = (i: number) => {
    completeTask(i);
  };

  const hideTasksSaved = () => {
    setShowTasksAreSaved(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    switch (event.key) {
      case "Enter":
        if (event.ctrlKey) {
          event.preventDefault();
          return handleDone(i);
        }
        if (event.shiftKey) {
          event.preventDefault();
          return document.querySelectorAll("input")[i - 1]?.focus();
        }
        if (!event.ctrlKey) {
          event.preventDefault();
          return document.querySelectorAll("input")[i + 1]?.focus();
        }
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const destinationIndex = result.destination?.index;

    if (destinationIndex || destinationIndex === 0) {
      setTasks((prev) => {
        const actualTasks = [...prev];
        const draggedTask = actualTasks.splice(result.source.index, 1)[0];
        actualTasks.splice(destinationIndex, 0, draggedTask);

        const filledTasks = actualTasks.filter((t) => t !== "");
        const newTasksArray = Array(5).fill("");
        newTasksArray.splice(0, filledTasks.length, ...filledTasks);

        return newTasksArray;
      });
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setSomeDragIsHappening(false);
  };

  const tasksMap = tasks.map((task, idx) => {
    const isFirstTask = idx === 0;
    const isLastTask = idx === tasks.length - 1;
    const isEmptyTask = task.trim() === "";

    return (
      <Draggable draggableId={idx.toString()} index={idx} key={idx}>
        {(provided, snapshot) => {
          const isBeingDragged = snapshot.isDragging;
          const anotherTaskIsBeingDragged = !isBeingDragged && someDragIsHappening;

          return (
            <li
              {...provided.draggableProps}
              key={idx}
              className="group flex"
              ref={provided.innerRef}
            >
              <input
                value={task}
                onChange={(event) => handleChange(event, idx)}
                autoCapitalize="false"
                autoFocus={isFirstTask}
                autoComplete="off"
                spellCheck="false"
                placeholder={`${isFirstTask ? `${placeholder}?` : ""}`}
                aria-label={`Task ${idx + 1}`}
                onKeyDown={(event) => handleKeyDown(event, idx)}
                className={`peer w-full ${!isEmptyTask && multipleTasks && "group-hover:pr-2"} ${
                  isFirstTask && "rounded-t-2xl"
                } ${
                  isLastTask ? "rounded-b-2xl" : "border-b border-trueBlack dark:border-trueWhite"
                } ${
                  someDragIsHappening && "cursor-grabbing"
                } bg-trueWhite py-4 px-5 text-softBlack focus:outline-none dark:bg-softBlack dark:text-softWhite sm:text-lg`}
              />
              <span
                {...provided.dragHandleProps}
                aria-label="Drag handle to reorder task"
                className={`${!isLastTask && "border-b border-trueBlack dark:border-trueWhite"} ${
                  isEmptyTask || !multipleTasks || anotherTaskIsBeingDragged
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
                } ${
                  !isBeingDragged && "hidden"
                } flex items-center justify-center bg-trueWhite pr-2 text-softBlack placeholder:select-none hover:cursor-grab dark:bg-softBlack dark:text-softWhite sm:text-lg`}
                tabIndex={-1}
              >
                <DragVertical className="fill-softBlack dark:fill-softWhite" />
              </span>
              <button
                onClick={() => handleDone(idx)}
                className={`${isFirstTask && "rounded-tr-2xl"} ${isLastTask && "rounded-br-2xl"} ${
                  isEmptyTask || anotherTaskIsBeingDragged
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
                } ${
                  !isBeingDragged && "hidden"
                } cursor-pointer items-center justify-center border-l border-b border-trueBlack bg-berryBlue px-4 dark:border-trueWhite dark:bg-purpleRain dark:text-softWhite xs:px-6 sm:text-lg`}
              >
                done?
              </button>
            </li>
          );
        }}
      </Draggable>
    );
  });

  return (
    <section className="flex flex-col items-center gap-4">
      <p className="text-lg text-softBlack dark:text-softWhite xs:text-xl sm:text-2xl">
        what do you want to{" "}
        <span className="inset-0 inline-block skew-y-3 rounded-md bg-berryBlue px-2 py-1 dark:bg-purpleRain">
          <span className="block -skew-y-3 font-semibold">do?</span>
        </span>
      </p>
      <ul className="w-72 overflow-hidden rounded-2xl border border-trueBlack shadow-brutalist-dark dark:border-trueWhite dark:shadow-brutalist-light tiny:w-80 xs:w-96">
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={() => setSomeDragIsHappening(true)}>
          <Droppable droppableId="tasksList">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {tasksMap}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ul>
      <div
        onClick={hideTasksSaved}
        role="button"
        className={`${
          (message || !multipleTasks || !showTasksAreSaved) && "invisible"
        } group z-10 flex cursor-pointer flex-col items-center gap-1 rounded-2xl bg-softWhite dark:bg-trueBlack`}
      >
        <p
          className="text-sm text-softBlack/50
          dark:text-softWhite/50 xs:text-base"
        >
          your tasks won&apos;t be lost if you close the website
        </p>
        <button
          className="flex items-center gap-1 rounded-md border border-trueBlack/30 py-0.5 pl-2 pr-1 text-sm text-softBlack/50
          dark:border-trueWhite/50 dark:text-softWhite/50 xs:text-base sm:group-hover:bg-unavailableLight dark:sm:group-hover:bg-unavailableDark"
        >
          ok
          <Check className="rounded-md fill-softBlack/50 dark:fill-softWhite/50" />
        </button>
      </div>
    </section>
  );
}
