# Guía de Migraciones

## Configuración inicial

1. Asegúrate de tener las variables de entorno configuradas en un archivo `.env`:
```
ORACLE_USER=tu_usuario
ORACLE_PASSWORD=tu_contraseña
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE=XEPDB1
```

## Ejecutar migraciones

### Opción 1: Usar el script helper (recomendado)

```bash
# Crear una nueva migración
python run_migrations.py create "Descripción de la migración"

# Aplicar todas las migraciones pendientes
python run_migrations.py upgrade

# Revertir la última migración
python run_migrations.py downgrade
```

### Opción 2: Usar Alembic directamente

```bash
# Activar el entorno virtual
# En Windows:
.\venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate

# Crear una nueva migración
alembic revision --autogenerate -m "Descripción de la migración"

# Aplicar todas las migraciones pendientes
alembic upgrade head

# Ver el historial de migraciones
alembic history

# Revertir la última migración
alembic downgrade -1
```

## Notas importantes

- Alembic necesita usar el driver **síncrono** de Oracle, no el asíncrono
- El archivo `alembic/env.py` está configurado para convertir automáticamente la URL asíncrona a síncrona
- Las migraciones se crean en el directorio `alembic/versions/`
- Siempre revisa las migraciones generadas antes de aplicarlas, especialmente con Oracle

