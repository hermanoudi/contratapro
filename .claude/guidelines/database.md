# Database Guidelines

## Single models.py File

ALL models live in `backend/app/models.py`. Do not create separate model files per entity.

## No Separate Professional Model

Professionals are `User` records with `is_professional = True`. There is no `Professional` table:

```python
class User(Base):
    __tablename__ = "users"
    is_professional = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    # Professional-specific fields on same model:
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)
    subscription_plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=True)
```

## Ambiguous Foreign Keys

When a model has multiple FKs to the same table, specify `foreign_keys=`:

```python
# User -> Appointment (two paths: as professional and as client)
appointments_as_professional = relationship(
    "Appointment", foreign_keys="[Appointment.professional_id]", back_populates="professional"
)
appointments_as_client = relationship(
    "Appointment", foreign_keys="[Appointment.client_id]", back_populates="client"
)

# SubscriptionPlan -> Subscription (plan_id vs new_plan_id)
subscriptions = relationship(
    "Subscription", back_populates="plan", foreign_keys="[Subscription.plan_id]"
)
```

## Adding a New Column

1. Add column in `models.py`
2. Create migration: `docker-compose exec backend alembic revision --autogenerate -m "add column_name to table"`
3. Apply: `docker-compose exec backend alembic upgrade head`
4. If schema needs it, add field to relevant Pydantic schema in `schemas.py`

## Adding a New Model

1. Define class in `models.py` with `Base`
2. Add relationships to/from existing models if needed
3. Import in `backend/alembic/env.py`:

```python
from app.models import User, Service, WorkingHour, Appointment, Subscription, Category, NewModel
```

4. Create and apply migration
5. Create schemas in `schemas.py`

## Async Session Patterns

```python
# SELECT
result = await db.execute(select(User).filter(User.email == email))
user = result.scalars().first()

# SELECT with eager loading
result = await db.execute(
    select(User)
    .filter(User.email == email)
    .options(selectinload(User.subscription_plan))
)

# SELECT list
result = await db.execute(select(Service).filter(Service.professional_id == user_id))
services = result.scalars().all()

# CREATE
new_item = MyModel(field=value)
db.add(new_item)
await db.commit()
await db.refresh(new_item)

# DELETE
await db.delete(item)
await db.commit()
```

## Alembic Migrations

### Commands

```bash
# Create migration
docker-compose exec backend alembic revision --autogenerate -m "descricao"

# Apply all pending
docker-compose exec backend alembic upgrade head

# Rollback one step
docker-compose exec backend alembic downgrade -1

# View history
docker-compose exec backend alembic history
```

### Data Migration (raw SQL)

```python
def upgrade():
    op.execute("UPDATE users SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL")
```

### env.py Model Imports

ALL models must be imported in `backend/alembic/env.py` for autogenerate to detect them:

```python
from app.models import User, Service, WorkingHour, Appointment, Subscription, Category
```

## Connection URL

`database.py` and `config.py` both auto-convert `postgresql://` to `postgresql+asyncpg://` (Railway injects URL without asyncpg driver prefix).
