variable "project_settings" {
  description = "プロジェクト共通の設定"
  type = object({
    project     = string
    environment = string
    developer   = optional(string, null)
  })
}
