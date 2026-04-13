# ═══════════════════════════════════════════════════════════════
# Module: gcp-workspace
# Manages GCP project and Google Workspace API enablement
# ═══════════════════════════════════════════════════════════════

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

resource "google_project" "this" {
  name       = var.project_name
  project_id = var.project_id
}

resource "google_project_service" "apis" {
  for_each = toset(var.enabled_apis)

  project = google_project.this.project_id
  service = each.value

  disable_dependent_services = false
}
