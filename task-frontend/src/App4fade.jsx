import { useState, useEffect } from "react"
import axios from "axios"

function App4() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [editingTask, setEditingTask] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

  useEffect(() => {
    fetchTasks()
  }, [])

 const fetchTasks = () => {
  axios.get("http://localhost:8000/tasks")
    .then(response => {
      setTasks(response.data.filter(task => !task.done))
      setLoading(false)
    })
    .catch(error => {
      console.error("Failed to fetch tasks:", error)
      setLoading(false)
    })
}

  const createTask = () => {
    axios.post("http://localhost:8000/tasks", {
      title: title,
      description: description,
      done: false
    })
    .then(() => {
      setTitle("")
      setDescription("")
      fetchTasks()
    })

  }
  const toggleDone = (task) => {
  axios.put(`http://localhost:8000/tasks/${task.id}`, {
    title: task.title,
    description: task.description,
    done: true
  })
  .then(() => {
    setTimeout(() => fetchTasks(), 600) // wait for fade animation
  })
}

  const deleteTask = (id) => {
    axios.delete(`http://localhost:8000/tasks/${id}`)
      .then(() => fetchTasks())
  }

  const startEdit = (task) => {
    setEditingTask(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description)
  }

  const saveEdit = (task) => {
    axios.put(`http://localhost:8000/tasks/${task.id}`, {
      title: editTitle,
      description: editDescription,
      done: task.done
    })
    .then(() => {
      setEditingTask(null)
      fetchTasks()
    })
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>Task Manager</h1>

      {/* Create form */}
      <div>
        <input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button onClick={createTask}>Add Task</button>
      </div>

      {/* Task list */}
      {tasks.map(task => (
        <div key={task.id}>
          {editingTask === task.id ? (
            // Edit mode
            <div>
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
              />
              <input
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
              />
              <button onClick={() => saveEdit(task)}>Save</button>
              <button onClick={() => setEditingTask(null)}>Cancel</button>
            </div>
          ) : (
            // View mode
                <div className={task.done ? "task-done" : ""}>
                <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleDone(task)}
                />
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <button onClick={() => startEdit(task)}>Edit</button>
                </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default App4