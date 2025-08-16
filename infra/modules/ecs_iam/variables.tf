variable "project_settings" {
  description = "プロジェクト共通の設定"
  type = object({
    project     = string
    environment = string
  })
}

variable "esc_iam_settings" {
  type = object({
    prefix   = string
    congnito = string
  })
}
