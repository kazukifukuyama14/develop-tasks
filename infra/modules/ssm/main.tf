# 通常の平文パラメータ
resource "aws_ssm_parameter" "plain" {
  for_each = var.parameters

  # develop-tasks/dev/api_urlのような形式で名前を定義
  name  = "${var.prefix}/${each.key}"
  type  = "String"
  value = each.value

  lifecycle {
    # SSMパラメータは原則としてTerraformからの上書きを行わない方針
    # => 上書きは手動※Terraformから除外
    ignore_changes = [value]
  }
}

# セキュアな情報
resource "aws_ssm_parameter" "secure" {
  for_each = var.secure_params

  name  = "${var.prefix}/${each.key}"
  type  = "SecureString"
  value = each.value

  lifecycle {
    # SSMパラメータは原則としてTerraformからの上書きを行わない方針
    # => 上書きは手動※Terraformから除外
    ignore_changes = [value]
  }
}
