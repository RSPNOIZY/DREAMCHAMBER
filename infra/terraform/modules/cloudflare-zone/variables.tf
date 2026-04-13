variable "domain" {
  description = "Domain name (e.g. noizy.ai)"
  type        = string
}

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "dmarc_email" {
  description = "Email for DMARC aggregate reports"
  type        = string
}

variable "spf_record" {
  description = "SPF TXT record content"
  type        = string
  default     = "v=spf1 include:_spf.mx.cloudflare.net ~all"
}

variable "mx_records" {
  description = "MX records map: server → priority"
  type        = map(number)
  default     = {}
}

variable "create_dummy_record" {
  description = "Create proxied A record (192.0.2.1) for Worker route activation"
  type        = bool
  default     = false
}
