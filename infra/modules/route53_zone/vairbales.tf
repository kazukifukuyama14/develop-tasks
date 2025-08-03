variable "project_settings" {
  description = "プロジェクト共有の設定"
  type = object({
    project     = string
    environment = string
  })
}

variable "domain_name" {
  description = "example.com"
  type        = string
}
