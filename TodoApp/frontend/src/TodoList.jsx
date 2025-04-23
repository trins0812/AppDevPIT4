import { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

const API_URL = "https://pit-4-appdev.onrender.com/todos";

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    axios.get(API_URL)
      .then((response) => setTasks(response.data))
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  const addTask = () => {
    if (task.trim() === "") return;

    axios.post(API_URL, {
      title: task,
      completed: false
    })
    .then((response) => setTasks([...tasks, response.data]))
    .catch((error) => console.error("Error adding task:", error));

    setTask("");
  };

  const removeTask = (id) => {
    axios.delete(`${API_URL}/${id}`)
      .then(() => setTasks(tasks.filter((task) => task.id !== id)))
      .catch((error) => console.error("Error deleting task:", error));
  };

  const toggleComplete = (id) => {
    const taskToUpdate = tasks.find((task) => task.id === id);
    if (!taskToUpdate) return;

    axios.put(`${API_URL}/${id}`, {
      title: taskToUpdate.title,
      completed: !taskToUpdate.completed
    })
    .then((response) => {
      setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
    })
    .catch((error) => console.error("Error updating task:", error));
  };

  const startEditing = (id, title) => {
    setEditingIndex(id);
    setEditText(title);
  };

  const saveEdit = (id) => {
    const taskToUpdate = tasks.find((task) => task.id === id);
    if (!taskToUpdate) return;

    axios.put(`${API_URL}/${id}`, {
      title: editText,
      completed: taskToUpdate.completed
    })
    .then((response) => {
      setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
      setEditingIndex(null);
    })
    .catch((error) => console.error("Error updating task:", error));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  return (
    <div className="app-container">
      <h2>📋 To-Do List (FastAPI Version)</h2>
      <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <div className="todo-input">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <button onClick={addTask}>➕ Add</button>
      </div>

      <div className="filters">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>✅ Completed</button>
        <button onClick={() => setFilter("pending")}>⏳ Pending</button>
      </div>

      <ul className="todo-list">
        {filteredTasks.map((task) => (
          <li key={task.id} className={task.completed ? "completed" : ""}>
            {editingIndex === task.id ? (
              <>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <button onClick={() => saveEdit(task.id)}>💾 Save</button>
              </>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                />
                <span>{task.title}</span>
                <div className="task-buttons">
                  <button onClick={() => startEditing(task.id, task.title)}>✏️</button>
                  <button onClick={() => removeTask(task.id)}>❌</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
