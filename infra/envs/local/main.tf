module "cognito" {
  source           = "../../modules/cognito"
  project_settings = var.project_settings
}
