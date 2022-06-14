import sys

changelog = sys.argv[1]

releaseNotesLines = []
with open(changelog, 'r') as f:
    lines = f.readlines()
    foundStart = False
    i = 0
    while i < len(lines):
        line = lines[i]
        if foundStart:
            if line.startswith('## ['):
                break
            releaseNotesLines.append(line.strip())
        if line.startswith("<!--\n"):  # Skip the token line
            i += 3
            continue
        if line.startswith('## [UPCOMING]'):
            foundStart = True
        i += 1

releaseNotesMsg='  \n'.join(releaseNotesLines)

with open("release-notes.txt", "w") as f:
    f.write(releaseNotesMsg)
