import zipfile, re, sys
import xml.etree.ElementTree as ET

path = r'c:/Users/Hanco Sipsma/Downloads/PGM_Concentrator_400tph_Random_Data.xlsx'
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

z = zipfile.ZipFile(path)

# workbook sheet names
wb = ET.fromstring(z.read('xl/workbook.xml'))
sheets = [(s.get('name')) for s in wb.iter(NS + 'sheet')]
print('WORKBOOK SHEETS:', sheets)

# shared strings
shared = []
if 'xl/sharedStrings.xml' in z.namelist():
    ss = ET.fromstring(z.read('xl/sharedStrings.xml'))
    for si in ss.iter(NS + 'si'):
        text = ''.join(t.text or '' for t in si.iter(NS + 't'))
        shared.append(text)

def col_letters(ref):
    return re.match(r'[A-Z]+', ref).group(0)

def dump_sheet(fname, label, start=7, end=12):
    print('\n' + '=' * 60)
    print(label, fname, f'(rows {start}-{end})')
    print('=' * 60)
    sheet = ET.fromstring(z.read(fname))
    rows = list(sheet.iter(NS + 'row'))
    print('total rows:', len(rows))
    for r in rows[start - 1:end]:
        cells = []
        for c in r.iter(NS + 'c'):
            ref = c.get('r', '')
            t = c.get('t')
            v = c.find(NS + 'v')
            val = v.text if v is not None else ''
            if t == 's' and val != '':
                val = shared[int(val)]
            if val != '':
                cells.append(f'{col_letters(ref)}={val}')
        print('ROW', r.get('r'), ':', ' | '.join(cells))

dump_sheet('xl/worksheets/sheet1.xml', 'SHEET1 Production', 7, 11)
dump_sheet('xl/worksheets/sheet2.xml', 'SHEET2 Engineering', 7, 11)


