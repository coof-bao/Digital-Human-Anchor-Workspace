#!/bin/bash
cd "$(dirname "$0")"
bash ./start_demo.sh
echo ""
echo "按 Enter 关闭此窗口（Demo 服务仍在后台运行；要停止请执行 kill \$(cat .demo_server.pid)）"
read -r
