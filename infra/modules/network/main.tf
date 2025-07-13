# data
locals {
  # リソース名共通prefix
  prefix = "${var.project_settings.project}-${var.project_settings.environment}"

  # AZ名の末尾サフィックス
  az_suffixes = [for az in var.network_settings.availability_zones : regex("[0-9][a-z]$", az)]
}

# ============================================
# VPC
# ============================================
resource "aws_vpc" "this" {
  cidr_block           = var.network_settings.vpc_cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "${local.prefix}-vpc"
  }
}

# ============================================
# Subnet
# ============================================
# NAT Public Subnet
# --------------------------------------------
resource "aws_subnet" "nat_public" {
  # 指定されたCIDR blockの数だけサブネットを作成する
  count             = length(var.network_settings.nat_public_subnet_cidr_blocks)
  vpc_id            = aws_vpc.this.id
  cidr_block        = element(var.network_settings.nat_public_subnet_cidr_blocks, count.index)
  availability_zone = element(var.network_settings.availability_zones, count.index)

  tags = {
    Name = "${local.prefix}-nat-public-subnet-${local.az_suffixes[count.index]}"
  }
}

# ALB Public Subnet
# --------------------------------------------
resource "aws_subnet" "alb_public" {
  # 指定されたCIDR blockの数だけサブネットを作成する
  count             = length(var.network_settings.alb_public_subnet_cidr_blocks)
  vpc_id            = aws_vpc.this.id
  cidr_block        = element(var.network_settings.alb_public_subnet_cidr_blocks, count.index)
  availability_zone = element(var.network_settings.availability_zones, count.index)

  tags = {
    Name = "${local.prefix}-alb-public-subnet-${local.az_suffixes[count.index]}"
  }
}

# ECS Private Subnet
# --------------------------------------------
resource "aws_subnet" "ecs_private" {
  # 指定されたCIDR blockの数だけサブネットを作成する
  count             = length(var.network_settings.ecs_private_subnet_cidr_blocks)
  vpc_id            = aws_vpc.this.id
  cidr_block        = element(var.network_settings.ecs_private_subnet_cidr_blocks, count.index)
  availability_zone = element(var.network_settings.availability_zones, count.index)

  tags = {
    Name = "${local.prefix}-ecs-private-subnet-${local.az_suffixes[count.index]}"
  }
}

# RDS Private Subnet
# --------------------------------------------
resource "aws_subnet" "rds_private" {
  count             = length(var.network_settings.rds_private_subnet_cidr_blocks)
  vpc_id            = aws_vpc.this.id
  cidr_block        = element(var.network_settings.rds_private_subnet_cidr_blocks, count.index)
  availability_zone = element(var.network_settings.availability_zones, count.index)

  tags = {
    Name = "${local.prefix}-rds-private-subnet-${local.az_suffixes[count.index]}"
  }
}

# ============================================
# Internet Gateway
# ============================================
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${local.prefix}-igw"
  }
}

# ============================================
# Nat Gateway
# ============================================
# eip
# --------------------------------------------
resource "aws_eip" "nat" {
  count = length(aws_subnet.nat_public)

  tags = {
    Name = "${local.prefix}-nat-eip-${count.index}"
  }
}

# NAT Gateway
# --------------------------------------------
resource "aws_nat_gateway" "this" {
  count         = length(aws_subnet.nat_public)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.nat_public[count.index].id

  tags = {
    Name = "${local.prefix}-nat-gateway-${count.index}"
  }
}

# ============================================
# Route Table
# ============================================
# Public Route Table
# --------------------------------------------
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${local.prefix}-public-route-table"
  }
}

# Public Route
# 0.0.0.0/0 へのルートを IGWに設定
# --------------------------------------------
resource "aws_route" "public" {
  destination_cidr_block = "0.0.0.0/0"
  route_table_id         = aws_route_table.public.id
  gateway_id             = aws_internet_gateway.this.id
}

