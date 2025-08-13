locals {
  # 例）api.dev.example.com
  api_domain_name = "api.${var.alb_settings.alb_domain_name}"
}
