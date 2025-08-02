locals {
  # リソース名共通のprefix
  prefix = "${var.project_settings.project}-${var.project_settings.environment}"
}

# ============================================
# RDS
# ============================================
resource "aws_db_instance" "this" {
  identifier = "${local.prefix}-postgresql-rds"
  # PostgreSQLを指定
  engine            = "postgres"
  engine_version    = "16.9"
  instance_class    = var.rds_settings.instance_type
  allocated_storage = 20
  storage_type      = "gp3"

  # 管理者ユーザー情報
  username = var.rds_settings.db_user
  password = var.rds_settings.db_password
  db_name  = var.rds_settings.db_name
  port     = 5432

  # ネットワーク設定
  vpc_security_group_ids = [var.rds_settings.rds_sg_id]
  # サブネットグループ
  db_subnet_group_name = aws_db_subnet_group.db_subnet_group.name

  # 使用するパラメータグループを指定
  parameter_group_name = aws_db_parameter_group.parameter_group.name

  # 削除防止設定
  deletion_protection = ver.is_production

  # 削除時にスナップショット取得可否(trueだとスナップショットを作成せずにそのまま削除される)
  # ※学習用のためtrueに設定
  skip_final_snapshot = true

  # 推奨設定
  # skip_final_snapshot       = !var.is_production
  # final_snapshot_identifier = "${local.prefix}-final-snapshot"

  # 設定をすぐに反映するか否か(false（= 本番）ならメンテナンスウィンドウ中に適用される)
  apply_immediately = !var.is_production

  # マルチAZ構成を使うか否か
  multi_az = var.is_production

  # パブリックアクセス（インターネットからの接続）を許可するか否か
  publicly_accessible = false

  # ストレージのデータを暗号化するか否か
  storage_encrypted = true

  # 毎日のバックアップの時刻設定（UTC）※日本時間の 3:00〜4:00 に設定
  backup_window = "18:00-19:00"

  # 定期メンテナンスの日時指定（UTC時間）
  maintenance_window = "Sun:04:00-Sun:05:00"

  # バックアップ保持期間(本番は7日、開発環境は1日)
  backup_retention_period = var.is_production ? 7 : 1

  # スナップショットにタグをコピー
  copy_tags_to_snapshot = true

  lifecycle {
    # 破棄を完全に防ぐかどうか（falseなら削除可能）
    prevent_destroy = false

    # 変更を無視する属性を指定
    ignore_changes = [final_snapshot_identifier]
  }

  tags = {
    Name = "${local.prefix}-postgresql-rds"
  }
}

# Subnet group
# RDSがどのサブネットに配置されるかをまとめて指定するグループ
# --------------------------------------------
resource "aws_db_subnet_group" "db_subnet_group" {
  name = "${local.prefix}-postgresql-subnet-group"

  # 使用するサブネットID
  subnet_ids = var.rds_settings.rds_subnet_ids

  tags = {
    Name = "${local.prefix}-postgresql-subnet-group"
  }
}

# Parameter group
# RDSの動作を細かく設定するためのパラメータ集
# --------------------------------------------
resource "aws_db_parameter_group" "parameter_group" {
  name = "${local.prefix}-postgresql-parameter-group"

  # 使用するDBエンジンの種類とバージョン
  family      = "postgres16"
  description = "postgresql parameter group"

  # 1秒以上かかったSQLをログに記録
  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  # DBへの接続をログに残す
  parameter {
    name  = "log_connections"
    value = "1"
  }

  # DBからの切断もログに残す
  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  tags = {
    Name = "${local.prefix}-postgresql-parameter-group"
  }
}
