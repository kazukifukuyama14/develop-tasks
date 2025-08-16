variable "project_settings" {
  description = "プロジェクト共通の設定"
  type = object({
    project     = string
    environment = string
  })
}

variable "ecs_iam_settings" {
  description = "ECS IAM設定"
  type = object({
    ssm_prefix = string
  })
}

variable "cicd_settings" {
  type = object({
    github_repository         = string
    branch_name               = string
    ssm_prefix                = string
    react_bucket_arn          = string
    ecr_repo_arn              = string
    ecs_family                = string
    ecs_service_arn           = string
    ecs_cluster_arn           = string
    ecs_task_role_arn         = string
    ecs_task_execute_role_arn = string
  })
}
