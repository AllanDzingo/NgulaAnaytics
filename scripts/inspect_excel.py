from pathlib import Path
import pandas as pd

path = Path(r'c:/Users/Hanco Sipsma/Desktop/Allan 2025/Ngula Analytics/PGM_Concentrator_400tph_Random_Data.xlsx')
print('exists', path.exists(), 'size', path.stat().st_size if path.exists() else None)
if not path.exists():
    raise SystemExit(1)

xl = pd.ExcelFile(path)
print('sheets', xl.sheet_names)
for sheet in xl.sheet_names:
    df = pd.read_excel(path, sheet_name=sheet)
    print(f'\n=== {sheet} ===')
    print('rows', len(df), 'cols', len(df.columns))
    print('columns', list(df.columns))
    print(df.head(10).to_string())
