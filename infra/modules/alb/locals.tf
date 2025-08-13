locals {
  # 本番環境を条件にドメイン名を切り替える
  # 本番環境 => domain_name: example.com
  # その他 => domain_name: dev.example.com, stg.example.com など
  domain_name = var.is_production ? var.domain_settings.base_domain : "${var.domain_settings.domain_prefix}.${var.domain_settings.base_domain}"

  # 例）api.dev.example.com
  api_domain_name = "api.${local.domain_name}"
}
