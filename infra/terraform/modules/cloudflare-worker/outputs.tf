output "worker_name" {
  value = cloudflare_worker_script.this.name
}

output "route_patterns" {
  value = { for k, v in cloudflare_worker_route.routes : k => v.pattern }
}
