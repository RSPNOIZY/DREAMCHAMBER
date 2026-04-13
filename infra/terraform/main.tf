# ═══════════════════════════════════════════════════════════════
# NOIZY EMPIRE — Terraform Infrastructure Plan
# Cloudflare + Google Workspace + GCP
# ═══════════════════════════════════════════════════════════════
#
# Usage:
#   cd infra/terraform
#   terraform init
#   terraform plan -var-file="noizy.tfvars"
#   terraform apply -var-file="noizy.tfvars"
#
# Prerequisites:
#   - Cloudflare API token with Zone:Edit, DNS:Edit, Account:Read
#   - Google Cloud project with billing enabled
#   - terraform >= 1.5
# ═══════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.5"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

# ─── Variables ───────────────────────────────────────────────

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
  default     = "5f36aa9795348ea681d0b21910dfc82a"
}

variable "gcp_project_id" {
  description = "Google Cloud project ID"
  type        = string
  default     = "noizy-empire-01"
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "admin_email" {
  description = "Backend admin email"
  type        = string
  default     = "rsplowman@icloud.com"
}

variable "public_email" {
  description = "Public-facing email"
  type        = string
  default     = "rsp@noizy.ai"
}

# ─── Providers ───────────────────────────────────────────────

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# ─── Locals ──────────────────────────────────────────────────

locals {
  domains = {
    "noizy.ai" = {
      description = "Primary AI platform"
      email_routing = false # Google Workspace handles email
      landing_page  = true
    }
    "noizyfish.com" = {
      description = "Master brand"
      email_routing = true
      landing_page  = false
    }
    "fishmusicinc.com" = {
      description = "Legacy music entity"
      email_routing = true
      landing_page  = false
    }
    "noizyfish.ca" = {
      description = "Canadian alias"
      email_routing = true
      landing_page  = false
    }
  }

  email_addresses = {
    "noizy.ai"         = ["rsp", "hello", "support", "gabriel"]
    "noizyfish.com"    = ["rsp", "hello", "carolina"]
    "fishmusicinc.com" = ["rsp", "info"]
    "noizyfish.ca"     = ["rsp"]
  }

  google_mx_records = {
    "aspmx.l.google.com"      = 1
    "alt1.aspmx.l.google.com" = 5
    "alt2.aspmx.l.google.com" = 5
    "alt3.aspmx.l.google.com" = 10
    "alt4.aspmx.l.google.com" = 10
  }
}

# ─── Cloudflare Zones (data sources — zones already exist) ──

data "cloudflare_zone" "domains" {
  for_each   = local.domains
  name       = each.key
  account_id = var.cloudflare_account_id
}

# ─── DMARC Records ──────────────────────────────────────────

resource "cloudflare_record" "dmarc" {
  for_each = local.domains

  zone_id = data.cloudflare_zone.domains[each.key].id
  name    = "_dmarc"
  type    = "TXT"
  content = "v=DMARC1; p=quarantine; rua=mailto:${var.public_email}; pct=100"
  ttl     = 3600
}

# ─── SPF Records (for CF Email Routing domains) ─────────────

resource "cloudflare_record" "spf_cf" {
  for_each = { for k, v in local.domains : k => v if v.email_routing }

  zone_id = data.cloudflare_zone.domains[each.key].id
  name    = "@"
  type    = "TXT"
  content = "v=spf1 include:_spf.mx.cloudflare.net ~all"
  ttl     = 3600
}

# ─── SPF for Google Workspace (noizy.ai) ────────────────────

resource "cloudflare_record" "spf_google" {
  zone_id = data.cloudflare_zone.domains["noizy.ai"].id
  name    = "@"
  type    = "TXT"
  content = "v=spf1 include:_spf.google.com include:_spf.mx.cloudflare.net ~all"
  ttl     = 3600
}

# ─── Google Workspace MX Records (noizy.ai only) ────────────

resource "cloudflare_record" "google_mx" {
  for_each = local.google_mx_records

  zone_id  = data.cloudflare_zone.domains["noizy.ai"].id
  name     = "@"
  type     = "MX"
  content  = each.key
  priority = each.value
  ttl      = 3600
}

# ─── Cloudflare Workers ─────────────────────────────────────

# Heaven — Consent Kernel API
resource "cloudflare_worker_script" "heaven" {
  account_id = var.cloudflare_account_id
  name       = "heaven"
  content    = file("${path.module}/../../src/index.js")
  module     = true
}

# Landing page route (noizy.ai → noizy-landing worker)
resource "cloudflare_worker_route" "landing" {
  zone_id     = data.cloudflare_zone.domains["noizy.ai"].id
  pattern     = "noizy.ai/*"
  script_name = "noizy-landing"
}

resource "cloudflare_worker_route" "landing_root" {
  zone_id     = data.cloudflare_zone.domains["noizy.ai"].id
  pattern     = "noizy.ai"
  script_name = "noizy-landing"
}

# ─── GCP Project & APIs ─────────────────────────────────────

resource "google_project" "noizy" {
  name       = "NOIZY Empire"
  project_id = var.gcp_project_id
}

resource "google_project_service" "cloud_ai_companion" {
  project = google_project.noizy.project_id
  service = "cloudaicompanion.googleapis.com"

  disable_dependent_services = false
}

resource "google_project_service" "workspace_apis" {
  for_each = toset([
    "admin.googleapis.com",
    "gmail.googleapis.com",
    "drive.googleapis.com",
    "calendar-json.googleapis.com",
    "docs.googleapis.com",
    "sheets.googleapis.com",
  ])

  project = google_project.noizy.project_id
  service = each.value

  disable_dependent_services = false
}

# ─── Outputs ─────────────────────────────────────────────────

output "cloudflare_zones" {
  value = { for k, v in data.cloudflare_zone.domains : k => v.id }
}

output "dmarc_records" {
  value = { for k, v in cloudflare_record.dmarc : k => v.hostname }
}

output "gcp_project" {
  value = google_project.noizy.project_id
}

output "worker_routes" {
  value = {
    landing      = cloudflare_worker_route.landing.pattern
    landing_root = cloudflare_worker_route.landing_root.pattern
  }
}
