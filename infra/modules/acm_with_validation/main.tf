locals {
  name_prefix = "${var.project_settings.project}-${var.project_settings.environment}"

  # ワイルドカード証明書で使う SAN（Subject Alternative Name）一覧
  san_list = ["*.${var.acm_settings.domain_name}"]
}

terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      # us-east-1 用のプロバイダー別名を明示的に指定（CloudFront用証明書のため）
      configuration_aliases = [aws.use1]
    }
  }
}

# ACM 証明書の作成（東京リージョン）
resource "aws_acm_certificate" "api" {
  # メインのドメイン名
  domain_name = var.acm_settings.domain_name
  # サブドメインを含めた SAN
  subject_alternative_names = local.san_list
  # 検証方法は DNS（Route53 での自動検証が可能）
  validation_method = "DNS"

  lifecycle {
    # 証明書の再作成時にダウンタイムを防ぐ
    create_before_destroy = true
  }

  tags = {
    Name = "${local.name_prefix}-acm-cert-api"
  }
}

# ACM 証明書の作成（バージニア北部リージョン）
resource "aws_acm_certificate" "react_frontend" {
  provider                  = aws.use1
  domain_name               = var.acm_settings.domain_name
  subject_alternative_names = local.san_list
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${local.name_prefix}-acm-cert-react"
  }
}

# DNS検証用のRoute53レコードを作成（東京リージョン用）
resource "aws_route53_record" "api_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options :
    dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }

  zone_id = var.acm_settings.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 300
  records = [each.value.value]

  # レコードが既にある場合は上書き
  allow_overwrite = true

  lifecycle {
    # 再発行時の検証レコードを消さないようにしたい場合は true にする
    prevent_destroy = false
  }
}

# DNS検証用のRoute53レコードを作成（us-east-1用）
resource "aws_route53_record" "react_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.react_frontend.domain_validation_options :
    dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }

  zone_id = var.acm_settings.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 300
  records = [each.value.value]

  allow_overwrite = true

  lifecycle {
    # prevent_destroy = true # 証明書を再発行してもレコードは流用
    prevent_destroy = false
    # create_before_destroy = true
  }
}

# 東京リージョン証明書の検証完了を待つリソース
resource "aws_acm_certificate_validation" "api_validation" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for r in aws_route53_record.api_cert_validation : r.fqdn]
}

# us-east-1リージョン証明書の検証完了を待つリソース
resource "aws_acm_certificate_validation" "react_validation" {
  provider                = aws.use1
  certificate_arn         = aws_acm_certificate.react_frontend.arn
  validation_record_fqdns = [for r in aws_route53_record.react_cert_validation : r.fqdn]
}
