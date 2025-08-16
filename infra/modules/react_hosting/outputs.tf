output "s3_bucket_name" {
  value = aws_s3_bucket.react.bucket
}

output "react_bucket_arn" {
  value = aws_s3_bucket.react.arn
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.react.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.react.domain_name
}
