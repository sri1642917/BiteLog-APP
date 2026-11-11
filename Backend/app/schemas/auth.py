from datetime import datetime
from pydantic import BaseModel, Field

class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=4, max_length=128)
    security_question: str = Field(..., min_length=3, max_length=255)
    security_answer: str = Field(..., min_length=1, max_length=255)

class UserLoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)

class SecurityQuestionRequest(BaseModel):
    username: str = Field(..., min_length=1)

class SecurityQuestionResponse(BaseModel):
    username: str
    security_question: str

class ResetPasswordRequest(BaseModel):
    username: str = Field(..., min_length=1)
    security_answer: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=4, max_length=128)

class UserResponse(BaseModel):
    id: int
    full_name: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True

class AuthSuccessResponse(BaseModel):
    status: str = "success"
    message: str
    user: UserResponse
    token: str
