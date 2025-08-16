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

output "REACT_BUCKET" {
  value = module.react_hosting.s3_bucket_name
}

output "CLOUDFRONT_DISTRIBUTION_ID" {
  value = module.react_hosting.cloudfront_distribution_id
}

output "GITHUB_ROLE" {
  value = module.cicd_iam.github_actions_role_arn
}
