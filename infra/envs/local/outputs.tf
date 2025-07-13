output "COGNITO_USER_POOL_ID" {
  description = "CognitoユーザープールID。アプリ側で使用します。"
  value       = module.cognito.user_pool_id
}

output "COGNITO_CLIENT_ID" {
  description = "CognitoユーザープールのクライアントID。アプリ側で使用します。"
  value       = module.cognito.client_id
}
