# backend/app/routers/__init__.py
"""
Package that gathers all API routers.
Each submodule defines a `router` (APIRouter) that will be
imported here and re‑exported with friendly names.
"""

# Import submodules first to ensure they are loaded
from . import users as _users
from . import services as _services
from . import appointments as _appointments
from . import subscriptions as _subscriptions
from . import auth as _auth
from . import schedule as _schedule
from . import admin as _admin
from . import categories as _categories
from . import plans as _plans
from . import notifications as _notifications

# Re‑export only the router objects expected by main.py
users = _users.router
services = _services.router
appointments = _appointments.router
subscriptions = _subscriptions.router
auth = _auth.router
schedule = _schedule.router
admin = _admin.router
categories = _categories.router
plans = _plans.router
notifications = _notifications.router

__all__ = [
    "users", "services", "appointments", "subscriptions",
    "auth", "schedule", "admin", "categories", "plans", "notifications"
]
