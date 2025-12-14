# Author:             Patrik Kišeda ( xkised00 )
# File:                   routes.py
# Functionality :   api route registration for all endpoints

from fastapi import APIRouter
from app.api.v1.controllers import suggestions as suggestions_ctrl
from app.api.v1.controllers import destinations as destinations_ctrl
from app.api.v1.controllers import lists as lists_ctrl
from app.api.v1.controllers import images as images_ctrl
from app.api.v1.controllers import tags as tags_ctrl
from app.api.v1.controllers.agent import offers as agent_offers_ctrl
from app.api.v1.controllers.customer import offers as customer_offers_ctrl
from app.api.v1.controllers.customer import accepted as customer_accepted_ctrl
from app.api.v1.controllers.customer import orders as customer_orders_ctrl
from app.api.v1.controllers.customer import explore as customer_explore_ctrl

router = APIRouter(prefix="/api/v1")

# Old endpoints (kept for backward compatibility)
router.include_router(suggestions_ctrl.router)
router.include_router(destinations_ctrl.router)
router.include_router(lists_ctrl.router)
router.include_router(images_ctrl.router)

# Tags management
router.include_router(tags_ctrl.router, tags=["tags"])

# New agent endpoints
router.include_router(agent_offers_ctrl.router, prefix="/agent", tags=["agent"])

# New customer endpoints
router.include_router(customer_offers_ctrl.router, prefix="/customer", tags=["customer"])
router.include_router(customer_accepted_ctrl.router, prefix="/customer", tags=["customer"])
router.include_router(customer_orders_ctrl.router, prefix="/customer", tags=["customer"])
router.include_router(customer_explore_ctrl.router, prefix="/customer", tags=["customer"])
