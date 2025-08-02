output "debug_ec2_instance_id" {
  value       = module.debug.debug_ec2_instance_id
  description = "Instance ID of debug EC2 for SSM Session Manager"
}

output "ECR_REPOSITORY" {
  value = module.ecr.repository_name
}
