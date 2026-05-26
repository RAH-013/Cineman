#!/bin/bash

echo "===== SERVER HTOP ====="
echo ""

echo "Fecha:"
date
echo ""

echo "Uptime:"
uptime -p
echo ""

echo "CPU:"
top -bn1 | grep "Cpu(s)"
echo ""

echo "RAM:"
free -h | grep Mem
echo ""

echo "Disco:"
df -h / | tail -1
echo ""

echo "Procesos:"
ps -eo comm,%cpu,%mem --sort=-%cpu | head -n 6