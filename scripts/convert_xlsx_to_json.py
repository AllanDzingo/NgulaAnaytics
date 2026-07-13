"""
Converts the client-supplied PGM Concentrator workbook into two JSON files that
are bundled with the API and loaded by the DataSeeder. Uses only the Python
standard library (no pandas) so it runs anywhere.
"""
import zipfile, re, json, datetime
import xml.etree.ElementTree as ET

SRC = r'c:/Users/Hanco Sipsma/Downloads/PGM_Concentrator_400tph_Random_Data.xlsx'
OUT_DIR = r'c:/Users/Hanco Sipsma/Desktop/Allan 2025/Ngula Analytics/src/NgulAnalytics.Api/Seed/Data'
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

z = zipfile.ZipFile(SRC)

# shared strings
shared = []
ss = ET.fromstring(z.read('xl/sharedStrings.xml'))
for si in ss.iter(NS + 'si'):
    shared.append(''.join(t.text or '' for t in si.iter(NS + 't')))

EPOCH = datetime.datetime(1899, 12, 30)

def excel_to_iso(serial, with_time):
    try:
        f = float(serial)
    except (TypeError, ValueError):
        return None
    dt = EPOCH + datetime.timedelta(days=f)
    return dt.isoformat() if with_time else dt.date().isoformat()

def col_letters(ref):
    return re.match(r'[A-Z]+', ref).group(0)

def read_rows(fname):
    sheet = ET.fromstring(z.read(fname))
    out = []
    for r in sheet.iter(NS + 'row'):
        rowmap = {}
        for c in r.iter(NS + 'c'):
            ref = c.get('r', '')
            t = c.get('t')
            v = c.find(NS + 'v')
            val = v.text if v is not None else None
            if t == 's' and val is not None:
                val = shared[int(val)]
            rowmap[col_letters(ref)] = val
        out.append(rowmap)
    return out

def num(v):
    if v is None or v == '':
        return None
    try:
        return round(float(v), 4)
    except ValueError:
        return None

def build(fname, header_row_index, mapping, date_cols):
    rows = read_rows(fname)
    header = rows[header_row_index]
    # find the columns present
    records = []
    for r in rows[header_row_index + 1:]:
        if not any(r.get(col) not in (None, '') for col in r):
            continue
        rec = {}
        empty = True
        for col, (key, kind) in mapping.items():
            raw = r.get(col)
            if raw not in (None, ''):
                empty = False
            if kind == 'num':
                rec[key] = num(raw)
            elif kind == 'date':
                rec[key] = excel_to_iso(raw, with_time=(col in date_cols and date_cols[col] == 'dt'))
            else:
                rec[key] = raw
        if not empty:
            records.append(rec)
    return records

# ---- Production Data (sheet1), header at row 8 (index 7) ----
prod_map = {
    'A': ('Timestamp', 'date'), 'B': ('Date', 'date'), 'C': ('Shift', 'str'), 'D': ('Crew', 'str'),
    'E': ('OperatingHours', 'num'), 'F': ('PlantFeedTph', 'num'), 'G': ('RomFeedTonnes', 'num'),
    'H': ('PrimaryCrusherTph', 'num'), 'I': ('SecondaryCrusherTph', 'num'),
    'J': ('PrimaryMillTph', 'num'), 'K': ('SecondaryMillTph', 'num'),
    'L': ('PrimaryRougherFeedTph', 'num'), 'M': ('SecondaryRougherFeedTph', 'num'),
    'N': ('HeadGrade4E', 'num'), 'O': ('PrimaryRougherRecovery', 'num'),
    'P': ('SecondaryRougherRecovery', 'num'), 'Q': ('OverallPgmRecovery', 'num'),
    'R': ('ConcentrateTonnes', 'num'), 'S': ('ConcentrateGrade4E', 'num'), 'T': ('TailingsGrade4E', 'num'),
    'U': ('PrimaryMillP80Um', 'num'), 'V': ('SecondaryMillP80Um', 'num'),
    'W': ('WaterAdditionM3H', 'num'), 'X': ('PlantPowerMw', 'num'), 'Y': ('GrindingMediaKgT', 'num'),
    'Z': ('CollectorGT', 'num'), 'AA': ('FrotherGT', 'num'), 'AB': ('Ph', 'num'),
    'AC': ('Availability', 'num'), 'AD': ('Utilisation', 'num'), 'AE': ('DowntimeMinutes', 'num'),
    'AF': ('DowntimeCategory', 'str'), 'AG': ('ProductionStatus', 'str'), 'AH': ('Comments', 'str'),
}
production = build('xl/worksheets/sheet1.xml', 7, prod_map, {'A': 'dt', 'B': 'd'})

# ---- Engineering CM Data (sheet2), header at row 8 (index 7) ----
eng_map = {
    'A': ('Timestamp', 'date'), 'B': ('Date', 'date'), 'C': ('Shift', 'str'), 'D': ('Area', 'str'),
    'E': ('EquipmentId', 'str'), 'F': ('EquipmentName', 'str'), 'G': ('EquipmentType', 'str'),
    'H': ('RunningHours', 'num'), 'I': ('LoadPercent', 'num'), 'J': ('MotorCurrentA', 'num'),
    'K': ('PowerKw', 'num'), 'L': ('DeVibrationMmS', 'num'), 'M': ('NdeVibrationMmS', 'num'),
    'N': ('DeBearingTempC', 'num'), 'O': ('NdeBearingTempC', 'num'), 'P': ('GearboxOilTempC', 'num'),
    'Q': ('OilIso4406Code', 'str'), 'R': ('LubePressureBar', 'num'), 'S': ('HydraulicPressureBar', 'num'),
    'T': ('BearingUltrasoundDb', 'num'), 'U': ('WearLinerRemaining', 'num'),
    'V': ('LastPmDate', 'date'), 'W': ('NextPmDate', 'date'), 'X': ('DaysToPm', 'num'),
    'Y': ('ConditionStatus', 'str'), 'Z': ('AlarmCount', 'num'), 'AA': ('EstimatedRulDays', 'num'),
    'AB': ('MaintenanceRecommendation', 'str'),
}
engineering = build('xl/worksheets/sheet2.xml', 7, eng_map, {'A': 'dt', 'B': 'd', 'V': 'd', 'W': 'd'})

import os
os.makedirs(OUT_DIR, exist_ok=True)
with open(os.path.join(OUT_DIR, 'production-data.json'), 'w', encoding='utf-8') as f:
    json.dump(production, f, indent=1)
with open(os.path.join(OUT_DIR, 'engineering-cm-data.json'), 'w', encoding='utf-8') as f:
    json.dump(engineering, f, indent=1)

print('production records:', len(production))
print('engineering records:', len(engineering))
print('sample production:', json.dumps(production[0], indent=1) if production else 'none')
print('sample engineering:', json.dumps(engineering[0], indent=1) if engineering else 'none')
