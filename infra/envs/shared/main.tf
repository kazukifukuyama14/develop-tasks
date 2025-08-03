module "route53_zone" {
  source           = "../../modules/route53_zone"
  project_settings = var.project_settings
  domain_name      = var.domain_name
}
