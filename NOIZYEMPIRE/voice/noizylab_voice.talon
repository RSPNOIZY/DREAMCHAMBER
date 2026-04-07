# NOIZYLAB Voice Engine - Talon Commands
# ========================================
# Copy to ~/.talon/user/noizylab_voice.talon
#
# Say these commands to trigger speech on the M2 Ultra.

# ─── Quick Speech ──────────────────────────────────
# "jamie say <phrase>" → Jamie speaks the phrase
jamie say <user.text>:
    user.speak_jamie(user.text)

# "gabriel say <phrase>" → GABRIEL speaks (priority)
gabriel say <user.text>:
    user.speak_gabriel(user.text)

# ─── Voice Selection ──────────────────────────────
# "voice samantha <phrase>" → specific voice
voice jamie <user.text>:
    user.speak_voice(user.text, "jamie")

voice samantha <user.text>:
    user.speak_voice(user.text, "samantha")

voice daniel <user.text>:
    user.speak_voice(user.text, "daniel")

voice karen <user.text>:
    user.speak_voice(user.text, "karen")

voice moira <user.text>:
    user.speak_voice(user.text, "moira")

voice alex <user.text>:
    user.speak_voice(user.text, "alex")

voice fiona <user.text>:
    user.speak_voice(user.text, "fiona")

voice tessa <user.text>:
    user.speak_voice(user.text, "tessa")

# ─── Speed Variants ──────────────────────────────
# "speak fast <phrase>" → 250 wpm
speak fast <user.text>:
    user.speak_fast(user.text)

# "speak slow <phrase>" → 130 wpm
speak slow <user.text>:
    user.speak_slow(user.text)

# ─── Priority / Urgent ────────────────────────────
# "urgent say <phrase>" → jumps the queue
urgent say <user.text>:
    user.speak_urgent(user.text)

# ─── Controls ─────────────────────────────────────
# "voice stop" → kill speech + clear queue
voice stop:
    user.speak_stop()

# "voice status" → report queue state
voice status:
    result = user.speak_status()
    app.notify(result)

# "voice test" → connection test
voice test:
    user.speak_test()

# "voice list" → show available voices
voice list:
    result = user.speak_list_voices()
    app.notify(result)
