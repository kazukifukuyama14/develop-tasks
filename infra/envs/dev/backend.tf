terraform {
  backend "s3" {
    bucket         = "terraform-state-b8766hhxsj"
    key            = "envs/dev/terraform.tfstate"
    region         = "ap-northeast-1"
    profile        = "dev"
    use_lockfile   = true
    dynamodb_table = "taskfolio-terraform-locks"
  }
}
