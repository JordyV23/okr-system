#!/usr/bin/env python
"""
Script para insertar datos iniciales en la base de datos
Crea ciclos y competencias por defecto
"""
import asyncio
from datetime import date, datetime
import uuid
import sys
from pathlib import Path

# Agregar el directorio actual al path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from models.models import Base, Cycle, Competency, Organization
from config.config import DATABASE_URL


async def seed_database():
    """Insertar datos iniciales en la base de datos"""
    
    # Crear el engine y sesión
    engine = create_async_engine(DATABASE_URL, echo=True, future=True)
    async_session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        async with session.begin():
            # 1. Crear organización por defecto
            print("🏢 Creando organización por defecto...")
            org = Organization(
                id=str(uuid.uuid4()),
                name="OKS Corporation",
                logo_url=None,
                settings={
                    "evaluation_scale_objectives": "1-5",
                    "evaluation_scale_competencies": "1-5",
                    "weight_objectives": 70,
                    "weight_competencies": 30
                },
                created_at=datetime.utcnow()
            )
            session.add(org)
            await session.flush()
            print(f"✓ Organización creada: {org.name}")

            # 2. Crear ciclos
            print("\n📅 Creando ciclos...")
            cycles_data = [
                {
                    "name": "Q1 2026",
                    "start_date": date(2026, 1, 1),
                    "end_date": date(2026, 3, 31),
                    "is_active": True
                },
                {
                    "name": "Q2 2026",
                    "start_date": date(2026, 4, 1),
                    "end_date": date(2026, 6, 30),
                    "is_active": False
                },
                {
                    "name": "Q3 2026",
                    "start_date": date(2026, 7, 1),
                    "end_date": date(2026, 9, 30),
                    "is_active": False
                },
                {
                    "name": "Q4 2026",
                    "start_date": date(2026, 10, 1),
                    "end_date": date(2026, 12, 31),
                    "is_active": False
                }
            ]
            
            for cycle_data in cycles_data:
                cycle = Cycle(
                    id=str(uuid.uuid4()),
                    name=cycle_data["name"],
                    start_date=cycle_data["start_date"],
                    end_date=cycle_data["end_date"],
                    is_active=cycle_data["is_active"],
                    created_at=datetime.utcnow()
                )
                session.add(cycle)
                print(f"✓ Ciclo creado: {cycle.name} ({cycle.start_date} - {cycle.end_date})")

            # 3. Crear competencias
            print("\n🎯 Creando competencias...")
            competencies_data = [
                {
                    "name": "Liderazgo",
                    "description": "Capacidad para guiar, motivar e inspirar a equipos hacia objetivos comunes",
                    "category": "leadership",
                    "levels": 5,
                    "level_descriptions": {
                        "1": "No demuestra la competencia",
                        "2": "Nivel básico, requiere supervisión",
                        "3": "Competente, trabaja de forma independiente",
                        "4": "Avanzado, puede enseñar a otros",
                        "5": "Referente, lidera iniciativas estratégicas"
                    }
                },
                {
                    "name": "Comunicación",
                    "description": "Habilidad para expresarse claramente, escuchar activamente y transmitir información efectivamente",
                    "category": "core",
                    "levels": 5,
                    "level_descriptions": {
                        "1": "Dificultad para comunicarse",
                        "2": "Comunicación básica con algunos errores",
                        "3": "Comunica de forma clara y comprensible",
                        "4": "Excelente comunicador, adapta mensajes",
                        "5": "Comunicador excepcional, influencia a través del mensaje"
                    }
                },
                {
                    "name": "Pensamiento Estratégico",
                    "description": "Capacidad para analizar situaciones complejas, visualizar el futuro y desarrollar planes de acción",
                    "category": "leadership",
                    "levels": 5,
                    "level_descriptions": {
                        "1": "Enfoque táctico, falta visión estratégica",
                        "2": "Entiende la estrategia pero con dificultad",
                        "3": "Alinea acciones con la estrategia",
                        "4": "Contribuye al desarrollo estratégico",
                        "5": "Define y ejecuta estrategia de alto impacto"
                    }
                },
                {
                    "name": "Innovación",
                    "description": "Capacidad para generar ideas creativas, proponer soluciones nuevas y adaptarse al cambio",
                    "category": "core",
                    "levels": 5,
                    "level_descriptions": {
                        "1": "Resistente al cambio, sin ideas nuevas",
                        "2": "Acepta cambios, propone mejoras menores",
                        "3": "Genera ideas innovadoras regularmente",
                        "4": "Promueve cambio e innovación",
                        "5": "Catalizador de transformación e innovación"
                    }
                },
                {
                    "name": "Resolución de Problemas",
                    "description": "Capacidad para identificar problemas, analizar causas raíz y desarrollar soluciones efectivas",
                    "category": "technical",
                    "levels": 5,
                    "level_descriptions": {
                        "1": "Dificultad para identificar problemas",
                        "2": "Identifica problemas pero soluciones superficiales",
                        "3": "Resuelve problemas de forma sistemática",
                        "4": "Excelente análisis y soluciones sostenibles",
                        "5": "Referente en análisis y solución de problemas complejos"
                    }
                },
                {
                    "name": "Orientación al Resultado",
                    "description": "Enfoque en lograr objetivos establecidos, mejorar desempeño y cumplir con compromisos",
                    "category": "core",
                    "levels": 5,
                    "level_descriptions": {
                        "1": "Falta de enfoque en resultados",
                        "2": "Esfuerzos inconsistentes hacia objetivos",
                        "3": "Alcanza objetivos con regularidad",
                        "4": "Supera objetivos establecidos",
                        "5": "Establece y alcanza objetivos excepcionales"
                    }
                },
                {
                    "name": "Trabajo en Equipo",
                    "description": "Capacidad para colaborar, contribuir a metas comunes y establecer relaciones de confianza",
                    "category": "core",
                    "levels": 5,
                    "level_descriptions": {
                        "1": "Dificultad para trabajar con otros",
                        "2": "Trabaja en equipo con reservas",
                        "3": "Colabora efectivamente en equipos",
                        "4": "Fortalece el trabajo en equipo",
                        "5": "Cataliza cohesión y desempeño de equipos"
                    }
                },
                {
                    "name": "Desarrollo Profesional",
                    "description": "Compromiso con el aprendizaje continuo, mejora personal y adquisición de nuevas competencias",
                    "category": "functional",
                    "levels": 5,
                    "level_descriptions": {
                        "1": "Sin interés en desarrollo",
                        "2": "Participación pasiva en desarrollo",
                        "3": "Busca oportunidades de desarrollo",
                        "4": "Activamente desarrolla nuevas competencias",
                        "5": "Impulsor de aprendizaje y desarrollo continuo"
                    }
                }
            ]
            
            for comp_data in competencies_data:
                competency = Competency(
                    id=str(uuid.uuid4()),
                    name=comp_data["name"],
                    description=comp_data["description"],
                    category=comp_data["category"],
                    levels=comp_data["levels"],
                    level_descriptions=comp_data["level_descriptions"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                session.add(competency)
                print(f"✓ Competencia creada: {competency.name} ({competency.levels} niveles)")

            await session.commit()
            print("\n✅ Datos iniciales insertados exitosamente!")


async def main():
    """Función principal"""
    try:
        await seed_database()
    except Exception as e:
        print(f"❌ Error al insertar datos: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
