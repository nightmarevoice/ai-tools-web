#!/bin/bash

# ============================================
# AI Tools Web 项目部署脚本
# ============================================
# 用途：在 Linux 服务器上部署 Next.js 项目
# 端口：6506
# 项目路径：/home/ai-tool
# ============================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_DIR="/home/ai-tool"
PORT=6506
APP_NAME="ai-tools-web"
PM2_APP_NAME="ai-tools-web"

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -eq 0 ]; then 
        log_warn "检测到 root 用户，建议使用普通用户运行此脚本"
    fi
}

# 检查 Node.js 是否安装
check_node() {
    log_info "检查 Node.js 环境..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js 18+"
        log_info "安装示例（Ubuntu/Debian）："
        echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "  sudo apt-get install -y nodejs"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 版本过低，需要 18 或更高版本，当前版本: $(node -v)"
        exit 1
    fi
    
    log_info "Node.js 版本: $(node -v)"
    log_info "npm 版本: $(npm -v)"
}

# 检查 pm2 是否安装
check_pm2() {
    log_info "检查 PM2 进程管理器..."
    
    if ! command -v pm2 &> /dev/null; then
        log_warn "PM2 未安装，正在安装..."
        npm install -g pm2
        log_info "PM2 安装完成"
    else
        log_info "PM2 已安装，版本: $(pm2 -v)"
    fi
}

# 检查项目目录
check_project_dir() {
    log_info "检查项目目录..."
    
    if [ ! -d "$PROJECT_DIR" ]; then
        log_error "项目目录不存在: $PROJECT_DIR"
        log_info "请确保项目已上传到服务器"
        exit 1
    fi
    
    cd "$PROJECT_DIR" || exit 1
    log_info "当前工作目录: $(pwd)"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 检查是否有 package-lock.json 或 pnpm-lock.yaml
    if [ -f "package-lock.json" ]; then
        log_info "使用 npm 安装依赖..."
        npm ci --production=false
    elif [ -f "pnpm-lock.yaml" ]; then
        log_info "检测到 pnpm，使用 pnpm 安装依赖..."
        if ! command -v pnpm &> /dev/null; then
            log_info "安装 pnpm..."
            npm install -g pnpm
        fi
        pnpm install
    else
        log_info "使用 npm 安装依赖..."
        npm install
    fi
    
    log_info "依赖安装完成"
}

# 检查环境变量
check_env() {
    log_info "检查环境变量配置..."
    
    if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
        log_warn "未找到环境变量文件 (.env.local 或 .env)"
        log_warn "请确保已配置以下环境变量："
        echo "  - NEXT_PUBLIC_API_BASE_URL"
        echo "  - NEXT_PUBLIC_SUPABASE_URL"
        echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        log_info "创建 .env.local 文件示例："
        echo "  cp .env.example .env.local  # 如果有示例文件"
        echo "  或手动创建 .env.local 文件"
        read -p "是否继续部署？(y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_info "找到环境变量文件"
    fi
}

# 构建项目
build_project() {
    log_info "构建 Next.js 项目..."
    
    # 清理之前的构建
    if [ -d ".next" ]; then
        log_info "清理旧的构建文件..."
        rm -rf .next
    fi
    
    # 执行构建
    npm run build
    
    if [ ! -d ".next" ]; then
        log_error "构建失败，.next 目录不存在"
        exit 1
    fi
    
    log_info "项目构建完成"
}

# 停止旧进程
stop_old_process() {
    log_info "检查并停止旧进程..."
    
    # 检查 pm2 进程
    if pm2 list | grep -q "$PM2_APP_NAME"; then
        log_info "停止 PM2 进程: $PM2_APP_NAME"
        pm2 stop "$PM2_APP_NAME" || true
        pm2 delete "$PM2_APP_NAME" || true
    fi
    
    # 检查端口占用
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln | grep -q ":$PORT "; then
        log_warn "端口 $PORT 已被占用，尝试释放..."
        PID=$(lsof -ti:$PORT 2>/dev/null || netstat -tlnp 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1 | head -1)
        if [ ! -z "$PID" ]; then
            log_info "终止占用端口的进程: $PID"
            kill -9 "$PID" 2>/dev/null || true
            sleep 2
        fi
    fi
}

# 启动服务
start_service() {
    log_info "启动服务..."
    
    # 设置环境变量
    export PORT=$PORT
    export NODE_ENV=production
    
    # 使用 PM2 启动服务
    log_info "使用 PM2 启动服务，端口: $PORT"
    pm2 start npm --name "$PM2_APP_NAME" -- start -- -p $PORT
    
    # 保存 PM2 配置
    pm2 save
    
    # 设置 PM2 开机自启
    log_info "配置 PM2 开机自启..."
    pm2 startup | grep -v "PM2" | bash || {
        log_warn "PM2 开机自启配置可能需要手动执行，请运行: pm2 startup"
    }
    
    log_info "服务启动完成"
}

# 检查服务状态
check_service() {
    log_info "检查服务状态..."
    sleep 3
    
    # 检查 PM2 状态
    pm2 status
    
    # 检查端口监听
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln | grep -q ":$PORT "; then
        log_info "✓ 服务正在监听端口 $PORT"
    else
        log_warn "✗ 服务可能未正常启动，请检查日志: pm2 logs $PM2_APP_NAME"
    fi
    
    # 检查 HTTP 响应
    log_info "测试服务响应..."
    if command -v curl &> /dev/null; then
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT" | grep -q "200\|301\|302"; then
            log_info "✓ 服务响应正常"
        else
            log_warn "✗ 服务响应异常，请检查日志"
        fi
    fi
}

# 显示部署信息
show_info() {
    log_info "============================================"
    log_info "部署完成！"
    log_info "============================================"
    echo ""
    echo "项目信息："
    echo "  - 项目目录: $PROJECT_DIR"
    echo "  - 服务端口: $PORT"
    echo "  - PM2 应用名: $PM2_APP_NAME"
    echo ""
    echo "常用命令："
    echo "  - 查看状态: pm2 status"
    echo "  - 查看日志: pm2 logs $PM2_APP_NAME"
    echo "  - 重启服务: pm2 restart $PM2_APP_NAME"
    echo "  - 停止服务: pm2 stop $PM2_APP_NAME"
    echo "  - 删除服务: pm2 delete $PM2_APP_NAME"
    echo ""
    echo "访问地址："
    echo "  - http://localhost:$PORT"
    echo "  - http://$(hostname -I | awk '{print $1}'):$PORT"
    echo ""
    log_info "============================================"
}

# 主函数
main() {
    log_info "============================================"
    log_info "开始部署 AI Tools Web 项目"
    log_info "============================================"
    echo ""
    
    check_root
    check_node
    check_pm2
    check_project_dir
    install_dependencies
    check_env
    build_project
    stop_old_process
    start_service
    check_service
    show_info
    
    log_info "部署脚本执行完成！"
}

# 执行主函数
main

