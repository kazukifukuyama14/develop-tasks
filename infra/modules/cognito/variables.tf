variable "project_settings" {
  description = "プロジェクト共通の設定"
  type = object({
    project     = string
    environment = string
    developer   = optional(string, null)
  })
  validation {
    condition = (
      (
        var.project_settings.environment == "local" &&
        var.project_settings.developer != null &&
        length(trim(var.project_settings.developer, " ")) > 0
      )
      || var.project_settings.environment != "local"
    )
    error_message = "environment が \"local\" の場合は developer を指定してください。"
  }
}
