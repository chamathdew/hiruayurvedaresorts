import openpyxl
import pymongo
from datetime import datetime, date, timedelta
import re

# 1. Connect to MongoDB
client = pymongo.MongoClient('mongodb+srv://chamathdew2026_db_user:xEV5cvPdMYsBsY0Q@cluster0.dfhdcbj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['hiru_resorts']
collection = db['occupancy']
collection.delete_many({}) # Clear existing to avoid duplicates

# 2. Read Excel
wb = openpyxl.load_workbook('hiruom.xlsx', data_only=True)
ws = wb.active

print("Parsing Excel and identifying bookings...")
all_rows = list(ws.iter_rows())

i = 0
current_month_str = None
current_section = None
bookings = []

def parse_month_year(val):
    if isinstance(val, datetime):
        return val.year, val.month
    return None

while i < len(all_rows):
    row = all_rows[i]
    cell_a = row[0]
    val_a = cell_a.value

    # Is it a month header?
    parsed_my = parse_month_year(val_a)
    if parsed_my:
        year, month = parsed_my
        current_month_str = f"{year}-{month:02d}"
        i += 1
        continue

    # Is it a section header?
    if isinstance(val_a, str) and val_a.strip() in ['Ground Floor', 'First Floor', 'Reserve', 'Behind ', 'Roof Top', 'Corner 9', 'Behind']:
        current_section = val_a.strip()
        i += 1
        continue

    # Is it a room row?
    if isinstance(val_a, (int, float)) and val_a == int(val_a) and 1 <= int(val_a) <= 20:
        room_no = str(int(val_a))
        if not current_month_str:
            i += 1
            continue
            
        y, m = map(int, current_month_str.split('-'))
        
        # Analyze columns 2 to 32 (days 1 to 31)
        # Find contiguous blocks of color
        current_block = None
        
        def commit_block(block):
            if block and block['color'] != '00000000' and block['color'] != None:
                # Some colors like FFFFFFFF are also white/transparent
                if block['color'].upper() in ['FFFFFFFF', '00000000']:
                    return
                    
                start_date = datetime(y, m, block['start_day'])
                # Adjust end date (if it lasts to day 10, end date is 10)
                end_date = datetime(y, m, block['end_day'])
                
                # Format color: Excel uses ARGB or RGB. Usually AARRGGBB.
                color_hex = '#' + block['color'][-6:]
                
                text = block['text'].strip()
                if not text:
                    text = "Guest" # Fallback if text was missing
                    
                bookings.append({
                    'roomNo': room_no,
                    'hotelBranch': 'Hiru Ayurveda Resort',
                    'guestDetail': text,
                    'startDate': start_date,
                    'endDate': end_date,
                    'color': color_hex,
                    'remark': '',
                    '_class': 'com.hiruresort.backend.models.Occupancy'
                })

        for day_num in range(1, 32):
            col_idx = day_num # A is 0, B is 1 ... so day 1 is index 1
            if col_idx >= len(row):
                break
                
            cell = row[col_idx]
            fgColor = cell.fill.fgColor.rgb if cell.fill and cell.fill.fgColor else '00000000'
            if type(fgColor) is not str:
                fgColor = '00000000'
                
            cell_text = str(cell.value) if cell.value else ''
            
            # Special logic: If color changes OR it is a transparent cell
            if not current_block:
                if fgColor != '00000000':
                    current_block = {'color': fgColor, 'start_day': day_num, 'end_day': day_num, 'text': cell_text}
            else:
                if fgColor == current_block['color']:
                    # Extend block
                    current_block['end_day'] = day_num
                    if cell_text and cell_text != 'None':
                        current_block['text'] += ' ' + cell_text
                else:
                    # End previous block
                    commit_block(current_block)
                    # Start new if not transparent
                    if fgColor != '00000000':
                        current_block = {'color': fgColor, 'start_day': day_num, 'end_day': day_num, 'text': cell_text}
                    else:
                        current_block = None
        
        # End of line, commit any pending
        if current_block:
            commit_block(current_block)
            
    i += 1

print(f"Extracted {len(bookings)} bookings. Inserting into MongoDB...")
if bookings:
    result = collection.insert_many(bookings)
    print(f"Successfully inserted {len(result.inserted_ids)} records.")
else:
    print("No bookings found!")

print("Done!")
