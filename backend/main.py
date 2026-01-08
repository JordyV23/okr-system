from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, objectives, checkins, evaluations, competencies, pdi, dashboard, cycles, settings

app = FastAPI(
    title="OKS System API",
    description="API para el sistema de gestión de Objetivos y Key Results (OKR)",
    version="1.0.0",
    redirect_slashes=False
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
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

