// プロジェクト名
variable "Project" {
  description = "terraform tasks"
  type        = string
  default     = "Terraform Tasks"

}

// 環境名
variable "Environment" {
  description = "dev"
  type        = string
  default     = "local"
}

// 開発者
variable "Developer" {
  description = "wan0ri"
  type        = string
  default     = "wan0ri"
}

// local.xxでlocalsで定義した変数を参照する
locals {
  name_prefix = "${var.Project}-${var.Environment}-${var.Developer}"
}

// cognitoのユーザープール名
resource "aws_cognito_user_pool" "this" {
  name = "${local.name_prefix}-user-pool"

  tags = {
    Project     = var.Project
    Environment = var.Environment
    ManagedBy   = "Terraform"
  }

  // ユーザープールの属性
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  // パスワードポリシー(8文字以上、英数字必須)
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  // アカウントのリカバリー設定※パスワードを忘れた場合、メールアドレスでリセット可能
  account_recovery_setting {
    recovery_mechanism {
      priority = 1
      name     = "verified_email"
    }
  }
}

// ユーザープールクライアントの作成
resource "aws_cognito_user_pool_client" "this" {
  name         = "${local.name_prefix}-user-pool-client"
  user_pool_id = aws_cognito_user_pool.this.id

  access_token_validity  = 60 // アクセストークンの有効期限(分)
  id_token_validity      = 60 // IDトークンの有効期限(分)
  refresh_token_validity = 60 // リフレッシュトークンの有効期限(日)
  token_validity_units {
    access_token  = "minutes" // アクセストークンの有効期限単位
    id_token      = "minutes" // IDトークンの有効期限単位
    refresh_token = "days"    // リフレッシュトークンの有効期限単位
  }

  // Reactのためシークレット不要
  generate_secret = false
  // Google認証など使用しないので不要
  allowed_oauth_flows_user_pool_client = false

  //明示的に許可する認証フロー

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH", // ユーザーパスワード認証を許可
    "ALLOW_REFRESH_TOKEN_AUTH", // リフレッシュトークン認証を許可
    "ALLOW_CUSTOM_AUTH",        // カスタム認証を許可
    "ALLOW_USER_PASSWORD_AUTH"  // ユーザーパスワード認証を許可
  ]

  //ログインに使用するIDプロバイダーの設定
  supported_identity_providers = ["COGNITO"] // Cognitoユーザープールを使用

  //存在しないユーザーへのログイン試行時のレスポンスを統一
  prevent_user_existence_errors = "ENABLED" // ユーザーが存在しない場合のエラーを統一
}

// 管理者権限としてのユーザープールドメインを作成
resource "aws_cognito_user_pool_domain" "admin" {
  domain       = "${local.name_prefix}-admin"  // ユーザープールドメイン名
  user_pool_id = aws_cognito_user_pool.this.id // ユーザープールID
}

// ユーザープールドメインの出力
output "COGNITO_USER_POOL_ID" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.this.id
}

output "COGNITO_CLIENT_ID" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.this.id
}
