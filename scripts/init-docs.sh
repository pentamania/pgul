#!/bin/bash

echo "Start documentation initializing process..."
# gh-pagesブランチを作成＆チェックアウト、docsを生成してcommit"
git checkout -b gh-pages
npm run docs
git add docs --force
git commit -m "Init document"
# origin/gh-pagesへpush
git subtree push --prefix docs origin gh-pages
# ローカルのgh-pagesブランチ削除
git checkout main
git branch -D gh-pages
echo "Documentation initializing finish!"