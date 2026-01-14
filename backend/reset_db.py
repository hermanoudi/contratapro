import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.database import Base, DATABASE_URL
from app.models import User, Service, WorkingHour, Appointment

async def reset_db():
    engine = create_async_engine(DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        # Drop all tables
        await conn.run_sync(Base.metadata.drop_all)
        # Recreate all tables
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset_db())
