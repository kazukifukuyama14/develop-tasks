module "network" {
  source = "../../modules/network"

  project_settings = var.project_settings
  network_settings = var.network_settings
}

# ============================================
# デバッグモジュール
# ============================================
module "debug" {
  source = "../../modules/debug"

  project_settings       = var.project_settings
  enable_debug_resources = var.enable_debug_resources
  debug_settings = {
    vpc_id                = module.network.vpc.id
    vpc_cidr_block        = module.network.vpc.cidr_block
    rds_security_group_id = module.network.security_group_ids.rds
    ecs_private_subnet_id = module.network.subnet_ids.ecs[0]

    debug_subnet_cidr_block = var.debug_settings.debug_subnet_cidr_block
    availability_zone       = var.network_settings.availability_zones[0]
  }
}
