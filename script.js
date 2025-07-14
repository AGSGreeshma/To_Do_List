document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const addTaskButton = document.getElementById("add-task-button");
  const taskList = document.getElementById("task-list");
  const emptyImage = document.querySelector('.empty-image');
  const todosContainer = document.querySelector('.todos-container');
  const progressBar = document.getElementById('progress');
  const progressNumbers = document.getElementById('numbers');

  let hasCelebrated = false;

  const toggleEmptyState = () => {
    emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
    todosContainer.style.width = taskList.children.length === 0 ? '100%' : '50%';
  };

  const updateProgress = (checkCompletion = true) => {
    const totalTasks = taskList.children.length;
    const completedTasks = taskList.querySelectorAll('.checkbox:checked').length;

    progressBar.style.width = totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%';
    progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;

    if (checkCompletion && totalTasks > 0 && completedTasks === totalTasks) {
      if (!hasCelebrated && typeof confetti === "function") {
        Confetti();
        hasCelebrated = true;
      }
    } else {
      hasCelebrated = false;
    }
  };

  const saveTaskToLocalStorage = () => {
    const tasks = Array.from(taskList.querySelectorAll('li')).map(li => ({
      text: li.querySelector('span').textContent,
      completed: li.querySelector('.checkbox').checked
    }));
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const loadTasksFromLocalStorage = () => {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks
    .filter(task => task.text && task.text.trim().length > 0) // avoid empty strings
    .forEach(({ text, completed }) => addTask(text, completed, false));

  toggleEmptyState();
  updateProgress();
};


  const addTask = (textInput = "", completed = false, checkCompletion = true) => {
    const inputText = textInput || taskInput.value.trim();
    if (!inputText) {
      taskInput.value = "";
      return;
    }

    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <input type="checkbox" class="checkbox" ${completed ? "checked" : ""}>
        <span>${inputText}</span>
        <div class="task-buttons">
          <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
          <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;

    const checkbox = li.querySelector(".checkbox");
    const editButton = li.querySelector(".edit-btn");

    checkbox.addEventListener("change", () => {
      const isChecked = checkbox.checked;
      li.classList.toggle('completed', isChecked);
      editButton.disabled = isChecked;
      editButton.style.opacity = isChecked ? '0.5' : '1';
      editButton.style.pointerEvents = isChecked ? 'none' : 'auto';
      updateProgress();
      saveTaskToLocalStorage();
    });

    editButton.addEventListener("click", () => {
      if (!checkbox.checked) {
        taskInput.value = li.querySelector("span").textContent;
        li.remove();
        toggleEmptyState();
        updateProgress(false);
        saveTaskToLocalStorage();
      }
    });

    li.querySelector(".delete-btn").addEventListener("click", () => {
      li.remove();
      toggleEmptyState();
      updateProgress();
      saveTaskToLocalStorage();
    });

    taskList.appendChild(li);
    taskInput.value = "";
    toggleEmptyState();
    updateProgress(checkCompletion);
    saveTaskToLocalStorage();
  };

  // Button click
  addTaskButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (taskInput.value.trim()) {
      addTask(taskInput.value.trim());
    }
  });

  // Enter key
  taskInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (taskInput.value.trim()) {
        addTask(taskInput.value.trim());
      }
    }
  });

  toggleEmptyState();
  loadTasksFromLocalStorage();
});

// 🎉 Confetti when all tasks completed
const Confetti = () => {
  const count = 200;
  const defaults = { origin: { y: 0.7 } };

  function fire(particleRatio, opts) {
    confetti(Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio),
    }));
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};
