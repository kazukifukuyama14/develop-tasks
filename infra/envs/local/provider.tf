terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  // リージョン
  region  = "ap-northeast-1"
  profile = "dev"

  // 作成するリソースの共通タグ
  default_tags {
    tags = {
      Project     = var.project_settings.project
      Environment = var.project_settings.environment
      ManagedBy   = "Terraform"
    }
  }
}
