#!/bin/bash

# Refactoring
git add src/components/playground/defaults.ts && git commit -m "Refactored DEFAULT_MAPPER to use imported constant"

# Scripts
git add commits.sh && git commit -m "Added commit automation script"

echo "All new changes committed."
