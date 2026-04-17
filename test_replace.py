import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

replacements = [
    (r'"linear-gradient\(160deg, #07070f 0%, #0d0d1a 40%, #0a0a14 100%\)"', '"var(--bg-grad)"'),
    (r'"#e2e8f0"', '"var(--text-main)"'),
    (r'"rgba\(15,15,25,0\.7\)"', '"var(--card-bg)"'),
    (r'"rgba\(10,10,20,0\.7\)"', '"var(--panel-bg)"'),
    (r'"rgba\(0,0,0,([^)]+)\)"', r'"rgba(var(--b-rgb),\1)"'),
    (r'"rgba\(255,255,255,([^)]+)\)"', r'"rgba(var(--w-rgb),\1)"'),
    (r'"#111"', '"var(--select-bg)"'),
    (r'"#07070f"', '"var(--bg-start)"'),
]

new_code = code
for pattern, replacement in replacements:
    new_code = re.sub(pattern, replacement, new_code)

print(f"Original length: {len(code)}")
print(f"New length: {len(new_code)}")

import collections
changes = collections.Counter()
for pattern, replacement in replacements:
    changes[pattern] = len(re.findall(pattern, code))

for k, v in changes.items():
    print(f"{k}: {v} matches")

with open('src/App_temp.jsx', 'w', encoding='utf-8') as f:
    f.write(new_code)
