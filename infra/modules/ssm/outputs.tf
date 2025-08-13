output "ssm_parameters" {
  value = {
    for key, param in aws_ssm_parameter.plain :
    key => param.name
  }
}

output "parameter_arns" {
  value = { for k, v in aws_ssm_parameter.plain : k => v.arn }
}

output "ssm_secure_params" {
  value = {
    for key, param in aws_ssm_parameter.secure :
    key => param.name
  }
}

output "secure_params_arn" {
  value = { for k, v in aws_ssm_parameter.secure : k => v.arn }
}
