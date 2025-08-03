output "zone_id" {
  value       = module.route53_zone.zone_id
  description = "The Route53 hosted zone ID"
}

output "name_servers" {
  value       = module.route53_zone.name_servers
  description = "List of name servers to set at domain registrar"
}
