# ============================================
# プロジェクト共通の設定
# ============================================
variable "project_settings" {
  description = "プロジェクト共通の設定"
  type = object({
    project     = string
    environment = string
  })
  validation {
    condition     = contains(["local", "dev", "prod"], var.project_settings.environment)
    error_message = "environment は local, dev または prod のいずれかである必要があります。"
  }
}

# ============================================
# ネットワーク設定
# ============================================
variable "network_settings" {
  description = "VPC、サブネット、AZなどネットワーク設定"
  type = object({
    vpc_cidr_block                 = string
    availability_zones             = list(string)
    alb_public_subnet_cidr_blocks  = list(string)
    nat_public_subnet_cidr_blocks  = list(string)
    ecs_private_subnet_cidr_blocks = list(string)
    rds_private_subnet_cidr_blocks = list(string)
  })
}

# ============================================
# デバッグ設定
# ============================================
variable "enable_debug_resources" {
  description = "デバッグ用のリソース作成のフラグ引数(true で作成)"
  type        = bool
  default     = false
}

variable "debug_settings" {
  description = "デバッグ用のリソース設定"
  type = object({
    debug_subnet_cidr_block = string
  })
}

# ============================================
# ECR設定
# ============================================
variable "ecr_settings" {
  description = "ECR用の設定"
  type = object({
    retention_days = number
  })
}

# 本番環境フラグ
variable "is_production" {
  description = "本番環境か判定するフラグ(trueで本番環境)"
  type        = bool
  default     = false
}

# ============================================
# RDS用の設定
# ============================================
variable "rds_settings" {
  description = "RDSポート番号等の設定"
  type = object({
    instance_type = string
    db_name       = string
    db_user       = string
    db_password   = string
  })
}

# ============================================
# ドメイン設定
# ============================================
variable "domain_settings" {
  description = "ホストゾーンIDやドメイン名などドメイン設定"
  type = object({
    zone_id       = string
    base_domain   = string
    domain_prefix = optional(string)
  })
}
