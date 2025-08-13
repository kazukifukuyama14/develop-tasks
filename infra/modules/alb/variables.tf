variable "project_settings" {
  description = "プロジェクト共通の設定"
  type = object({
    project     = string
    environment = string
  })
}

variable "is_production" {
  description = "本番環境かどうかのフラグ"
  type        = bool
  default     = false
}

variable "domain_settings" {
  description = "ドメイン設定"
  type = object({
    base_domain   = string
    domain_prefix = string
  })
}

variable "alb_settings" {
  description = "ALBの設定"
  type = object({
    vpc_id          = string
    zone_id         = string
    subnet_ids      = list(string)
    sg_id           = string
    cert_arn        = string
    alb_domain_name = string
    bucket_name     = string
  })
}
