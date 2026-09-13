import sqlite3

conn = sqlite3.connect('paimana_canonical.db')
cur = conn.cursor()

print('=== DIM_STATE entries ===')
cur.execute("SELECT state_id, state_name FROM dim_state WHERE state_name LIKE 'J%' OR state_name LIKE 'Andaman%'")
for row in cur.fetchall():
    print(f'  {row[0]}: {repr(row[1])}')

print()
print('=== GOLD_STATE_SUMMARY for J* states ===')
cur.execute("SELECT state_name, project_count FROM gold_state_summary WHERE state_name LIKE 'J%' OR state_name LIKE 'Andaman%' ORDER BY state_name")
for row in cur.fetchall():
    print(f'  {repr(row[0])}: {row[1]} projects')

print()
print('=== BRIDGE for Jammu projects ===')
cur.execute("""
    SELECT b.project_id, st.state_name, c.project_name, c.state_name as curr_state
    FROM bridge_project_state b
    JOIN dim_state st ON b.state_id = st.state_id
    LEFT JOIN gold_project_current c ON b.project_id = c.project_id
    WHERE st.state_name LIKE 'Jammu%'
    LIMIT 5
""")
for row in cur.fetchall():
    print(f'  PID:{row[0]} BridgeState:{repr(row[1])} CurrState:{repr(row[3])}')

print()
print('=== ALL UNIQUE STATES IN GOLD_STATE_SUMMARY ===')
cur.execute("SELECT state_name, project_count FROM gold_state_summary ORDER BY project_count DESC")
for row in cur.fetchall():
    print(f'  {repr(row[0])}: {row[1]}')

conn.close()
