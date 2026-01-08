#!/bin/bash
set -e

echo "🚀 Starting deployment to GitHub Pages..."

# Run the deploy script defined in package.json
# This triggers 'predeploy' (build) and then 'gh-pages -d dist'
npm run deploy

echo "✅ Deployment Successfully Initiated!"
echo "Your changes should be live in a few minutes at:"
echo "https://adam-elmi.github.io/SomMark-Playground/"
