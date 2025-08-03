locals {
  # リソース名共通のprefix
  prefix = "${var.project_settings.project}-${var.project_settings.environment}"
}

# ============================================
# ECR
# ============================================
resource "aws_ecr_repository" "repository" {
  # APIコンテナイメージを保存するためのECRリポジトリ
  # 本番環境ではイメージタグの変更を防止するためIMMUTABLEに設定
  name                 = "${local.prefix}-ecr-api"
  image_tag_mutability = var.project_settings.environment == "prod" ? "IMMUTABLE" : "MUTABLE"
  force_delete         = true
}

resource "aws_ecr_lifecycle_policy" "policy" {
  # ECRリポジトリのライフサイクルポリシー設定
  # 古いイメージを自動的に削除するためのルールを定義
  repository = aws_ecr_repository.repository.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep branch-tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["${var.project_settings.environment}-"]
          countType     = "sinceImagePushed"
          countUnit     = "days"
          countNumber   = var.ecr_settings.retention_days
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Delete untagged images after 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
