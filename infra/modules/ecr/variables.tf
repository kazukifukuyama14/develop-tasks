variable "project_settings" {
  description = "プロジェクト共通の設定"
  type = object({
    project     = string
    environment = string
  })
}

variable "ecr_settings" {
  description = "ECR用の設定"
  type = object({
    retention_days = number
  })
}
