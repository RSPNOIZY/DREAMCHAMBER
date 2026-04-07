# NOIZYLAB System Commands — Talon Voice Control
# =================================================
# Copy to ~/.talon/user/noizylab_system.talon
#
# Voice-activate the entire NOIZYLAB infrastructure.

# ─── System Health ────────────────────────────────
# "system status" → full health check
system status:
    user.system_status()

# "device check" → ping all machines
device check:
    user.device_check()

# "cloud report" → Cloudflare infrastructure summary
cloud report:
    user.cloud_report()

# ─── GABRIEL Control ──────────────────────────────
# "gabriel status" → orchestration engine check
gabriel status:
    user.gabriel_status()

# "gabriel start" → start server + bridge
gabriel start:
    user.gabriel_start()

# "gabriel stop" → shutdown server + bridge
gabriel stop:
    user.gabriel_stop()

# ─── Business ────────────────────────────────────
# "repair queue" → check repair service jobs
repair queue:
    user.repair_queue()

# ─── Reports ─────────────────────────────────────
# "morning report" → comprehensive morning briefing
morning report:
    user.morning_report()

# ─── Emergency ───────────────────────────────────
# "kill the noise" → emergency stop everything
kill the noise:
    user.kill_the_noise()
