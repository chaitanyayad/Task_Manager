from pydantic import BaseModel, Field
from typing import Annotated

class TaskCreate(BaseModel):

    title: Annotated[
        str,
        Field(description="Title of your task")
    ]

    description: Annotated[
        str,
        Field(description="What exactly is this task about")
    ] = ""

    done: Annotated[
        bool,
        Field(description="Task completion status")
    ] = False