import json
import os

try:
    labels = json.loads(os.getenv('PULL_LABELS'))
except:
    labels = []

matrix = []
for label in labels:
    splitted = label.name.split(':')
    if len(splitted) == 2:
        if splitted[1] == 'breaking' or splitted[1] == 'feature' or splitted[1] == 'fix':
            matrix.append({
                'package': splitted[0],
                'bump': splitted[1]
            })

print("::set-output name=matrix::" + json.dumps(matrix))