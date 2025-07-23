# リポジトリ名を出力
output "repository_name" {
  value = aws_ecr_repository.repository.name
}

# リポジトリARNを出力
output "repository_arn" {
  value = aws_ecr_repository.repository.arn
}

# リポジトリURLを出力
output "repository_url" {
  value = aws_ecr_repository.repository.repository_url
}

# DBインスタンスアドレスを出力
output "db_instance_address" {
  value = aws_db_instance.this.address
}

# DBインスタンスARNを出力
output "db_instance_arn" {
  value = aws_db_instance.this.arn
}

# DBインスタンスIDを出力
output "db_instance_id" {
  value = aws_db_instance.this.id
}
