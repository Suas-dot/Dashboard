import openpyxl
import sys

# Force UTF-8
sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook('MATRIZ DE LIMITACIONES LABORALES.xlsx', read_only=True)
ws = wb['TEMPORAL Y DEFINITIVA']

rows = list(ws.iter_rows(min_row=1, max_row=4, min_col=30, max_col=70, values_only=True))

with open('headers_structure.txt', 'w', encoding='utf-8') as f:
    for i in range(len(rows[0])):
        idx = i + 30
        h1 = rows[0][i]
        h2 = rows[1][i]
        d1 = rows[2][i] # Row 3
        d2 = rows[3][i] # Row 4
        
        f.write(f"--- Column {idx} ---\n")
        f.write(f"Row 1 (Header): {h1}\n")
        f.write(f"Row 2 (Header): {h2}\n")
        f.write(f"Row 3 (Data): {d1}\n")
        f.write(f"Row 4 (Data): {d2}\n")
        f.write("\n")

print("Inspection complete. Check headers_structure.txt")
