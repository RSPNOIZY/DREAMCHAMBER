output "project_id" {
  value = google_project.this.project_id
}

output "enabled_apis" {
  value = [for api in google_project_service.apis : api.service]
}
