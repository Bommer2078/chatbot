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

# 如果你想要部署到 https://<USERNAME>.github.io/<REPO>
# 请将下面的 <USERNAME> 替换为您的 GitHub 用户名
git push -f git@github.com:Bommer2078/chatbot.git master:gh-pages

cd - 