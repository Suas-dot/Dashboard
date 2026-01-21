import json
import re

# Cargar datos
with open('empleados_reales.json', 'r', encoding='utf-8') as f:
    empleados = json.load(f)

# Contadores
peso_count = 0
veladas_count = 0
bipedestacion_count = 0
rotacion_count = 0
quimicos_count = 0

# Listas para guardar detalles
peso_details = []
veladas_details = []

print(f"Analizando {len(empleados)} empleados...\n")

for emp in empleados:
    # Combinar diagnóstico y restricciones para la búsqueda
    texto = f"{emp.get('diagnostico', '')} {emp.get('restricciones', '')}".lower()
    
    # Análisis de PESOS
    if re.search(r'peso|carga|kg|levantar|fuerza', texto):
        peso_count += 1
        # Intentar extraer el límite de peso si existe
        match = re.search(r'(\d+)\s*kg', texto)
        limite = match.group(0) if match else "No especificado"
        peso_details.append(f"- {emp['nombre']}: {limite}")

    # Análisis de VELADAS / TURNOS / NOCHE
    if re.search(r'velada|turno|noche|nocturno|fines de semana', texto):
        veladas_count += 1
        veladas_details.append(f"- {emp['nombre']}")

    # Otros análisis comunes
    if re.search(r'pie|bipedestaci', texto):
        bipedestacion_count += 1
        
    if re.search(r'rotaci', texto):
        rotacion_count += 1
        
    if re.search(r'qu[ií]mico|polvo|solvente', texto):
        quimicos_count += 1

print("="*40)
print(f"🏋️  RESTRICCIÓN DE PESO/CARGAS: {peso_count} empleados")
print("="*40)
# Mostrar primeros 5 ejemplos
for det in peso_details[:5]:
    print(det)
if len(peso_details) > 5: print(f"... y {len(peso_details)-5} más")

print("\n" + "="*40)
print(f"🌙  RESTRICCIÓN DE VELADAS/TURNOS: {veladas_count} empleados")
print("="*40)
for det in veladas_details[:5]:
    print(det)

print("\n" + "="*40)
print("OTROS HALLAZGOS:")
print(f"Standing/De pie (Bipedestación): {bipedestacion_count}")
print(f"Movimientos repetitivos/Rotación: {rotacion_count}")
print(f"Exposición a Químicos/Polvo: {quimicos_count}")

# Sobre "Desvincular": Buscamos restricciones severas
print("\n" + "="*40)
print("SOBRE DESVINCULACIÓN (Análisis inferido):")
print("No hay un campo explícito 'Desvincular', pero las 'Definitivas' son:")
definitivas = [e for e in empleados if e['tipoRestriccion'] == 'Definitiva']
print(f"Total Definitivas: {len(definitivas)}")
