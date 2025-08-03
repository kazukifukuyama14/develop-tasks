output "zone_id" {
  value       = aws_route53_zone.this.zone_id
  description = "The ID of the hosted zone"
}

output "name_servers" {
  value       = aws_route53_zone.this.name_servers
  description = "List of Route 53 name servers to register at your domain registrar"
}
