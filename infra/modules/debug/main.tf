locals {
  common_tags = {
    Purpose = "debug"
  }
  # リソース名共通prefix
  prefix = "${var.project_settings.project}-${var.project_settings.environment}"
}

# ============================================
# Security Group
# ============================================
# Debug Security Group
# デバッグ用EC2が所属するセキュリティグループ
# --------------------------------------------
resource "aws_security_group" "debug" {
  count = var.enable_debug_resources ? 1 : 0

  name   = "${local.prefix}-debug-sg"
  vpc_id = var.debug_settings.vpc_id

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-debug-sg"
  })
}

# Security Group Rule
# EC2からインターネットへのアウトバウンド通信を許可
# --------------------------------------------
resource "aws_security_group_rule" "debug_to_internet_egress_HTTPS" {
  count = var.enable_debug_resources ? 1 : 0

  type              = "egress"
  protocol          = "tcp"
  from_port         = 443
  to_port           = 443
  security_group_id = aws_security_group.debug[count.index].id
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow egress form debug SG to HTTPS(5432)"
}

# Security Group Rule
# EC2からRDSへのアウトバウンド通信を許可する
# --------------------------------------------
resource "aws_security_group_rule" "debug_to_rds_egress_5432" {
  count = var.enable_debug_resources ? 1 : 0

  type                     = "egress"
  protocol                 = "tcp"
  from_port                = 5432
  to_port                  = 5432
  security_group_id        = aws_security_group.debug[count.index].id
  source_security_group_id = var.debug_settings.rds_security_group_id
  description              = "Allow egress form debug SG to RDS(5432)"
}

# Security Group Rule
# RDS用SGへの通信を許可する
# --------------------------------------------
resource "aws_security_group_rule" "rds_from_debug_ingress_5432" {
  count = var.enable_debug_resources ? 1 : 0

  type                     = "ingress"
  protocol                 = "tcp"
  from_port                = 5432
  to_port                  = 5432
  security_group_id        = var.debug_settings.rds_security_group_id
  source_security_group_id = aws_security_group.debug[count.index].id
  description              = "Allow ingress form debug SG to RDS(5432)"
}

# ============================================
# IAM
# ============================================
# IAM Role
# デバッグ用のEC2にアタッチするIAMロール
# セッションマネージャーで接続するために必要
# --------------------------------------------
resource "aws_iam_role" "debug_ec2_ssm" {
  name = "${local.prefix}-debug-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      },
    }]
  })
}

# IAM Policy Attachment
# --------------------------------------------
resource "aws_iam_role_policy_attachment" "debug_ec2_ssm_attach" {
  role       = aws_iam_role.debug_ec2_ssm.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# IAM Instance Profile
# --------------------------------------------
resource "aws_iam_instance_profile" "debug_ec2" {
  name = "${local.prefix}-debug-ec2-profile"
  role = aws_iam_role.debug_ec2_ssm.name
}

# ============================================
# EC2
# ============================================
# EC2 AMI
# 標準の Amazon Linux 2023 の最新 AMI を取得する
# --------------------------------------------
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 instance
# デバッグ用のEC2インスタンス
# --------------------------------------------
resource "aws_instance" "debug" {
  count = var.enable_debug_resources ? 1 : 0

  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t2.micro"
  subnet_id     = var.debug_settings.ecs_private_subnet_id

  vpc_security_group_ids = [aws_security_group.debug[0].id]
  iam_instance_profile   = aws_iam_instance_profile.debug_ec2.name

  // 初期実行ファイル
  // EC2 はRDSに接続するため postgresql をインストールしておく
  user_data = file("${path.module}/user_data.sh")

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-debug-ec2"
  })
}
