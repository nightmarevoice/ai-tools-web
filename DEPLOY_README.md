# 部署说明

## 快速开始

### 1. 上传文件到服务器

将整个项目上传到服务器的 `/home/ai-tool` 目录，包括：
- 项目所有文件
- `deploy.sh` 部署脚本

### 2. 给脚本添加执行权限

```bash
chmod +x /home/ai-tool/deploy.sh
```

### 3. 运行部署脚本

```bash
cd /home/ai-tool
./deploy.sh
```

或者直接：

```bash
bash /home/ai-tool/deploy.sh
```

## 前置要求

### Node.js 环境

脚本会自动检查 Node.js，如果未安装，需要先安装 Node.js 18+：

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**CentOS/RHEL:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 环境变量配置

在运行脚本前，确保已配置环境变量文件 `.env.local`：

```env
NEXT_PUBLIC_API_BASE_URL=http://your-api-url:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 脚本功能

部署脚本会自动执行以下操作：

1. ✅ 检查 Node.js 和 npm 环境
2. ✅ 检查并安装 PM2 进程管理器
3. ✅ 验证项目目录存在
4. ✅ 安装项目依赖（npm/pnpm）
5. ✅ 检查环境变量配置
6. ✅ 构建 Next.js 项目
7. ✅ 停止旧进程（如果存在）
8. ✅ 使用 PM2 启动服务（端口 6506）
9. ✅ 配置 PM2 开机自启
10. ✅ 验证服务状态

## 服务管理

部署完成后，使用以下命令管理服务：

### 查看服务状态
```bash
pm2 status
```

### 查看日志
```bash
# 实时日志
pm2 logs ai-tools-web

# 最近 100 行日志
pm2 logs ai-tools-web --lines 100
```

### 重启服务
```bash
pm2 restart ai-tools-web
```

### 停止服务
```bash
pm2 stop ai-tools-web
```

### 删除服务
```bash
pm2 delete ai-tools-web
```

### 重新部署
```bash
cd /home/ai-tool
./deploy.sh
```

## 访问服务

部署成功后，可以通过以下地址访问：

- 本地访问: `http://localhost:6506`
- 服务器 IP: `http://<服务器IP>:6506`

## 故障排查

### 1. 端口被占用

如果端口 6506 被占用，脚本会尝试自动释放。也可以手动检查：

```bash
# 查看端口占用
lsof -i :6506
# 或
netstat -tuln | grep 6506

# 终止进程（替换 PID）
kill -9 <PID>
```

### 2. 构建失败

检查 Node.js 版本和依赖：

```bash
node -v  # 需要 18+
npm -v
cd /home/ai-tool
npm install
npm run build
```

### 3. 服务无法启动

查看 PM2 日志：

```bash
pm2 logs ai-tools-web --err
```

### 4. 环境变量未生效

确保 `.env.local` 文件在项目根目录，并且变量名正确（注意大小写）。

### 5. PM2 开机自启失败

手动配置：

```bash
pm2 startup
# 执行输出的命令（通常是 sudo 命令）
pm2 save
```

## 更新项目

当需要更新项目时：

1. 上传新文件到服务器（覆盖旧文件）
2. 运行部署脚本：
   ```bash
   cd /home/ai-tool
   ./deploy.sh
   ```

脚本会自动停止旧服务、重新构建并启动新服务。

## 注意事项

- ⚠️ 确保服务器防火墙开放 6506 端口
- ⚠️ 生产环境建议使用 Nginx 反向代理
- ⚠️ 定期备份 `.env.local` 文件
- ⚠️ 建议使用非 root 用户运行脚本

## Nginx 反向代理配置（可选）

如果需要使用域名访问，可以配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:6506;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

然后重启 Nginx：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

