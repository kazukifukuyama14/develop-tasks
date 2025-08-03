locals {
  # リソース名共通prefix
  prefix = "${var.project_settings.project}-${var.project_settings.environment}"
}

resource "aws_route53_zone" "this" {
  name    = var.domain_name
  comment = "Managed by Terraform for taskfolio project"

  tags = {
    Name = "${local.prefix}-route53-zone"
  }
}
