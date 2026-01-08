#!/bin/bash

# Documentation
git add README.md && git commit -m "Updated README documentation"
git add public/screenshots/ && git commit -m "Added documentation screenshots"

# Cleanup
# Use git add -u to stage the deletion of deploy.sh if it's missing
git add -u deploy.sh && git commit -m "Removed deployment script"

# Maintenance
git add commits.sh && git commit -m "Updated commit script"

echo "All new changes committed."
