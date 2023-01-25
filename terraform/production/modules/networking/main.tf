data "aws_vpc" "vpc" {
  filter {
    name   = "tag:Name"
    values = ["Validate VPC"]
  }
}

data "aws_subnet" "private_subnet_a" {
  filter {
    name   = "tag:Name"
    values = ["validate-private-eu-west-1a"]
  }
}

data "aws_subnet" "private_subnet_b" {
  filter {
    name   = "tag:Name"
    values = ["validate-private-eu-west-1b"]
  }
}

data "aws_subnet" "public_subnet_a" {
  filter {
    name   = "tag:Name"
    values = ["validate-public-eu-west-1a"]
  }
}

data "aws_subnet" "public_subnet_b" {
  filter {
    name   = "tag:Name"
    values = ["validate-public-eu-west-1b"]
  }
}

resource "aws_security_group" "alb_sg" {
  name   = "Valicit ALB SG"
  vpc_id = data.aws_vpc.vpc.id

  dynamic "ingress" {
    for_each = ["80", "443"]
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group" "instance_sg" {
  name   = "Valicit Instance SG"
  vpc_id = data.aws_vpc.vpc.id

  ingress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["10.1.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }
}


output "vpc_id" {
  value = data.aws_vpc.vpc.id
}

output "alb_sg_id" {
  value = aws_security_group.alb_sg.id
}

output "instance_sg_id" {
  value = aws_security_group.instance_sg.id
}

output "public_subnet_a_id" {
  value = data.aws_subnet.public_subnet_a.id
}

output "public_subnet_b_id" {
  value = data.aws_subnet.public_subnet_b.id
}

output "private_subnet_a_id" {
  value = data.aws_subnet.private_subnet_a.id
}

output "private_subnet_b_id" {
  value = data.aws_subnet.private_subnet_b.id
}
