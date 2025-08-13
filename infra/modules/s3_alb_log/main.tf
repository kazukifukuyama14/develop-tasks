# AWSアカウントIDを取得するために使用
data "aws_caller_identity" "current" {}

locals {
  prefix = "${var.project_settings.project}-${var.project_settings.environment}"
}

resource "aws_s3_bucket" "alb_log" {
  # S3バケット名はプレフィックス+バケット名(末尾にアカウントID)
  bucket = "${local.prefix}-alb-log-${data.aws_caller_identity.current.account_id}"

  # バケット名にファイルがある場合、Terraformからの削除がエラーになるようにする
  force_destroy = false

  tags = {
    Name = "${local.prefix}-alb-log-bucket"
  }
}

# バケットの所有権制御(オブジェクトの所有権をバケットの所有者にする)
resource "aws_s3_bucket_ownership_controls" "alb_log" {
  bucket = aws_s3_bucket.alb_log.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# ACL設定
# - ALBがログを書き込めるように "log-delivery-write" を付与
resource "aws_s3_bucket_acl" "alb_log" {
  depends_on = [aws_s3_bucket_ownership_controls.alb_log]
  bucket     = aws_s3_bucket.alb_log.id
  acl        = "log-delivery-write"
}

# バケットポリシー設定
# - バケットポリシーを使用して、ALBがログを書き込めるようにする
resource "aws_s3_bucket_policy" "alb_log" {
  bucket = aws_s3_bucket.alb_log.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSALBGetBucketAcl"
        Effect = "Allow"
        Principal = {
          Service = "logdelivery.elasticloadbalancing.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.alb_log.arn
      },
      {
        Sid    = "AWSALBLoggingPermissions"
        Effect = "Allow"
        Principal = {
          Service = "logdelivery.elasticloadbalancing.amazonaws.com"
        }
        Action = [
          "s3:PutObject"
        ]
        Resource = "${aws_s3_bucket.alb_log.arn}/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}
