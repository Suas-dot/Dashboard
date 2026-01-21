import openpyxl

wb = openpyxl.load_workbook('MATRIZ DE LIMITACIONES LABORALES.xlsx', data_only=True)
ws = wb['LISTAS']

print("=== HOJA LISTAS ===")
for row in ws.iter_rows(min_row=1, max_row=20, values_only=True):
    print(row)
