
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  // リージョンは 東京 リージョンを指定
  region  = "ap-northeast-1"
  profile = "dev"
  // 作成するリソースの共通タグを指定
  default_tags {
    tags = {
      Project     = "taskfolio"
      Environment = "dev"
      ManagedBy   = "terraform"
    }
  }
}

provider "aws" {
  // 一部リソースはus-east-1に作成する必要があるため別リージョンをエイリアスで使用
  alias   = "use1"
  region  = "us-east-1"
  profile = "dev"
}
