#!/bin/bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/home/ai-tool/ai-tools-web"
PORT=6506
PM2_APP_NAME="ai-tools-web"

# 查找 PM2 路径
find_pm2() {
    local npm_root=$(npm root -g 2>/dev/null)
    local pm2_path="$npm_root/pm2/bin/pm2"
    if [ -f "$pm2_path" ]; then
        echo "$pm2_path"
    elif command -v pm2 &> /dev/null; then
        which pm2
    else
        echo "node $npm_root/pm2/bin/pm2"
    fi
}

echo -e "${GREEN}[INFO]${NC} 开始部署..."

cd "$PROJECT_DIR"
echo -e "${GREEN}[INFO]${NC} 工作目录: $(pwd)"

echo -e "${GREEN}[INFO]${NC} 安装依赖..."
npm install --silent

echo -e "${GREEN}[INFO]${NC} 构建项目..."
[ -d ".next" ] && rm -rf .next
npm run build

PM2_CMD=$(find_pm2)
echo -e "${GREEN}[INFO]${NC} PM2 路径: $PM2_CMD"

echo -e "${GREEN}[INFO]${NC} 停止旧进程..."
$PM2_CMD list 2>/dev/null | grep -q "$PM2_APP_NAME" && {
    $PM2_CMD stop "$PM2_APP_NAME" || true
    $PM2_CMD delete "$PM2_APP_NAME" || true
}

# 释放端口
PID=$(lsof -ti:$PORT 2>/dev/null || echo "")
[ -n "$PID" ] && {
    echo -e "${YELLOW}[WARN]${NC} 释放端口 $PORT"
    kill -9 "$PID" 2>/dev/null || true
    sleep 2
}

echo -e "${GREEN}[INFO]${NC} 启动服务 (端口 $PORT)..."
export PORT=$PORT NODE_ENV=production
$PM2_CMD start npm --name "$PM2_APP_NAME" -- start -- -p $PORT
$PM2_CMD save

echo ""
echo -e "${GREEN}[INFO]${NC} ============================================"
echo -e "${GREEN}[INFO]${NC} 部署完成！"
echo -e "${GREEN}[INFO]${NC} ============================================"
echo ""
$PM2_CMD status
echo ""
echo "常用命令:"
echo "  - 查看状态: $PM2_CMD status"
echo "  - 查看日志: $PM2_CMD logs $PM2_APP_NAME"
echo "  - 重启服务: $PM2_CMD restart $PM2_APP_NAME"
echo ""
echo "访问地址: http://$(hostname -I | awk '{print $1}'):$PORT"
echo ""
