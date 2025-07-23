output "debug_ec2_instance_id" {
  value       = module.debug.debug_ec2_instance_id
  description = "Instance ID of debug EC2 for SSM Session Manager"
}

output "ECR_REPOSITORY" {
  value = module.ecr.repository_name
}

output "rds_endpoint" {
  value       = module.rds.db_instance_address
  description = "RDS接続エンドポイント"
}
