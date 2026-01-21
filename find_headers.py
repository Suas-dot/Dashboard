import openpyxl
import sys

# Force UTF-8 for stdout
sys.stdout.reconfigure(encoding='utf-8')

try:
    wb = openpyxl.load_workbook('MATRIZ DE LIMITACIONES LABORALES.xlsx', read_only=True)
    ws = wb['TEMPORAL Y DEFINITIVA']
    headers = [cell.value for cell in list(ws.rows)[0]]
    
    keywords = ['Inmediatas', 'Mediano', 'Definitivas', 'kg', 'pie', 'sentado', 'peso', 'carga', '60min']
    
    print("--- HEADERS MATCHING KEYWORDS ---")
    for i, h in enumerate(headers):
        if h:
            h_str = str(h)
            if any(k.lower() in h_str.lower() for k in keywords):
                print(f"{i}: {h_str}")
                
except Exception as e:
    print(f"Error: {e}")
