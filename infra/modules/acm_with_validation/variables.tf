variable "project_settings" {
  description = "プロジェクト共通の設定"
  type = object({
    project     = string
    environment = string
  })
}

variable "acm_settings" {
  description = "ホストゾーンID,作成するドメイン名"
  type = object({
    zone_id     = string
    domain_name = string
  })
}
