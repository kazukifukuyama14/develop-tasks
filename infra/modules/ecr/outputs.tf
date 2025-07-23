// リポジトリ名を出力
output "repository_name" {
  value = aws_ecr_repository.repository.name
}

// リポジトリARNを出力
output "repository_arn" {
  value = aws_ecr_repository.repository.arn
}

// リポジトリURLを出力
output "repository_url" {
  value = aws_ecr_repository.repository.repository_url
}
