output "debug_ec2_instance_id" {
  value       = var.enable_debug_resources ? aws_instance.debug[0].id : null
  description = "Instance ID of debug EC2 for SSM Session Manager"
}
