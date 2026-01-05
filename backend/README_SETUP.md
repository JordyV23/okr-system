# Guía de Configuración del Backend

## 1. Configurar Variables de Entorno

Crea un archivo `.env` en el directorio `backend` con las siguientes variables:

```env
ORACLE_USER=tu_usuario
ORACLE_PASSWORD=tu_contraseña
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE=XEPDB1
```

## 2. Instalar Dependencias (si aún no lo has hecho)

```bash
# Activar el entorno virtual
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

## 3. Ejecutar Migraciones

### Crear la migración inicial

```bash
# Opción 1: Usar el script helper
python run_migrations.py create "Initial migration"

# Opción 2: Usar Alembic directamente
alembic revision --autogenerate -m "Initial migration"
```

### Aplicar las migraciones

```bash
# Opción 1: Usar el script helper
python run_migrations.py upgrade

# Opción 2: Usar Alembic directamente
alembic upgrade head
```

## 4. Ejecutar el Servidor

```bash
# Desde el directorio backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en: `http://localhost:8000`

- Documentación de la API: `http://localhost:8000/docs`
- Documentación alternativa: `http://localhost:8000/redoc`

## Estructura de la API

Todos los endpoints están bajo el prefijo `/api`:

- `/api/users` - Gestión de usuarios
- `/api/objectives` - Gestión de objetivos
- `/api/check-ins` - Gestión de check-ins
- `/api/evaluations` - Gestión de evaluaciones
- `/api/competencies` - Gestión de competencias
- `/api/pdis` - Gestión de PDIs
- `/api/cycles` - Gestión de ciclos
- `/api/dashboard` - Endpoints del dashboard

