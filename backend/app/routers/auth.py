from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import OAuthLoginRequest, UserPreferencesUpdate, UserResponse
from app.utils.token_crypto import token_crypto
from app.utils.security import create_access_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/oauth-login", status_code=status.HTTP_200_OK)
async def oauth_login(payload: OAuthLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Receives user metadata and OAuth tokens from the frontend (NextAuth signin callback).
    Creates or updates the user profile and encrypts the credentials.
    Returns a custom JWT backend authorization token and the user summary.
    """
    # 1. Search for existing user
    stmt = select(User).where(User.email == payload.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    encrypted_access = token_crypto.encrypt(payload.access_token)
    encrypted_refresh = token_crypto.encrypt(payload.refresh_token) if payload.refresh_token else None

    if user:
        # Update details
        user.name = payload.name
        if payload.image:
            user.image = payload.image
        user.provider = payload.provider
        user.provider_account_id = payload.provider_account_id
        user.access_token = encrypted_access
        if encrypted_refresh:
            user.refresh_token = encrypted_refresh
        if payload.token_expires_at:
            user.token_expires_at = payload.token_expires_at.replace(tzinfo=None)
    else:
        # Create user
        user = User(
            email=payload.email,
            name=payload.name,
            image=payload.image,
            provider=payload.provider,
            provider_account_id=payload.provider_account_id,
            access_token=encrypted_access,
            refresh_token=encrypted_refresh,
            token_expires_at=payload.token_expires_at.replace(tzinfo=None) if payload.token_expires_at else None,
            preferred_language="en"
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)

    # 2. Generate backend JWT session token
    jwt_payload = {"sub": str(user.id), "email": user.email}
    session_token = create_access_token(jwt_payload)

    # 3. Format response matching UserResponse schema
    user_data = UserResponse.model_validate(user)
    return {
        "access_token": session_token,
        "token_type": "bearer",
        "user": user_data
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns user record for the authenticated session.
    """
    return current_user

@router.patch("/preferences", response_model=UserResponse)
async def update_preferences(
    payload: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates preferences (e.g. English/Hindi preferred language settings) for the current user.
    """
    current_user.preferred_language = payload.preferred_language
    await db.commit()
    await db.refresh(current_user)
    return current_user