# Route Table Association
# ALBサブネットに、パブリックルートテーブルを関連付け
# --------------------------------------------
resource "aws_route_table_association" "alb_public" {
  count          = length(aws_subnet.alb_public)
  subnet_id      = aws_subnet.alb_public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Route Table Association
# NATサブネットに、パブリックルートテーブルを関連付け
# --------------------------------------------
resource "aws_route_table_association" "nat_public" {
  count          = length(aws_subnet.nat_public)
  subnet_id      = aws_subnet.nat_public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private Route Table
# 本番環境では NAT がAZごとに配置されるので、Private RTは複数作成する
# --------------------------------------------
resource "aws_route_table" "private" {
  count = length(aws_subnet.nat_public)

  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${local.prefix}-private-route-table-${local.az_suffixes[count.index]}"
  }
}

# Private Route
# 各AZ用のルート（NAT Gatewayにルーティング）
resource "aws_route" "private_to_nat" {
  count                  = length(aws_subnet.nat_public)
  route_table_id         = aws_route_table.private[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.this[count.index].id
}

locals {
  private_rt_count = length(aws_route_table.private)
}

# Route Table Association
# ECSサブネットに、プライベートルートテーブルを関連付け
# --------------------------------------------
resource "aws_route_table_association" "ecs_private" {
  count          = length(aws_subnet.ecs_private)
  subnet_id      = aws_subnet.ecs_private[count.index].id
  route_table_id = aws_route_table.private[count.index % local.private_rt_count].id
}

# Route Table Association
# RDSサブネットに、プライベートルートテーブルを関連付け
# --------------------------------------------
resource "aws_route_table_association" "rds_private" {
  count          = length(aws_subnet.rds_private)
  subnet_id      = aws_subnet.rds_private[count.index].id
  route_table_id = aws_route_table.private[count.index % local.private_rt_count].id
}

# ============================================
# Security Group
# ============================================
# ALB Security Group
# --------------------------------------------
resource "aws_security_group" "alb" {
  name        = "${var.project_settings.project}-${var.project_settings.environment}-alb-sg"
  vpc_id      = aws_vpc.this.id
  description = "Security group for ALB"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS"
  }


  tags = {
    Name = "${local.prefix}-alb-sg"
  }
}

# Security Group Rule
# ALB から ECS へのアウトバウンド通信を許可
# --------------------------------------------
resource "aws_security_group_rule" "alb_to_ecs_egress_8080" {
  type                     = "egress"
  protocol                 = "tcp"
  from_port                = 8080
  to_port                  = 8080
  security_group_id        = aws_security_group.alb.id
  source_security_group_id = aws_security_group.ecs.id
}

# ECS Security Group
# --------------------------------------------
resource "aws_security_group" "ecs" {
  name        = "${local.prefix}-ecs-sg"
  vpc_id      = aws_vpc.this.id
  description = "Security group for ECS"

  tags = {
    Name = "${local.prefix}-ecs-sg"
  }
}

# ECS Security Group Rule
# ALB から ECS へのインバウンド通信を許可
# --------------------------------------------
resource "aws_security_group_rule" "ecs_from_alb_ingress_8080" {
  type                     = "ingress"
  protocol                 = "tcp"
  from_port                = 8080
  to_port                  = 8080
  security_group_id        = aws_security_group.ecs.id
  source_security_group_id = aws_security_group.alb.id
}

# ECS Security Group Rule
# ECSタスクから443アウトバウンド通信を許可
# --------------------------------------------
resource "aws_security_group_rule" "ecs_to_egress_443" {
  type              = "egress"
  protocol          = "tcp"
  from_port         = 443
  to_port           = 443
  security_group_id = aws_security_group.ecs.id
  cidr_blocks       = ["0.0.0.0/0"]
}

# ECS Security Group Rule
# ECSタスクからVPC内のRDSへの通信を許可
# --------------------------------------------
resource "aws_security_group_rule" "ecs_to_rds_5432" {
  type                     = "egress"
  protocol                 = "tcp"
  from_port                = 5432
  to_port                  = 5432
  security_group_id        = aws_security_group.ecs.id
  source_security_group_id = aws_security_group.rds.id
}

# RDS Security Group
# --------------------------------------------
resource "aws_security_group" "rds" {
  name        = "${var.project_settings.project}-${var.project_settings.environment}-rds-sg"
  vpc_id      = aws_vpc.this.id
  description = "Security group for RDS"

  egress = []

  tags = {
    Name = "${var.project_settings.project}-${var.project_settings.environment}-rds-sg"
  }
}

# RDS Security Group Rule
# ECSからRDSへの通信を許可
# --------------------------------------------
resource "aws_security_group_rule" "ecs_from_rds_5432" {
  type                     = "ingress"
  protocol                 = "tcp"
  from_port                = 5432
  to_port                  = 5432
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = aws_security_group.ecs.id
}
