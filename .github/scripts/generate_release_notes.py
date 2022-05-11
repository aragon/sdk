import sys

changelog = sys.argv[1]


notes = []
with open(changelog, 'r') as f:
    lines = f.readlines()
    foundStart = False
    startLine = 0
    # Skip the template if necessary
    if lines[0] == "<!--\n":
        startLine = 15
    for i in range(startLine, len(lines), 1):
        line = lines[i]
        if line.startswith('## [TBD] '):
            foundStart = True
            continue
        if foundStart:
            if line.startswith('## ['):
                break
            notes.append(line.strip())

notesStr='  \n'.join(notes)

with open("release-notes.txt", "w") as f:
    f.write(notesStr)
