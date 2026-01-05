#!/usr/bin/env python
"""
Script helper para ejecutar migraciones de Alembic
"""
import subprocess
import sys

def run_command(cmd):
    """Ejecutar un comando y mostrar su salida"""
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error ejecutando: {cmd}", file=sys.stderr)
        print(e.stderr, file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python run_migrations.py [create|upgrade|downgrade]")
        print("  create: Crear una nueva migración")
        print("  upgrade: Aplicar migraciones pendientes")
        print("  downgrade: Revertir la última migración")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "create":
        message = sys.argv[2] if len(sys.argv) > 2 else "Auto migration"
        cmd = f'alembic revision --autogenerate -m "{message}"'
    elif command == "upgrade":
        revision = sys.argv[2] if len(sys.argv) > 2 else "head"
        cmd = f'alembic upgrade {revision}'
    elif command == "downgrade":
        revision = sys.argv[2] if len(sys.argv) > 2 else "-1"
        cmd = f'alembic downgrade {revision}'
    else:
        print(f"Comando desconocido: {command}")
        sys.exit(1)
    
    success = run_command(cmd)
    sys.exit(0 if success else 1)

