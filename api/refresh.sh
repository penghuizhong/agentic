#!/bin/bash
echo "清理旧环境..."
rm -rf .venv
rm -rf __pycache__

echo "重新安装精简版依赖..."
uv sync

echo "重启 Docker 服务..."
docker compose up -d --build

echo "✅ 方圆智版后端已焕然一新！"