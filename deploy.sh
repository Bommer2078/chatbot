#!/usr/bin/env sh

# 当发生错误时中止脚本
set -e

# 构建
npm run build

# 进入构建输出目录
cd dist

# 如果你是要部署到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 使用 HTTPS 方式推送到 GitHub Pages
git push -f https://Bommer2078@github.com/Bommer2078/chatbot.git master:gh-pages

cd - 