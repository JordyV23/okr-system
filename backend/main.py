from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, objectives, checkins, evaluations, pdi, dashboard, cycles, settings, competencies

app = FastAPI(
    title="OKS System API",
    description="API para el sistema de gestión de Objetivos y Key Results (OKR)",
    version="1.0.0",
    redirect_slashes=True
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],  # Development origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users.router)
app.include_router(objectives.router)
app.include_router(checkins.router)
app.include_router(evaluations.router)
app.include_router(competencies.router)
app.include_router(pdi.router)
app.include_router(dashboard.router)
app.include_router(cycles.router)
app.include_router(settings.router)




@app.get("/")
async def root():
    return {
        "message": "OKS System API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

