#!/bin/bash

echo "Start document-updating..."
git checkout -b gh-pages
git subtree add --prefix docs origin gh-pages
npm run docs
git add docs --force
git commit -m "Update document"
git subtree push --prefix docs origin gh-pages
echo "Success updating documents, deleting local gh-pages branch..."
git checkout main
git branch -D gh-pages
echo "Document updating finish!"