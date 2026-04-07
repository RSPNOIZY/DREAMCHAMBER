#!/bin/bash
# NOIZYLAB Service Launcher
# Start all NOIZY services with one command

echo "🚀 NOIZYLAB Service Launcher"
echo "=========================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill existing services
echo -e "${YELLOW}Stopping any existing services...${NC}"
pkill -f "uvicorn rob_ava.server"
pkill -f "uvicorn app.main"
pkill -f "whatsapp-gabriel.js"
sleep 2

# Start Rob AVA API
echo -e "${GREEN}Starting Rob AVA API on port 8091...${NC}"
python3 -m uvicorn rob_ava.server:app --reload --port 8091 &
ROB_AVA_PID=$!

# Start NOIZY Platform API
echo -e "${GREEN}Starting NOIZY Platform API on port 8090...${NC}"
cd noizy_platform && python3 -m uvicorn app.main:app --reload --port 8090 &
PLATFORM_PID=$!
cd ..

# Optional: Start WhatsApp bot (requires API keys)
if [ -f ".env" ] && grep -q "COHERE_API_KEY=your_cohere_api_key_here" .env; then
    echo -e "${YELLOW}WhatsApp bot not started - please configure .env file${NC}"
else
    echo -e "${GREEN}Starting WhatsApp bot...${NC}"
    node whatsapp-gabriel.js &
    WHATSAPP_PID=$!
fi

echo ""
echo "Services running:"
echo "- Rob AVA API: http://localhost:8091/docs"
echo "- NOIZY Platform API: http://localhost:8090/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C and kill all services
trap 'echo "Stopping all services..."; kill $ROB_AVA_PID $PLATFORM_PID $WHATSAPP_PID 2>/dev/null; exit' INT

# Wait for processes
wait
