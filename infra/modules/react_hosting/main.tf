
locals {
  # リソース名共通prefix
  prefix = "${var.project_settings.project}-${var.project_settings.environment}"
}

# ReactほホスティングするためのS3バケット
resource "aws_s3_bucket" "react" {
  bucket = "${local.prefix}-react-hosting"

  tags = {
    Name = "${local.prefix}-react-hosting"
  }
}

# S3バケットへの「直接アクセス」をすべてブロック（セキュリティ対策）
# => CloudFront経由のみアクセス可能にする
resource "aws_s3_bucket_public_access_block" "react" {
  bucket = aws_s3_bucket.react.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "react" {
  bucket = aws_s3_bucket.react.id
  policy = data.aws_iam_policy_document.react.json
}

# S3にアクセス許可を与えるIAMポリシー
data "aws_iam_policy_document" "react" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = ["s3:GetObject"]

    resources = ["${aws_s3_bucket.react.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.react.arn]
    }
  }
}

# CloudFrontの「OAC（Origin Access Control）」設定を作成
# => CloudFrontがS3に署名付きリクエストでアクセスできるようにする
resource "aws_cloudfront_origin_access_control" "react" {
  name                              = "${local.prefix}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFrontディストリビューションの作成
resource "aws_cloudfront_distribution" "react" {
  aliases = [var.react_settings.domain_name] # 例: dev.example.com
  enabled = true
  comment = "React hosting for ${local.prefix}"
  # Reactアプリのトップページ
  default_root_object = "index.html"

  # ReactはSPAなので、404や403でも index.html を返すように設定（ルーティング対策）
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  origin {
    domain_name = aws_s3_bucket.react.bucket_regional_domain_name
    origin_id   = "s3-${aws_s3_bucket.react.id}"

    origin_access_control_id = aws_cloudfront_origin_access_control.react.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-${aws_s3_bucket.react.id}"

    # HTTPアクセスはHTTPSにリダイレクト
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      # クエリパラメータはキャッシュ対象に含めない
      query_string = false
      cookies {
        # Cookieも使用しない（Reactは基本ステートレス）
        forward = "none"
      }
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.react_settings.cert_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "${local.prefix}-react-cdn"
  }
}

# 独自ドメインで CloudFront にアクセスできるように Route53 のDNSレコードを追加
resource "aws_route53_record" "react" {
  zone_id         = var.react_settings.zone_id
  name            = var.react_settings.domain_name
  type            = "A"
  allow_overwrite = true # 既存レコードを上書き

  alias {
    name = aws_cloudfront_distribution.react.domain_name
    # CloudFront 固定のゾーンID
    zone_id                = "Z2FDTNDATAQYW2"
    evaluate_target_health = false
  }
}
