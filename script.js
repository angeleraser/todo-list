const todoDone = document.getElementById("todo-done");
const addTodoForm = document.getElementById("add-todo-form");
const addTodoInput = document.getElementById("add-todo-input");
const todoList = document.getElementById("todo-list");

class LocalStorageTodoService {
  constructor() {
    this.COLLECTION_KEY = "TODO_COLLECTION";
    this.__collection = [];
    this.initLocalStorage();
  }

  addTodo({ name }) {
    const newTodo = {
      id: crypto.randomUUID(),
      completed: false,
      name: name,
    };

    const hasSameName = this.collection.some(
      (todo) => todo.name.toLowerCase() === name.toLowerCase()
    );

    if (hasSameName) {
      return alert("There is another todo with the same name!");
    }

    this.collection = [newTodo, ...this.collection];
    return newTodo;
  }

  deleteTodo({ id }) {
    const deletedItem = this.collection.find((item) => item.id === id);
    this.collection = this.collection.filter((item) => item.id !== id);
    return deletedItem;
  }

  updateTodo({ completed, id }) {
    const collection = this.collection;

    let selectedTodo = null;

    this.collection = collection.map((item) => {
      if (item.id === id) {
        selectedTodo = {
          ...item,
          completed: completed,
        };

        return selectedTodo;
      }
      return item;
    });

    return selectedTodo;
  }

  getAll() {
    return this.__collection;
  }

  getCompletedTodos() {
    return this.getAll().filter((todo) => todo.completed);
  }

  initLocalStorage() {
    const collection = JSON.parse(
      localStorage.getItem(this.COLLECTION_KEY) || "null"
    );

    if (collection === null) {
      return localStorage.setItem(this.COLLECTION_KEY, JSON.stringify([]));
    }

    this.collection = collection;
  }

  set collection(value) {
    this.__collection = value;

    localStorage.setItem(
      this.COLLECTION_KEY,
      JSON.stringify(this.__collection)
    );
  }

  get collection() {
    const collection = JSON.parse(localStorage.getItem(this.COLLECTION_KEY));
    if (!collection) return [];
    return collection;
  }
}

const todoService = new LocalStorageTodoService();

function updateCompletedTodos() {
  todoDone.textContent = `
  ${todoService.getCompletedTodos().length}/${todoService.getAll().length}
  `;
}

function createTodoEl({ name, id, completed }) {
  const root = document.createElement("li");
  root.classList.add("todo");
  root.setAttribute("data-item-id", id);

  const label = document.createElement("label");
  label.classList.add("todo-content");

  const input = document.createElement("input");
  input.setAttribute("type", "checkbox");
  input.setAttribute("name", name);
  input.setAttribute("id", id);
  input.checked = completed;

  const circle = document.createElement("div");
  circle.classList.add("todo-content-circle");

  const todoName = document.createElement("h4");
  todoName.classList.add("todo-name");
  todoName.textContent = name;

  label.append(input, circle, todoName);

  const actions = document.createElement("div");
  actions.classList.add("todo-actions");

  const removeBtn = document.createElement("button");
  removeBtn.classList.add("todo-btn");
  removeBtn.setAttribute("data-action", "remove");
  removeBtn.setAttribute("data-todo-id", id);
  removeBtn.innerHTML = '<i class="fas fa-trash"></i>';

  actions.append(removeBtn);

  root.append(label, actions);

  return root;
}

addTodoForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const todoName = addTodoInput.value.trim();
  if (!todoName) return;
  todoList.prepend(createTodoEl(todoService.addTodo({ name: todoName })));
  addTodoInput.value = "";
});

todoList.addEventListener("click", function ({ target }) {
  if (!target.matches('[data-action="remove"]')) return;

  const todoId = target.dataset.todoId;
  const todoElement = document.querySelector(`[data-item-id="${todoId}"]`);
  todoElement.remove();
  todoService.deleteTodo({ id: todoId });
  updateCompletedTodos();
});

todoList.addEventListener("change", function ({ target }) {
  todoService.updateTodo({ completed: target.checked, id: target.id });
  updateCompletedTodos();
});

todoService.getAll().forEach((todo) => todoList.append(createTodoEl(todo)));

updateCompletedTodos();
