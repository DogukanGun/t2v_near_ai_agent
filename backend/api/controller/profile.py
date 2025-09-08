import logging

from fastapi import APIRouter, Depends, HTTPException

from api.data.auth_data import ProfileResponse, UpdateProfileRequest, User
from utils.constants.collection_name import CollectionName
from utils.database import Database, get_db
from utils.security.authenticate import get_current_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Database = Depends(get_db),
) -> dict:
    """
    Get the current user's profile information.
    """
    try:
        # Get the user's complete information from the database
        user_data = db.get_single_object(
            CollectionName.USER.value, {"username": current_user["username"]}
        )

        if not user_data:
            logger.error(f"User not found: {current_user['username']}")
            raise HTTPException(status_code=404, detail="User not found")

        # Create profile response
        profile = ProfileResponse(
            username=user_data.get("username", ""),
            account_id=user_data.get("account_id", ""),
            public_key=user_data.get("public_key", ""),
            private_key=user_data.get("private_key", ""),
            twitter_username=user_data.get("twitter_username"),
        )

        return {
            "success": True,
            "data": profile.dict()
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error getting profile: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error getting profile: {str(e)}"
        ) from e


@router.put("/")
async def update_profile(
    profile_update: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Database = Depends(get_db),
) -> dict:
    """
    Update the current user's profile settings.
    """
    try:
        current_username = current_user["username"]
        
        # Build update data from the request
        update_data = {}
        
        if profile_update.username is not None:
            # Check if the new username is already taken (if different from current)
            if profile_update.username != current_username:
                existing_user = db.get_single_object(
                    CollectionName.USER.value, {"username": profile_update.username}
                )
                if existing_user:
                    raise HTTPException(
                        status_code=400, detail="Username already exists"
                    )
            update_data["username"] = profile_update.username
        
        if profile_update.twitter_username is not None:
            update_data["twitter_username"] = profile_update.twitter_username

        # Update the user in the database
        if update_data:
            db.update_object(
                CollectionName.USER.value,
                {"username": current_username},
                update_data,
            )
            logger.info(f"Profile updated for user: {current_username}")

        # Get the updated user data
        updated_user_data = db.get_single_object(
            CollectionName.USER.value, 
            {"username": update_data.get("username", current_username)}
        )

        if not updated_user_data:
            raise HTTPException(status_code=404, detail="User not found after update")

        # Create updated profile response
        profile = ProfileResponse(
            username=updated_user_data.get("username", ""),
            account_id=updated_user_data.get("account_id", ""),
            public_key=updated_user_data.get("public_key", ""),
            private_key=updated_user_data.get("private_key", ""),
            twitter_username=updated_user_data.get("twitter_username"),
        )

        return {
            "success": True,
            "data": profile.dict()
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error updating profile: {str(e)}"
        ) from e 