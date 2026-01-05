from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from config.config import DATABASE_URL

# Para Oracle asíncrono usamos el driver oracledb
engine = create_async_engine(
    DATABASE_URL, # Ej: oracle+oracledb://user:pass@host:1521/?service_name=XEPDB1
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