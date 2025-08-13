output "db_instance_address" {
  description = "RDSインスタンスのエンドポイント"
  value       = aws_db_instance.this.endpoint
}

output "db_instance_id" {
  description = "RDSインスタンスのID"
  value       = aws_db_instance.this.id
}

output "db_instance_arn" {
  description = "RDSインスタンスのARN"
  value       = aws_db_instance.this.arn
}
