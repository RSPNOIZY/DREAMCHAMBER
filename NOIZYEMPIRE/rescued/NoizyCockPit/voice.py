import speech_recognition as sr
from dashboard import show_dashboard, show_branding

FILEPATH = "data/account_alignment.csv"

def listen_and_execute():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("🎙️ Listening for command...")
        audio = r.listen(source)

    try:
        command = r.recognize_google(audio).lower()
        print(f"🧠 Command received: {command}")

        if "show dashboard" in command:
            show_dashboard(FILEPATH)
        elif "show branding" in command:
            show_branding()
        else:
            print("❌ Unknown command.")
    except Exception as e:
        print(f"⚠️ Error: {e}")
