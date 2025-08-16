output "debug_ec2_instance_id" {
  value       = module.debug.debug_ec2_instance_id
  description = "Instance ID of debug EC2 for SSM Session Manager"
}

output "ECR_REPOSITORY" {
  value = module.ecr.repository_name
}

output "ECS_CLUSTER" {
  value = module.ecs.cluster_name
}

output "ECS_SERVICE" {
  value = module.ecs.service_name
}
