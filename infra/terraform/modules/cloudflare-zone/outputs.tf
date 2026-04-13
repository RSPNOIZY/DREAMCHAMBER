output "zone_id" {
  value = data.cloudflare_zone.this.id
}

output "domain" {
  value = var.domain
}

output "nameservers" {
  value = data.cloudflare_zone.this.name_servers
}

output "status" {
  value = data.cloudflare_zone.this.status
}
