import json
import os

try:
    labels = json.loads(os.getenv('PULL_LABELS'))
except:
    labels = []

matrix = []
hasLabels = False
for label in labels:
    splitted = label['name'].split(':')
    if len(splitted) == 2:
        if splitted[1] == 'breaking' or splitted[1] == 'feature' or splitted[1] == 'fix':
            bump = 'patch'
            if splitted[1] == 'breaking':
                bump = 'major'
            elif splitted[1] == 'feature':
                bump = 'minor'

            matrix.append({
                'package': splitted[0],
                'bump': bump
            })
            hasLabels = True

print("::set-output name=hasLabels::" + str(hasLabels))
print("::set-output name=matrix::" + json.dumps({'include': matrix}))
