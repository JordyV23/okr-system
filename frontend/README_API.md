# Configuración de la API en el Frontend

## Conexión con el Backend

El frontend está configurado para conectarse automáticamente con el backend a través de:

1. **Proxy de Vite**: Las peticiones a `/api/*` se redirigen automáticamente a `http://localhost:8000`
2. **Servicio de API**: Se creó `src/lib/api.js` con funciones helper para todas las operaciones

## Uso del Servicio de API

### Ejemplo: Obtener usuarios

```javascript
import { usersApi } from '@/lib/api';

// Obtener todos los usuarios
const users = await usersApi.getAll();

// Obtener un usuario por ID
const user = await usersApi.getById('user-id');

// Crear un usuario
const newUser = await usersApi.create({
  email: 'usuario@example.com',
  full_name: 'Juan Pérez',
  role: 'Analista',
  department_id: 'dept-id',
});

// Actualizar un usuario
const updatedUser = await usersApi.update('user-id', {
  full_name: 'Juan Pérez Actualizado',
});

// Eliminar un usuario
await usersApi.delete('user-id');
```

### Ejemplo: Objetivos

```javascript
import { objectivesApi } from '@/lib/api';

// Obtener objetivos con filtros
const objectives = await objectivesApi.getAll({
  cycle_id: 'cycle-id',
  status: 'on-track',
  owner_id: 'user-id',
});

// Crear un objetivo con key results
const objective = await objectivesApi.create({
  title: 'Incrementar satisfacción del cliente',
  description: 'Mejorar el NPS',
  type: 'strategic',
  weight: 30,
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  cycle_id: 'cycle-id',
  owner_id: 'user-id',
  key_results: [
    {
      title: 'Aumentar NPS',
      metric: 'NPS Score',
      target: 80,
      unit: 'puntos',
    },
  ],
});
```

### Ejemplo: Dashboard

```javascript
import { dashboardApi } from '@/lib/api';

// Obtener ciclo actual
const currentCycle = await dashboardApi.getCurrentCycle();

// Obtener métricas
const metrics = await dashboardApi.getMetrics();

// Obtener progreso por departamento
const deptProgress = await dashboardApi.getDepartmentProgress();

// Obtener progreso mensual
const monthlyProgress = await dashboardApi.getMonthlyProgress();
```

## Configuración de la URL de la API

Si necesitas cambiar la URL base de la API, puedes:

1. **Usar variable de entorno**: Crea un archivo `.env` en el directorio `frontend`:
```env
VITE_API_URL=http://localhost:8000
```

2. **Modificar directamente**: Edita `src/lib/api.js` y cambia la constante `API_BASE_URL`

## Nota sobre el Proxy

El proxy de Vite solo funciona en desarrollo. En producción, asegúrate de:

1. Configurar la variable de entorno `VITE_API_URL` con la URL del backend
2. O configurar un reverse proxy (nginx, Apache, etc.) que redirija `/api/*` al backend

