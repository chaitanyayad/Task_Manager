import { useState, useEffect, useRef } from "react"
import axios from "axios"
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [doneTasks, setDoneTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [editingTask, setEditingTask] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [fadingIds, setFadingIds] = useState([])
  const [typed, setTyped] = useState("")
  const fullText = "What needs to get done today?"
  const canvasRef = useRef(null)

  useEffect(() => { fetchTasks() }, [])

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setTyped(fullText.slice(0, i + 1))
      i++
      if (i === fullText.length) clearInterval(interval)
    }, 70)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const stars = []

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setTimeout(() => {
      resize()
      for (let i = 0; i < 6; i++) setTimeout(spawnStar, i * 600)
    }, 50)

    window.addEventListener('resize', resize)

    function spawnStar() {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: Math.random() * 180 + 80,
        speed: Math.random() * 2 + 1,
        width: Math.random() * 2 + 1.5,
        opacity: 0,
        maxOpacity: Math.random() * 0.6 + 0.3,
        angle: Math.PI / 4,
        progress: 0,
        phase: 'in'
      })
    }

    let animId
    function drawBg() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i]
        s.progress += s.speed
        if (s.phase === 'in') {
          s.opacity = Math.min(s.maxOpacity, s.progress / 40)
          if (s.progress > 40) s.phase = 'out'
        } else {
          s.opacity = Math.max(0, s.maxOpacity - (s.progress - 40) / 60)
        }
        const tail = Math.min(s.progress, s.len)
        const x1 = s.x + Math.cos(s.angle) * s.progress
        const y1 = s.y + Math.sin(s.angle) * s.progress
        const x2 = x1 - Math.cos(s.angle) * tail
        const y2 = y1 - Math.sin(s.angle) * tail
        const grad = ctx.createLinearGradient(x2, y2, x1, y1)
        grad.addColorStop(0, `rgba(168,85,247,0)`)
        grad.addColorStop(0.5, `rgba(200,100,255,${s.opacity * 0.5})`)
        grad.addColorStop(1, `rgba(236,72,153,${s.opacity})`)
        ctx.beginPath()
        ctx.moveTo(x2, y2)
        ctx.lineTo(x1, y1)
        ctx.strokeStyle = grad
        ctx.lineWidth = s.width
        ctx.lineCap = 'round'
        ctx.stroke()
        if (s.opacity <= 0 && s.phase === 'out') {
          stars.splice(i, 1)
          setTimeout(spawnStar, Math.random() * 3000 + 1000)
        }
      }
      animId = requestAnimationFrame(drawBg)
    }
    drawBg()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const fetchTasks = () => {
    axios.get("http://localhost:8000/tasks")
      .then(res => {
        setTasks(res.data.filter(t => !t.done))
        setDoneTasks(res.data.filter(t => t.done))
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch tasks:", err)
        setLoading(false)
      })
  }

  const createTask = () => {
    if (!title.trim()) return
    axios.post("http://localhost:8000/tasks", {
      title, description, done: false
    }).then(() => {
      setTitle("")
      setDescription("")
      fetchTasks()
    })
  }

   const deleteTask = (id) => {
  axios.delete(`http://localhost:8000/tasks/${id}`)
    .then(() => fetchTasks())
   }

  const toggleDone = (task) => {
    burstParticles(task.id)
    setFadingIds(prev => [...prev, task.id])
    axios.put(`http://localhost:8000/tasks/${task.id}`, {
      title: task.title,
      description: task.description,
      done: true
    }).then(() => {
      setTimeout(() => {
        setFadingIds(prev => prev.filter(id => id !== task.id))
        fetchTasks()
      }, 650)
    })
  }

  const burstParticles = (taskId) => {
    const el = document.getElementById('task-' + taskId)
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const colors = ['#a855f7', '#ec4899', '#d946ef', '#f472b6', '#c084fc']
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('div')
      p.style.cssText = `position:fixed;pointer-events:none;border-radius:50%;z-index:999;`
      const size = Math.random() * 7 + 4
      p.style.width = size + 'px'
      p.style.height = size + 'px'
      p.style.background = colors[Math.floor(Math.random() * colors.length)]
      p.style.left = cx + 'px'
      p.style.top = cy + 'px'
      document.body.appendChild(p)
      const angle = (Math.PI * 2 * i) / 22 - Math.PI / 2
      const speed = Math.random() * 70 + 40
      const tx = Math.cos(angle) * speed
      const ty = Math.sin(angle) * speed - 50
      p.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
      ], { duration: 750, easing: 'cubic-bezier(0,0,0.2,1)' }).onfinish = () => p.remove()
    }
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
    }).then(() => {
      setEditingTask(null)
      fetchTasks()
    })
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="scene">
      <canvas ref={canvasRef} className="bg-canvas" />
      <div className="app">
        <h1 className="app-title">Task Manager</h1>
        <p className="app-sub">{typed}<span className="cursor">|</span></p>

        <div className="add-form">
          <input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
          <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <button className="add-btn" onClick={createTask}>+ Add</button>
        </div>

        <div className="task-list">
          {tasks.map(task => (
            <div
              key={task.id}
              id={"task-" + task.id}
              className={`task-item ${fadingIds.includes(task.id) ? 'fading' : ''}`}
            >
              {editingTask === task.id ? (
                <>
                  <div className="cb"><span className="ck"></span></div>
                  <div className="edit-inputs">
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                    <input value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                    <div className="edit-actions">
                      <button className="save-btn" onClick={() => saveEdit(task)}>Save</button>
                      <button className="cancel-btn" onClick={() => setEditingTask(null)}>Cancel</button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="cb" onClick={() => toggleDone(task)}><span className="ck">✓</span></div>
                  <div className="task-content">
                    <div className="task-title">{task.title}</div>
                    {task.description && <div className="task-desc">{task.description}</div>}
                  </div>
                  <button className="edit-btn" onClick={() => startEdit(task)}>✎</button>
                </>
              )}
            </div>
          ))}
        </div>

        {doneTasks.length > 0 && (
          <>
            <div className="section-label">Completed</div>
            <div className="task-list">
              {doneTasks.map(task => (
                <div key={task.id} className="task-item done-item">
                    <div className="cb checked"><span className="ck">✓</span></div>
                    <div className="task-content">
                    <div className="task-title done">{task.title}</div>
                    {task.description && <div className="task-desc">{task.description}</div>}
                    </div>
                    <button className="delete-btn" onClick={() => deleteTask(task.id)}>✕</button>
                </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App