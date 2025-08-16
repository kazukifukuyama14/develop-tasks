variable "project_settings" {
  description = "プロジェクト共通の設定"
  type = object({
    project     = string
    environment = string
  })
}

variable "react_settings" {
  description = "フロントエンド(React)の設定"
  type = object({
    domain_name = string
    cert_arn    = string
    zone_id     = string
  })
}
