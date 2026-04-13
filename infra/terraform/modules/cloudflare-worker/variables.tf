variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "worker_name" {
  description = "Worker script name"
  type        = string
}

variable "script_path" {
  description = "Path to the worker JS file"
  type        = string
}

variable "module_format" {
  description = "Whether the script uses ES module format"
  type        = bool
  default     = true
}

variable "d1_bindings" {
  description = "D1 database bindings: binding_name → database_id"
  type        = map(string)
  default     = {}
}

variable "kv_bindings" {
  description = "KV namespace bindings: binding_name → namespace_id"
  type        = map(string)
  default     = {}
}

variable "env_vars" {
  description = "Environment variable bindings: name → value"
  type        = map(string)
  default     = {}
}

variable "routes" {
  description = "Worker routes: pattern → { zone_id }"
  type = map(object({
    zone_id = string
  }))
  default = {}
}
