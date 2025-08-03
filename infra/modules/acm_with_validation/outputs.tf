output "api_cert_arn" {
  description = "ARN of the validated ACM certificate for default region"
  value       = aws_acm_certificate_validation.api_validation.certificate_arn
}

output "global_cert_arn" {
  description = "ARN of the validated ACM certificate for us-east-1 region"
  value       = aws_acm_certificate_validation.react_validation.certificate_arn
}
