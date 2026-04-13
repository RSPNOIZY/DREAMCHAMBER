# ═══════════════════════════════════════════════════════════════
# Module: cloudflare-worker
# Manages a Cloudflare Worker + routes + storage bindings
# ═══════════════════════════════════════════════════════════════

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

# ─── Worker Script ───────────────────────────────────────────

resource "cloudflare_worker_script" "this" {
  account_id = var.account_id
  name       = var.worker_name
  content    = file(var.script_path)
  module     = var.module_format

  dynamic "d1_database_binding" {
    for_each = var.d1_bindings
    content {
      name        = d1_database_binding.key
      database_id = d1_database_binding.value
    }
  }

  dynamic "kv_namespace_binding" {
    for_each = var.kv_bindings
    content {
      name         = kv_namespace_binding.key
      namespace_id = kv_namespace_binding.value
    }
  }

  dynamic "plain_text_binding" {
    for_each = var.env_vars
    content {
      name = plain_text_binding.key
      text = plain_text_binding.value
    }
  }
}

# ─── Worker Routes ───────────────────────────────────────────

resource "cloudflare_worker_route" "routes" {
  for_each = var.routes

  zone_id     = each.value.zone_id
  pattern     = each.key
  script_name = cloudflare_worker_script.this.name
}
