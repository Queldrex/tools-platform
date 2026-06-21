import re

with open('app/tools/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix garbled UTF-8 from PowerShell encoding issue
# Garbled sequences come from UTF-8 bytes interpreted as Windows-1252/Latin-1
content = content.replace('â', '-')  # â€" = em dash
content = content.replace('â', '-')  # â€" = en dash
content = content.replace('Â·', '·')   # Â· = middle dot (keep as ·)
content = content.replace('â', "'")  # â€˜ = left single quote
content = content.replace('â', "'")  # â€™ = right single quote

# Fix icon lines: replace any icon value containing non-ASCII with empty string
lines = content.split('\n')
fixed = []
for line in lines:
    if "icon: '" in line and any(ord(c) > 127 for c in line):
        line = re.sub(r"icon: '.*'", "icon: ''", line)
    fixed.append(line)

content = '\n'.join(fixed)

# Fix metadata title
content = content.replace("'All Tools â Queldrex'", "'All Tools - Queldrex'")
content = content.replace("'All Tools - Queldrex'", "'All Tools - Queldrex'")

with open('app/tools/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('done')
