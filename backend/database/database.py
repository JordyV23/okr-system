from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from config.config import DATABASE_URL

# Create engine based on database type
if DATABASE_URL.startswith("sqlite"):
    # For SQLite, use aiosqlite
    engine = create_async_engine(
        DATABASE_URL,
        echo=True,
        future=True,
        connect_args={"check_same_thread": False}  # Needed for SQLite
    )
else:
    # For Oracle, use oracledb
    engine = create_async_engine(
        DATABASE_URL,
        echo=True,
        future=True
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session