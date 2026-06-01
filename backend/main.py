from fastapi import FastAPI , HTTPException 
from fastapi.responses import JSONResponse
from backend.database import tasks_collection  #for put and post we use pydantic modles
from backend.models import TaskCreate
from backend.helper import validate_object_id , task_helper
from bson import ObjectId
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port (Day 6)
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    count = await tasks_collection.count_documents({})
    return {"message": "Connected to MongoDB", "total_tasks": count}

@app.get("/about")
def about():
    return {"app": "Task Manager", "version": "1.0"}

@app.get("/health")
def health():
     status = "Ok"
     message = "Are u Ok?"
     return f"{status} \n {message}"


@app.get("/tasks")
async def get_tasks():
    tasks = await tasks_collection.find().to_list(100)
    return [task_helper(task) for task in tasks]  # wrap each task

#real endpoints begin here 

'''
Create = /post   //creates a task
Retrieve = /get  // retrieves a task that you want by its id 
Update = /put    // updates a task (rename it , or something)
Delete = /dellete //

'''


@app.post("/tasks")
async def create_task(task : TaskCreate):
    new_task = await tasks_collection.insert_one(task.model_dump()) #insert_one gives metadata like inserted_id not actuaal document
    created = await tasks_collection.find_one({"_id": new_task.inserted_id})
    return task_helper(created)
     
@app.get("/tasks/{id}")
async def get_task(id: str):
    task = await tasks_collection.find_one({"_id": validate_object_id(id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_helper(task)


@app.put("/tasks/{id}")
async def update_task(id: str, task: TaskCreate):
    result = await tasks_collection.update_one(
        {"_id": validate_object_id(id)},
        {"$set": task.model_dump()}
    )#gives metadata like matched count updated count but no id
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    updated = await tasks_collection.find_one({"_id": validate_object_id(id)})
    return task_helper(updated)


@app.delete("/tasks/{id}")
async def delete_task(id: str):
    result = await tasks_collection.delete_one({"_id": validate_object_id(id)}) # metadata like deleted_counts
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}