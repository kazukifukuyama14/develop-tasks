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
