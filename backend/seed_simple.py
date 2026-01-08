#!/usr/bin/env python
"""
Script sencillo para insertar datos iniciales en SQLite
"""
import sqlite3
from datetime import date, datetime
import uuid
import json

# Conectar a la base de datos
conn = sqlite3.connect('./oks_system.db')
cursor = conn.cursor()

# Generar UUIDs
org_id = str(uuid.uuid4())

# 1. Insertar organización
print("🏢 Insertando organización...")
cursor.execute("""
INSERT INTO organizations (id, name, logo_url, settings, created_at)
VALUES (?, ?, ?, ?, ?)
""", (
    org_id,
    "OKS Corporation",
    None,
    json.dumps({
        "evaluation_scale_objectives": "1-5",
        "evaluation_scale_competencies": "1-5",
        "weight_objectives": 70,
        "weight_competencies": 30
    }),
    datetime.utcnow().isoformat()
))

# 2. Insertar ciclos
print("📅 Insertando ciclos...")
cycles_data = [
    ("Q1 2026", "2026-01-01", "2026-03-31", True),
    ("Q2 2026", "2026-04-01", "2026-06-30", False),
    ("Q3 2026", "2026-07-01", "2026-09-30", False),
    ("Q4 2026", "2026-10-01", "2026-12-31", False),
]

for name, start_date, end_date, is_active in cycles_data:
    cycle_id = str(uuid.uuid4())
    cursor.execute("""
    INSERT INTO cycles (id, name, start_date, end_date, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (cycle_id, name, start_date, end_date, int(is_active), datetime.utcnow().isoformat()))
    print(f"✓ Ciclo: {name}")

# 3. Insertar competencias
print("🎯 Insertando competencias...")
competencies_data = [
    (
        "Liderazgo",
        "Capacidad para guiar, motivar e inspirar a equipos hacia objetivos comunes",
        "leadership",
        5,
        json.dumps({
            "1": "No demuestra la competencia",
            "2": "Nivel básico, requiere supervisión",
            "3": "Competente, trabaja de forma independiente",
            "4": "Avanzado, puede enseñar a otros",
            "5": "Referente, lidera iniciativas estratégicas"
        })
    ),
    (
        "Comunicación",
        "Habilidad para expresarse claramente, escuchar activamente y transmitir información efectivamente",
        "core",
        5,
        json.dumps({
            "1": "Dificultad para comunicarse",
            "2": "Comunicación básica con algunos errores",
            "3": "Comunica de forma clara y comprensible",
            "4": "Excelente comunicador, adapta mensajes",
            "5": "Comunicador excepcional, influencia a través del mensaje"
        })
    ),
    (
        "Pensamiento Estratégico",
        "Capacidad para analizar situaciones complejas, visualizar el futuro y desarrollar planes de acción",
        "leadership",
        5,
        json.dumps({
            "1": "Enfoque táctico, falta visión estratégica",
            "2": "Entiende la estrategia pero con dificultad",
            "3": "Alinea acciones con la estrategia",
            "4": "Contribuye al desarrollo estratégico",
            "5": "Define y ejecuta estrategia de alto impacto"
        })
    ),
    (
        "Innovación",
        "Capacidad para generar ideas creativas, proponer soluciones nuevas y adaptarse al cambio",
        "core",
        5,
        json.dumps({
            "1": "Resistente al cambio, sin ideas nuevas",
            "2": "Acepta cambios, propone mejoras menores",
            "3": "Genera ideas innovadoras regularmente",
            "4": "Promueve cambio e innovación",
            "5": "Catalizador de transformación e innovación"
        })
    ),
    (
        "Resolución de Problemas",
        "Capacidad para identificar problemas, analizar causas raíz y desarrollar soluciones efectivas",
        "technical",
        5,
        json.dumps({
            "1": "Dificultad para identificar problemas",
            "2": "Identifica problemas pero soluciones superficiales",
            "3": "Resuelve problemas de forma sistemática",
            "4": "Excelente análisis y soluciones sostenibles",
            "5": "Referente en análisis y solución de problemas complejos"
        })
    ),
    (
        "Orientación al Resultado",
        "Enfoque en lograr objetivos establecidos, mejorar desempeño y cumplir con compromisos",
        "core",
        5,
        json.dumps({
            "1": "Falta de enfoque en resultados",
            "2": "Esfuerzos inconsistentes hacia objetivos",
            "3": "Alcanza objetivos con regularidad",
            "4": "Supera objetivos establecidos",
            "5": "Establece y alcanza objetivos excepcionales"
        })
    ),
    (
        "Trabajo en Equipo",
        "Capacidad para colaborar, contribuir a metas comunes y establecer relaciones de confianza",
        "core",
        5,
        json.dumps({
            "1": "Dificultad para trabajar con otros",
            "2": "Trabaja en equipo con reservas",
            "3": "Colabora efectivamente en equipos",
            "4": "Fortalece el trabajo en equipo",
            "5": "Cataliza cohesión y desempeño de equipos"
        })
    ),
    (
        "Desarrollo Profesional",
        "Compromiso con el aprendizaje continuo, mejora personal y adquisición de nuevas competencias",
        "functional",
        5,
        json.dumps({
            "1": "Sin interés en desarrollo",
            "2": "Participación pasiva en desarrollo",
            "3": "Busca oportunidades de desarrollo",
            "4": "Activamente desarrolla nuevas competencias",
            "5": "Impulsor de aprendizaje y desarrollo continuo"
        })
    )
]

for name, description, category, levels, level_descriptions in competencies_data:
    comp_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    cursor.execute("""
    INSERT INTO competencies (id, name, description, category, levels, level_descriptions, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (comp_id, name, description, category, levels, level_descriptions, now, now))
    print(f"✓ Competencia: {name}")

# Confirmar cambios
conn.commit()
print("\n✅ Datos insertados exitosamente!")
conn.close()
