data "aws_kms_key" "ssm_default" {
  key_id = "alias/aws/ssm"
}
data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

locals {
  # リソース名共通prefix
  prefix = "${var.project_settings.project}-${var.project_settings.environment}"
}

# SSMパラメータストアから値を読み取るための権限
# SSMモジュールでセットしたすべての変数に対して許可する
resource "aws_iam_policy" "ssm_read" {
  name = "${local.prefix}-ssm-read-policy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow"
      Action = [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParameterHistory"
      ]
      Resource = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter${var.esc_iam_settings.prefix}/*"
    }]
  })
}

# SSMパラメータストアSecurityStringを暗号解除するための権限
resource "aws_iam_policy" "kms_decrypt" {
  name = "${local.prefix}-kms-decrypt-policy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow"
      Action = [
        "kms:Decrypt"
      ]
      Resource = [data.aws_kms_key.ssm_default.arn]
    }]
  })
}

# ECSタスク実行ロール
# ECSタスクを実行するために必要な権限をアタッチします
# (SSMから値を取得、CloudWatchへログ出力など)
resource "aws_iam_role" "ecs_exec" {
  name = "${local.prefix}-ecs-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${local.prefix}-ecs-execution-role"
  }
}

# ECSがCloudWatchにログを出力するための権限
resource "aws_iam_role_policy_attachment" "ecs_exec_task_execution" {
  role       = aws_iam_role.ecs_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECSタスク実行ロールにSSM読み取り権限をアタッチ
resource "aws_iam_role_policy_attachment" "ecs_exec_ssm_read" {
  role       = aws_iam_role.ecs_exec.name
  policy_arn = aws_iam_policy.ssm_read.arn
}

# ECSタスク実行ロールにKMS鍵の使用権限をアタッチ
resource "aws_iam_role_policy_attachment" "ecs_exec_kms_decrypt" {
  role       = aws_iam_role.ecs_exec.name
  policy_arn = aws_iam_policy.kms_decrypt.arn
}

# ECSタスクロール
# ECSタスクがAWSリソースを使うための権限をアタッチする
# 例）DynamoDBへ書き込む、S3のファイルを読み取るなど
# Cognito用のIAMポリシーはサンプルとして残しているが、現時点では実際の操作には不要
resource "aws_iam_role" "ecs_task" {
  name = "${local.prefix}-ecs-task-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${local.prefix}-ecs-task-role"
  }
}

# Cognitoへの操作権限
# 今回のアプリでは使用しないが、ECSタスクへのIAM権限付与方法の例として残しておく
resource "aws_iam_policy" "cognito_admin_limited" {
  name = "${local.prefix}-cognito-admin-policy"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow"
        Action   = "cognito-idp:Admin*"
        Resource = "${var.esc_iam_settings.congnito}"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_cognito_admin" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = aws_iam_policy.cognito_admin_limited.arn
}
