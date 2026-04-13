# ═══════════════════════════════════════════════════════════════
# NOIZY EMPIRE — Terraform Infrastructure Plan (Modular)
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
  google_mx_records = {
    "aspmx.l.google.com"      = 1
    "alt1.aspmx.l.google.com" = 5
    "alt2.aspmx.l.google.com" = 5
    "alt3.aspmx.l.google.com" = 10
    "alt4.aspmx.l.google.com" = 10
  }
}

# ═══════════════════════════════════════════════════════════════
# CLOUDFLARE ZONES
# ═══════════════════════════════════════════════════════════════

module "zone_noizy_ai" {
  source = "./modules/cloudflare-zone"

  domain              = "noizy.ai"
  account_id          = var.cloudflare_account_id
  dmarc_email         = var.public_email
  spf_record          = "v=spf1 include:_spf.google.com include:_spf.mx.cloudflare.net ~all"
  mx_records          = local.google_mx_records
  create_dummy_record = true # Required for Worker route activation
}

module "zone_noizyfish_com" {
  source = "./modules/cloudflare-zone"

  domain      = "noizyfish.com"
  account_id  = var.cloudflare_account_id
  dmarc_email = var.public_email
  spf_record  = "v=spf1 include:_spf.mx.cloudflare.net ~all"
}

module "zone_fishmusicinc_com" {
  source = "./modules/cloudflare-zone"

  domain      = "fishmusicinc.com"
  account_id  = var.cloudflare_account_id
  dmarc_email = var.public_email
  spf_record  = "v=spf1 include:_spf.mx.cloudflare.net ~all"
}

module "zone_noizyfish_ca" {
  source = "./modules/cloudflare-zone"

  domain      = "noizyfish.ca"
  account_id  = var.cloudflare_account_id
  dmarc_email = var.public_email
  spf_record  = "v=spf1 include:_spf.mx.cloudflare.net ~all"
}

# ═══════════════════════════════════════════════════════════════
# CLOUDFLARE WORKERS
# ═══════════════════════════════════════════════════════════════

module "worker_heaven" {
  source = "./modules/cloudflare-worker"

  account_id  = var.cloudflare_account_id
  worker_name = "heaven"
  script_path = "${path.module}/../../src/index.js"

  d1_bindings = {
    GABRIEL_DB = "a31d68e2-f2d4-4203-a803-8039fdff31cb"
  }

  kv_bindings = {
    GABRIEL_KV    = "f205b56a9914413da0ec454a9dc4c2bd"
    GABRIEL_VOICE = "16532a32b2e8455486cc966403f3442e"
  }

  env_vars = {
    NOIZY_ENV            = "production"
    NOIZY_VERSION        = "18.0.0"
    FOUNDING_ACTOR_FLOOR = "85"
    STANDARD_ACTOR_FLOOR = "75"
    VOICE_VAULT_BUCKET   = "noizy-voice-vault"
  }
}

module "worker_landing" {
  source = "./modules/cloudflare-worker"

  account_id  = var.cloudflare_account_id
  worker_name = "noizy-landing"
  script_path = "${path.module}/../../noizy-landing/src/index.js"

  routes = {
    "noizy.ai/*" = { zone_id = module.zone_noizy_ai.zone_id }
    "noizy.ai"   = { zone_id = module.zone_noizy_ai.zone_id }
  }
}

# ═══════════════════════════════════════════════════════════════
# GCP / GOOGLE WORKSPACE
# ═══════════════════════════════════════════════════════════════

module "gcp_workspace" {
  source = "./modules/gcp-workspace"

  project_name = "NOIZY Empire"
  project_id   = var.gcp_project_id
}

# ═══════════════════════════════════════════════════════════════
# OUTPUTS
# ═══════════════════════════════════════════════════════════════

output "zones" {
  value = {
    "noizy.ai"         = { id = module.zone_noizy_ai.zone_id, status = module.zone_noizy_ai.status, ns = module.zone_noizy_ai.nameservers }
    "noizyfish.com"    = { id = module.zone_noizyfish_com.zone_id, status = module.zone_noizyfish_com.status }
    "fishmusicinc.com" = { id = module.zone_fishmusicinc_com.zone_id, status = module.zone_fishmusicinc_com.status }
    "noizyfish.ca"     = { id = module.zone_noizyfish_ca.zone_id, status = module.zone_noizyfish_ca.status }
  }
}

output "workers" {
  value = {
    heaven  = module.worker_heaven.worker_name
    landing = module.worker_landing.worker_name
  }
}

output "gcp_project" {
  value = module.gcp_workspace.project_id
}
