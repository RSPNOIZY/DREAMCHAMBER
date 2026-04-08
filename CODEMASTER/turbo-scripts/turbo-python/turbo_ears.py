#!/usr/bin/env python3
"""
turbo_ears.py
The Auditory System for Gabriel.
Listens to audio and transcribes it (Whisper API).
"""
import sys
import os
import time
import turbo_config

# Import MemCell for tracking
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), "core"))
try:
    from MemCell import MemCell
    mc = MemCell()
except ImportError:
    mc = None

def listen_and_transcribe():
    print("👂 Listening for speech...")
    # REAL LOGIC STUB (Requires PyAudio + Microphone Access)
    # audio = record_audio(duration=5)
    # text = whisper_transcribe(audio)
    
    # Simulation
    time.sleep(2)
    fake_text = "Gabriel, activate God Mode."
    print(f"📝 Transcribed: '{fake_text}'")
    
    if mc: mc.track("heard", "turbo_ears", {"text": fake_text})
    
    return fake_text

def main():
    print("🎤 Turbo Ears Active.")
    key = turbo_config.get_config("OPENAI_API_KEY")
    if not key:
        print("⚠️  Warning: OPENAI_API_KEY not found. Transcription will be simulated.")
    
    while True:
        try:
            listen_and_transcribe()
            time.sleep(5) # Listen every 5 seconds loop
        except KeyboardInterrupt:
            print("\n🛑 Stopped Listening.")
            break

if __name__ == "__main__":
    main()
