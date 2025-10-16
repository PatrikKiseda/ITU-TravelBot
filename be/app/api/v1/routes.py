from fastapi import APIRouter
from app.api.v1.controllers import suggestions as suggestions_ctrl
from app.api.v1.controllers import destinations as destinations_ctrl
from app.api.v1.controllers import lists as lists_ctrl
from app.api.v1.controllers import images as images_ctrl

router = APIRouter(prefix="/api/v1")

router.include_router(suggestions_ctrl.router)
router.include_router(destinations_ctrl.router)
router.include_router(lists_ctrl.router)
router.include_router(images_ctrl.router)
