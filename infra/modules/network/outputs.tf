output "vpc" {
  value = {
    id         = aws_vpc.this.id
    cidr_block = aws_vpc.this.cidr_block
  }
}

output "subnet_ids" {
  value = {
    ecs = aws_subnet.ecs_private[*].id
    rds = aws_subnet.rds_private[*].id
    alb = aws_subnet.alb_public[*].id
  }
}

output "security_group_ids" {
  value = {
    alb = aws_security_group.alb.id
    rds = aws_security_group.rds.id
    ecs = aws_security_group.ecs.id
  }
}
