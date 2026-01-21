import json
import re
from collections import Counter

# Cargar datos
with open('empleados_reales.json', 'r', encoding='utf-8') as f:
    empleados = json.load(f)

# Contadores de peso específico
pesos = []

for emp in empleados:
    texto = f"{emp.get('diagnostico', '')} {emp.get('restricciones', '')}".lower()
    
    # Buscar patrones como "5 kg", "10kg", "5 kilos"
    match = re.search(r'(\d+)\s*(k|kg|kilo)', texto)
    if match:
        peso = int(match.group(1))
        pesos.append(peso)

print("DISTRIBUCIÓN DE LÍMITES DE PESO IDENTIFICADOS:")
conteo = Counter(pesos)
for peso, cantidad in sorted(conteo.items()):
    print(f"- {peso} Kg: {cantidad} empleados")

print(f"\nTotal con límite específico detectado: {len(pesos)}")
