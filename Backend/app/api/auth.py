import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    SecurityQuestionRequest,
    SecurityQuestionResponse,
    ResetPasswordRequest,
    UserResponse,
    AuthSuccessResponse,
)
from app.services.auth_service import (
    hash_secret,
    verify_secret,
    normalize_security_answer,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthSuccessResponse, status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    # Check if username or email is already taken
    existing_user = db.query(User).filter(
        User.username == req.username.strip().lower()
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is already registered."
        )

    # Cryptographically hash password and security answer with PBKDF2-HMAC-SHA256
    password_hash = hash_secret(req.password)
    normalized_answer = normalize_security_answer(req.security_answer)
    security_answer_hash = hash_secret(normalized_answer)

    new_user = User(
        full_name=req.full_name.strip(),
        username=req.username.strip().lower(),
        password_hash=password_hash,
        security_question=req.security_question.strip(),
        security_answer_hash=security_answer_hash,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate local session token
    session_token = secrets.token_hex(24)

    return AuthSuccessResponse(
        message="Registration successful! Your credentials are 100% encrypted offline.",
        user=UserResponse.from_orm(new_user),
        token=session_token,
    )

@router.post("/login", response_model=AuthSuccessResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.username == req.username.strip().lower()
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password."
        )

    # Verify password against stored PBKDF2 hash
    if not verify_secret(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password."
        )

    session_token = secrets.token_hex(24)

    return AuthSuccessResponse(
        message="Sign in successful!",
        user=UserResponse.from_orm(user),
        token=session_token,
    )

@router.post("/security-question", response_model=SecurityQuestionResponse)
def get_security_question(req: SecurityQuestionRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.username == req.username.strip().lower()
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account with this username or email not found."
        )

    return SecurityQuestionResponse(
        username=user.username,
        security_question=user.security_question,
    )

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.username == req.username.strip().lower()
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account with this username or email not found."
        )

    # Verify security answer against stored hash
    normalized_answer = normalize_security_answer(req.security_answer)
    if not verify_secret(normalized_answer, user.security_answer_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect answer to security question. Please try again."
        )

    # Hash new password and save
    user.password_hash = hash_secret(req.new_password)
    db.commit()

    return {
        "status": "success",
        "message": "Password has been successfully reset! You can now log in with your new password."
    }

@router.get("/users/first", response_model=UserResponse)
def get_first_user(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user registered yet."
        )
    return UserResponse.from_orm(user)
