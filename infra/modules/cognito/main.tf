locals {
  # 名前の前に共通の接頭語（prefix）をつけたいときに使う
  # 例: taskfolio-local-yuyan-user-pool など
  # name_prefix = "${var.project_settings.project}-${var.project_settings.environment}-${var.project_settings.developer}"

  # Cognitoモジュールの分岐設定
  name_prefix = var.project_settings.developer != null && var.project_settings.developer != "" ? "${var.project_settings.project}-${var.project_settings.environment}-${var.project_settings.developer}" : "${var.project_settings.project}-${var.project_settings.environment}"
}

resource "aws_cognito_user_pool" "this" {
  name = "${local.name_prefix}-user-pool"

  username_attributes      = ["email"] # メールアドレスでログイン
  auto_verified_attributes = ["email"]

  # パスワードポリシー
  # 8文字以上、英数字必須
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = false
    require_uppercase                = false
    temporary_password_validity_days = 7
  }

  # アカウントのリカバリー設定
  # パスワードを忘れた場合、メールアドレスでリセット可能
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = {
    Name = "${local.name_prefix}-user-pool"
  }
}

resource "aws_cognito_user_pool_client" "this" {
  name         = "${local.name_prefix}-app-client"
  user_pool_id = aws_cognito_user_pool.this.id

  access_token_validity  = 60 # 単位: 分（デフォルト60）
  id_token_validity      = 60
  refresh_token_validity = 30 # 単位: 日
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  # Reactのためシークレットは不要
  generate_secret = false
  # Google認証などしないため不要
  allowed_oauth_flows_user_pool_client = false

  # 明示的に許可する認証フロー
  # Reactのaws-amplify/authライブラリで使うログイン機能に対応させています
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",      # パスワードログイン
    "ALLOW_REFRESH_TOKEN_AUTH", # トークン更新
    "ALLOW_CUSTOM_AUTH",        # カスタム認証（MFAやステップ認証などで使う）
    "ALLOW_USER_PASSWORD_AUTH"  # username + password の認証（SRP以外で使うとき）
  ]

  # ログインに使用するIDプロバイダーの指定
  # 今回はCognitoユーザープール内のユーザーのみを使うため "COGNITO" のみ
  supported_identity_providers = ["COGNITO"]

  # 存在しないユーザーへのログイン試行時のレスポンスを統一
  # セキュリティ対策：存在するかどうかを外部から判別されないようにする
  prevent_user_existence_errors = "ENABLED"
}

resource "aws_cognito_user_group" "admin" {
  # 管理者権限としてCognitoのグループを作成
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.this.id
  description  = "アプリ管理者用グループ"
}
