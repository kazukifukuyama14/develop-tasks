variable "project_settings" {
  description = "プロジェクト共通の設定"
  type = object({
    project     = string
    environment = string
  })
}

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
