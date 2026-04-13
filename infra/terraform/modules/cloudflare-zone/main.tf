# ═══════════════════════════════════════════════════════════════
# Module: cloudflare-zone
# Manages DNS records for a single Cloudflare zone
# ═══════════════════════════════════════════════════════════════

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

# ─── Zone Data Source ────────────────────────────────────────

data "cloudflare_zone" "this" {
  name       = var.domain
  account_id = var.account_id
}

# ─── DMARC Record ───────────────────────────────────────────

resource "cloudflare_record" "dmarc" {
  zone_id = data.cloudflare_zone.this.id
  name    = "_dmarc"
  type    = "TXT"
  content = "v=DMARC1; p=quarantine; rua=mailto:${var.dmarc_email}; pct=100"
  ttl     = 3600
}

# ─── SPF Record ─────────────────────────────────────────────

resource "cloudflare_record" "spf" {
  zone_id = data.cloudflare_zone.this.id
  name    = "@"
  type    = "TXT"
  content = var.spf_record
  ttl     = 3600
}

# ─── MX Records (optional — Google Workspace) ───────────────

resource "cloudflare_record" "mx" {
  for_each = var.mx_records

  zone_id  = data.cloudflare_zone.this.id
  name     = "@"
  type     = "MX"
  content  = each.key
  priority = each.value
  ttl      = 3600
}

# ─── Dummy A Record for Worker Routes ───────────────────────
# Required: Worker routes only fire when Cloudflare proxy is
# active on the hostname. This placeholder makes the proxy work.
# RFC 5737 reserved address — no real traffic reaches it.

resource "cloudflare_record" "root_a" {
  count = var.create_dummy_record ? 1 : 0

  zone_id = data.cloudflare_zone.this.id
  name    = "@"
  type    = "A"
  content = "192.0.2.1"
  proxied = true
  ttl     = 1 # Auto when proxied
}

resource "cloudflare_record" "www_cname" {
  count = var.create_dummy_record ? 1 : 0

  zone_id = data.cloudflare_zone.this.id
  name    = "www"
  type    = "CNAME"
  content = var.domain
  proxied = true
  ttl     = 1
}
