variable "project_name" {
  description = "GCP project display name"
  type        = string
}

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "enabled_apis" {
  description = "List of GCP APIs to enable"
  type        = list(string)
  default = [
    "cloudaicompanion.googleapis.com",
    "admin.googleapis.com",
    "gmail.googleapis.com",
    "drive.googleapis.com",
    "calendar-json.googleapis.com",
    "docs.googleapis.com",
    "sheets.googleapis.com",
  ]
}
