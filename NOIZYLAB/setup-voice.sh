#!/bin/bash
# DreamChamber Voice Setup Script

echo "🎤 DreamChamber Voice Setup"
echo "=========================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check for Whisper local installation
check_whisper() {
    if command -v whisper &> /dev/null; then
        echo -e "${GREEN}✓ Whisper CLI found${NC}"
    else
        echo -e "${YELLOW}⚠ Whisper CLI not found${NC}"
        echo "To install: pip3 install openai-whisper"
    fi
}

# Set up Moonshine ASR server
setup_moonshine() {
    echo -e "${GREEN}Setting up Moonshine ASR...${NC}"
    
    # Create moonshine server script
    cat > moonshine-server.py << 'EOF'
#!/usr/bin/env python3
"""Moonshine ASR Server for DreamChamber"""
import json
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import uvicorn
import whisper
import tempfile
import os

app = FastAPI()
model = whisper.load_model("base")

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        content = await audio.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        # Transcribe with Whisper
        result = model.transcribe(tmp_path)
        return JSONResponse({"text": result["text"]})
    finally:
        os.unlink(tmp_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8765)
EOF
    
    echo -e "${GREEN}✓ Moonshine server script created${NC}"
}

# Set up Kokoro TTS server
setup_kokoro() {
    echo -e "${GREEN}Setting up Kokoro TTS...${NC}"
    
    cat > kokoro-server.py << 'EOF'
#!/usr/bin/env python3
"""Kokoro TTS Server for DreamChamber"""
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import subprocess
import io

app = FastAPI()

class TTSRequest(BaseModel):
    text: str
    voice: str = "Samantha"

@app.post("/synthesize")
async def synthesize(request: TTSRequest):
    # Use macOS say command to generate audio
    process = subprocess.Popen(
        ["say", "-v", request.voice, request.text, "-o", "-"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    audio_data, _ = process.communicate()
    
    return StreamingResponse(
        io.BytesIO(audio_data),
        media_type="audio/aiff"
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8880)
EOF
    
    echo -e "${GREEN}✓ Kokoro server script created${NC}"
}

# Configure VSCode settings
configure_vscode() {
    echo -e "${GREEN}Configuring VSCode settings...${NC}"
    
    # Create .vscode directory if it doesn't exist
    mkdir -p .vscode
    
    # Create settings.json with voice configuration
    cat > .vscode/settings.json << 'EOF'
{
    "dreamchamber.transcriptionEngine": "whisper-api",
    "dreamchamber.ttsEngine": "say",
    "dreamchamber.sayVoice": "Samantha",
    "dreamchamber.defaultMode": "command",
    "dreamchamber.recordingSampleRate": 48000,
    "dreamchamber.gabrielSystemPrompt": "You are GABRIEL, a helpful voice assistant integrated with NOIZY's creative ecosystem. Be concise but warm. Help with coding, creative tasks, and system navigation."
}
EOF
    
    echo -e "${GREEN}✓ VSCode settings configured${NC}"
}

# Main setup
echo "1. Checking dependencies..."
check_whisper

echo ""
echo "2. Creating ASR/TTS servers..."
setup_moonshine
setup_kokoro

echo ""
echo "3. Configuring VSCode..."
configure_vscode

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Quick Start:"
echo "1. For Whisper API (recommended):"
echo "   - Set OPENAI_API_KEY in your environment"
echo "   - No server needed"
echo ""
echo "2. For local Moonshine ASR:"
echo "   python3 moonshine-server.py"
echo ""
echo "3. For Kokoro TTS:"
echo "   python3 kokoro-server.py"
echo ""
echo "4. In VSCode:"
echo "   - Open Command Palette (Cmd+Shift+P)"
echo "   - Run: DreamChamber: Toggle Recording"
echo "   - Or press: Ctrl+Shift+Space"
echo ""
echo "Voice will work with both Cascade (me) and Gabriel!"
