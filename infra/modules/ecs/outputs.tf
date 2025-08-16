output "family" {
  value = aws_ecs_task_definition.api.family
}

output "service_arn" {
  value = aws_ecs_service.api.id
}

output "cluster_arn" {
  value = aws_ecs_cluster.this.arn
}

output "cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "service_name" {
  value = aws_ecs_service.api.name
}
