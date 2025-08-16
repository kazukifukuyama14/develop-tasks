variable "project_settings" {
  description = "プロジェクト共通の設定"
  type = object({
    project     = string
    environment = string
  })
}

variable "ecs_settings" {
  type = object({
    ecs_subnet_ids         = list(string)
    ecs_sg_id              = string
    ecs_execution_role_arn = string
    ecs_task_role_arn      = string
    ecr_repository_url     = string
    alb_target_group_arn   = string
  })
}

variable "ssm_parameters" {
  type = object({
    db_host_name         = string
    db_user              = string
    db_password          = string
    db_name              = string
    origin_url           = string
    cognito_client_id    = string
    cognito_user_pool_id = string
  })
}
