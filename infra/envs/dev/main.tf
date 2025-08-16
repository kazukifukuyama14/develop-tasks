# ============================================
# ローカル変数の定義
# ============================================
locals {
  # 例）api.dev.example.com
  api_domain_name = "api.${local.domain_name}"
}

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

# ============================================
# Cognitoモジュール
# ============================================
module "cognito" {
  source           = "../../modules/cognito"
  project_settings = var.project_settings
}

# ============================================
# ECRモジュール
# ============================================
module "ecr" {
  source           = "../../modules/ecr"
  project_settings = var.project_settings
  ecr_settings     = var.ecr_settings
}

# ============================================
# RDSモジュール
# ============================================
module "rds" {
  source           = "../../modules/rds"
  project_settings = var.project_settings
  is_production    = var.is_production
  rds_settings = {
    rds_subnet_ids = module.network.subnet_ids.rds
    rds_sg_id      = module.network.security_group_ids.rds
    db_name        = var.rds_settings.db_name
    db_password    = var.rds_settings.db_password
    db_user        = var.rds_settings.db_user
    instance_type  = var.rds_settings.instance_type
  }
}

# ============================================
# ACM with validationモジュール
# ============================================
module "acm_with_validation" {
  source           = "../../modules/acm_with_validation"
  project_settings = var.project_settings
  acm_settings = {
    zone_id     = var.domain_settings.zone_id
    domain_name = local.domain_name
  }

  providers = {
    aws      = aws
    aws.use1 = aws.use1
  }
}

# ============================================
# ALB
# ============================================
module "alb" {
  source           = "../../modules/alb"
  project_settings = var.project_settings
  is_production    = var.is_production
  domain_settings  = var.domain_settings
  alb_settings = {
    vpc_id      = module.network.vpc.id
    subnet_ids  = module.network.subnet_ids
    sg_id       = module.network.security_group_ids
    cert_arn    = module.acm_with_validation.api_cert_arn
    bucket_name = module.s3_alb_log.bucket_name

    zone_id = var.domain_settings.zone_id

    alb_domain_name = local.domain_name
  }
}

# ============================================
# S3 ALB log モジュール
# ============================================
module "s3_alb_log" {
  source           = "../../modules/s3_alb_log"
  project_settings = var.project_settings
}

# ============================================
# SSMモジュール
# ============================================
module "ssm" {
  source = "../../modules/ssm"
  prefix = "/${var.project_settings.project}/${var.project_settings.environment}"
  parameters = {
    "api_url" : "https://${local.api_domain_name}"
    "app_url" : "https://${local.domain_name}"
    "cognito/user_pool_id" = module.cognito.user_pool_id
    "cognito/client_id"    = module.cognito.client_id
    "db/host"              = module.rds.db_instance_address
    "db/user"              = "dummy" # パスワードはDBセットアップ後に手動で上書き
    "db/name"              = var.rds_settings.db_name
  }
  secure_params = {
    "db/password" = "dummy" # パスワードはDBセットアップ後に手動で上書き
  }
}

# ============================================
# ECS IAMモジュール
# ============================================
module "ecs_iam" {
  source = "../../modules/ecs_iam"

  project_settings = var.project_settings

  esc_iam_settings = {
    prefix   = "/${var.project_settings.project}/${var.project_settings.environment}"
    congnito = module.cognito.user_pool_arn
  }
}

# ============================================
# ECSモジュール
# ============================================
module "ecs" {
  source           = "../../modules/ecs"
  project_settings = var.project_settings

  ecs_settings = {
    ecs_subnet_ids         = module.network.subnet_ids.ecs
    ecs_sg_id              = module.network.security_group_ids.ecs
    ecs_execution_role_arn = module.ecs_iam.ecs_execution_role_arn
    ecs_task_role_arn      = module.ecs_iam.ecs_task_role_arn
    ecr_repository_url     = module.ecr.repository_url
    alb_target_group_arn   = module.alb.target_group_arn
  }

  ssm_parameters = {
    db_host_name         = module.ssm.ssm_parameters["db/host"]
    db_user              = module.ssm.ssm_parameters["db/user"]
    db_name              = module.ssm.ssm_parameters["db/name"]
    db_password          = module.ssm.ssm_secure_params["db/password"]
    origin_url           = module.ssm.ssm_parameters["app_url"]
    cognito_user_pool_id = module.ssm.ssm_parameters["cognito/user_pool_id"]
    cognito_client_id    = module.ssm.ssm_parameters["cognito/client_id"]
  }
}
