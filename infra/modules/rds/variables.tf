variable "project_settings" {
  description = "プロジェクト共通の設定"
  type = object({
    project     = string
    environment = string
  })
}

variable "is_production" {
  description = "本番環境か否かのフラグ"
  type        = bool
  default     = false
}

variable "rds_settings" {
  description = "RDSの設定"
  type = object({
    rds_subnet_ids = list(string)
    rds_sg_id      = string
    instance_type  = string
    db_name        = string
    db_user        = string
    db_password    = string
  })

  validation {
    condition = contains(
      ["db.t4g.micro", "db.t4g.small", "db.t4g.medium"],
      var.rds_settings.instance_type
    )
    error_message = "instance_type は db.t4g.micro / db.t4g.small / db.t4g.medium のいずれかにしてください。"
  }
}
