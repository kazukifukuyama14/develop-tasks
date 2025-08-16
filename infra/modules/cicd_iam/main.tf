data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  # リソース名共通prefix
  prefix = "${var.project_settings.project}-${var.project_settings.environment}"

  # ECSタスク定義のワイルドカードARN
  task_definition_arn_wildcard = "arn:aws:ecs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:task-definition/${var.cicd_settings.ecs_family}*"
}

# GitHub Actions から AssumeRole するための IAM ロール
resource "aws_iam_role" "github_actions" {
  name = "${local.prefix}-github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Federated = data.aws_iam_openid_connect_provider.github.arn
        },
        Action = "sts:AssumeRoleWithWebIdentity",
        Condition = {
          StringLike = {
            # GitHubリポジトリの指定（ブランチ単位で制限）
            "token.actions.githubusercontent.com:sub" = [
              "repo:${var.cicd_settings.github_repository}:ref:refs/heads/${var.cicd_settings.branch_name}",
            ]
          },
          StringEquals = {
            "token.actions.githubusercontent.com:aud" : "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}

# GitHub Actions用 IAMポリシー
resource "aws_iam_role_policy" "github_actions_policy" {
  name = "${local.prefix}-github-actions-policy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      # --- S3：Reactアプリなどの成果物をS3にアップロード ---
      {
        Effect = "Allow",
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:DeleteObject",
          "s3:ListBucket"
        ],
        Resource = [
          "${var.cicd_settings.react_bucket_arn}",
          "${var.cicd_settings.react_bucket_arn}/*"
        ]
      },
      # --- CloudFront：キャッシュ削除（デプロイ後の更新反映） ---
      {
        Effect = "Allow",
        Action = [
          "cloudfront:CreateInvalidation"
        ],
        Resource = "*"
      },
      # --- SSM Parameter Store：環境変数などの安全な読み出し ---
      {
        Effect = "Allow",
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ],
        Resource = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter${var.ecs_iam_settings.ssm_prefix}/*"
      },
      # --- ECR：イメージのプッシュ・プルに必要な権限 ---
      {
        Effect = "Allow",
        Action = [
          "ecr:GetAuthorizationToken",
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ],
        Resource = var.cicd_settings.ecr_repo_arn
      },
      # --- ECS：タスク定義の更新（デプロイの肝） ---
      {
        Effect = "Allow",
        Action = [
          "ecs:RegisterTaskDefinition",
          "ecs:DescribeTaskDefinition"
        ],
        Resource = local.task_definition_arn_wildcard
      },
      {
        Effect = "Allow",
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices"
        ],
        Resource = var.cicd_settings.ecs_service_arn
      },
      {
        Effect   = "Allow",
        Action   = "ecs:DescribeClusters",
        Resource = var.cicd_settings.ecs_cluster_arn
      },
      {
        Effect = "Allow",
        Action = "iam:PassRole",
        Resource = [
          var.cicd_settings.ecs_task_role_arn,
          var.cicd_settings.ecs_task_execute_role_arn
        ]
      }
    ]
  })
}
