import { useState, useEffect } from "react"
import axios from "axios"

function App2() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = () => {
    axios.get("http://localhost:8000/tasks")
      .then(response => {
        setTasks(response.data)
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

  const deleteTask = (id) => {
    axios.delete(`http://localhost:8000/tasks/${id}`)
      .then(() => fetchTasks())
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
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <p>Done: {task.done ? "Yes" : "No"}</p>
          <button onClick={() => deleteTask(task.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}

export default App2