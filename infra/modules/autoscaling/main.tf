
locals {
  # リソース名共通prefix
  prefix = "${var.project_settings.project}-${var.project_settings.environment}"
}

resource "aws_appautoscaling_target" "api" {
  # オートスケーリングの最小・最大タスク数（同時に動くコンテナ数）
  min_capacity = 1
  max_capacity = 2

  # 対象のECSサービスを指定
  # "service/クラスタ名/サービス名" の形式で書く必要あり
  resource_id = "service/${var.autoscaling_settings.cluster_name}/${var.autoscaling_settings.service_name}"

  # スケーリング対象の項目
  scalable_dimension = "ecs:service:DesiredCount"

  # サービスの種類
  service_namespace = "ecs"

  tags = {
    Name = "${local.prefix}-ecs-api-autoscaling-target"
  }
}

resource "aws_appautoscaling_policy" "api_cpu_target" {
  name = "${local.prefix}-api-cpu-target"

  # スケーリング対象を指定
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace

  # スケーリングの条件設定
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    # 検証のため CPU使用率30% を指定
    # (30%を超えたらタスク数を増やす)
    target_value = 30
    # 本番では 60% を指定
    # target_value       = 60
    scale_in_cooldown  = 60 # スケールイン後 60 秒は連続スケール禁止
    scale_out_cooldown = 60 # スケールアウト後 60 秒は連続スケール禁止
  }
}
