output "user_pool_id" {
  description = "CognitoユーザープールID。アプリ側で使用します。"
  value       = aws_cognito_user_pool.this.id
}

output "client_id" {
  description = "CognitoユーザープールのクライアントID。アプリ側で使用します。"
  value       = aws_cognito_user_pool_client.this.id
}

output "user_pool_arn" {
  value = aws_cognito_user_pool.this.arn
}
