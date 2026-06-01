import { useState, useEffect } from "react"
import axios from "axios"

function App0() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  axios.get("http://localhost:8000/tasks")
    .then(response => {
      setTasks(response.data)
      setLoading(false)
    })
    .catch(error => {
      console.error("Failed to fetch tasks:", error)
      setLoading(false)
    })
}, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>Task Manager</h1>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <p>Done: {task.done ? "Yes" : "No"}</p>
        </div>
      ))}
    </div>
  )
}

export default App0