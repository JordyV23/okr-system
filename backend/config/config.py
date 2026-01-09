import os
# from typing import Optional
from dotenv import load_dotenv

load_dotenv() 

# For development, use SQLite instead of Oracle
USE_SQLITE = os.getenv("USE_SQLITE", "false").lower() == "true"

if USE_SQLITE:
    # Use SQLite for development
    DATABASE_URL = "sqlite+aiosqlite:///./oks_system.db"
else:
    # Oracle configuration for production
    ORACLE_USER = os.getenv("ORACLE_USER")
    ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD")
    ORACLE_HOST = os.getenv("ORACLE_HOST")
    ORACLE_PORT = os.getenv("ORACLE_PORT") or "1521"  # Puerto por defecto de Oracle
    ORACLE_SERVICE = os.getenv("ORACLE_SERVICE")

    # Validar que todas las variables necesarias estén definidas
    required_vars = {
        "ORACLE_USER": ORACLE_USER,
        "ORACLE_PASSWORD": ORACLE_PASSWORD,
        "ORACLE_HOST": ORACLE_HOST,
        "ORACLE_SERVICE": ORACLE_SERVICE,
    }

    missing_vars = [var for var, value in required_vars.items() if not value]

    if missing_vars:
        raise ValueError(
            f"Las siguientes variables de entorno no están definidas: {', '.join(missing_vars)}\n"
            f"Por favor, configura las variables de entorno para la conexión a Oracle.\n"
            f"Ejemplo: export ORACLE_USER=usuario ORACLE_PASSWORD=contraseña ORACLE_HOST=localhost ORACLE_PORT=1521 ORACLE_SERVICE=XEPDB1"
        )

    # Construir URL de Oracle
    DATABASE_URL = f"oracle+oracledb://{ORACLE_USER}:{ORACLE_PASSWORD}@{ORACLE_HOST}:{ORACLE_PORT}/?service_name={ORACLE_SERVICE}"
