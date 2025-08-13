locals {
  prefix = "${var.project_settings.project}-${var.project_settings.environment}"
}

# ALB本体の定義
resource "aws_alb" "this" {
  name = "${local.prefix}-alb"

  # ALBのネットワーク設定
  security_groups = [var.alb_settings.sg_id]
  subnets         = var.alb_settings.subnet_ids

  # インターネット向けのためのfalse(trueにすると内部向けになる)
  internal = false

  # HTTP/HTTPSベースのL7ロードバランサー
  load_balancer_type = "application"

  # アクセスログの設定
  access_logs {
    bucket  = var.alb_settings.bucket_name
    enabled = true
    prefix  = ""
  }

  # 削除保護
  enable_deletion_protection = false

  # タグの設定
  tags = {
    Name = "${local.prefix}-alb"
  }
}

# ターゲットグループの定義
resource "aws_alb_target_group" "ecs" {
  name     = "${local.prefix}-alb-ecs-tg"
  protocol = "HTTP"
  port     = 8080
  vpc_id   = var.alb_settings.vpc_id

  # ヘルスチェックの設定
  health_check {
    path                = "/public/health"
    protocol            = "HTTP"
    port                = "traffic-port"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Name = "${local.prefix}-alb-ecs-tg"
  }
}

# HTTP(ポート80)のリスナーの定義
# => すべてのリクエストをHTTPS(ポート443)にリダイレクトする
resource "aws_alb_listener" "http" {
  load_balancer_arn = aws_alb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301" # 永続的リダイレクト
    }
  }

  tags = {
    Name = "${local.prefix}-alb-http-listener"
  }
}

# HTTPS(ポート443)のリスナーの定義
# => デフォルトでは拒否(正しいホスト名以外を除外する)
resource "aws_alb_listener" "https" {
  load_balancer_arn = aws_alb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.alb_settings.cert_arn

  # デフォルトで403を返す
  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Forbidden"
      status_code  = "403"
    }
  }
  tags = {
    Name = "${local.prefix}-alb-https-listener"
  }
}

# Hostヘッダーが想定通りのドメインの場合のみ転送許可
# Host: api.eample.comの時だけターゲットに転送
resource "aws_alb_listener_rule" "allow_only_domain" {
  listener_arn = aws_alb_listener.https.arn
  priority     = 1

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.ecs.arn
  }

  condition {
    host_header {
      values = [var.alb_settings.alb_domain_name]
    }
  }
}

# Route53 Aレコードを作成
# => ユーザーが「api.example.com」でアクセスできるようにする
resource "aws_route53_record" "api" {
  zone_id = var.alb_settings.zone_id
  name    = var.alb_settings.alb_domain_name
  type    = "A"

  alias {
    name                   = aws_alb.this.dns_name
    zone_id                = aws_alb.this.zone_id
    evaluate_target_health = true
  }
}
