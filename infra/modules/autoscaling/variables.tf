variable "project_settings" {
  description = "プロジェクト共通の設定"
  type = object({
    project     = string
    environment = string
  })
}

variable "autoscaling_settings" {
  description = "autoscalingの設定"
  type = object({
    cluster_name = string
    service_name = string
  })
}
