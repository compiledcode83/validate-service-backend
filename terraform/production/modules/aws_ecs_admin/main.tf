data "aws_secretsmanager_secret_version" "current" {
  secret_id = var.secret_manager_id_admin
}

data "aws_ecr_image" "valicit_backend_image" {
  repository_name = "valicit_backend"
  image_tag       = "admin-production"
}

locals {
  env_vars = [
    for k, v in jsondecode(data.aws_secretsmanager_secret_version.current.secret_string) : { name = k, value = v }
  ]
}

resource "aws_ecs_cluster" "admin_cluster" {
  name = "admin_cluster"
}

data "aws_ami" "amz_linux" {
  owners      = ["amazon"]
  most_recent = true

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-2.0.*-x86_64-ebs"]
  }
}

resource "aws_cloudwatch_log_group" "admin" {
  name = "admin"

  tags = {
    Environment = "production"
    Application = "Admin"
  }
}

resource "aws_launch_configuration" "admin_launch_config" {
  name_prefix                 = "ecs_admin_"
  enable_monitoring           = true
  image_id                    = data.aws_ami.amz_linux.id
  iam_instance_profile        = var.ecs_agent_name
  security_groups             = [var.instance_security_group_id]
  associate_public_ip_address = true
  key_name                    = "validate-ec2-key"
  user_data                   = <<EOF
#!/bin/bash
echo ECS_CLUSTER=${aws_ecs_cluster.admin_cluster.name} >> /etc/ecs/ecs.config
sudo dd if=/dev/zero of=/swapfile bs=128M count=8
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
sudo swapon -s
echo "/swapfile swap swap defaults 0 0" >> /etc/fstab
EOF
  instance_type               = "t3.micro"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "admin_ecs_asg" {
  name_prefix          = "admin_asg_"
  launch_configuration = aws_launch_configuration.admin_launch_config.name
  vpc_zone_identifier = [var.public_subnet_a_id, var.public_subnet_b_id]
  
  desired_capacity          = 1
  min_size                  = 1
  max_size                  = 1
  health_check_grace_period = 300
  health_check_type         = "EC2"

  lifecycle {
    create_before_destroy = true
  }

  tag {
    key                 = "Name"
    propagate_at_launch = true
    value               = "Admin Cluster Instance"
  }
}

resource "aws_ecs_task_definition" "admin" {
  family                = "admin_ecs_task_definition"
  container_definitions = jsonencode([
    {
      command: ["npm", "run", "admin:start:prod"],
      environment : local.env_vars,
      memory : 384
      essential : true,
      image : "${var.valicit_backend_erc_url}@${data.aws_ecr_image.valicit_backend_image.image_digest}",
      name : "admin",
      portMappings : [
        {
          "containerPort" : 3000,
          "hostPort" : 3000
        }
      ],
      logConfiguration: {
        logDriver: "awslogs",
        options: {
          awslogs-group: aws_cloudwatch_log_group.admin.name,
          awslogs-region: "eu-west-1",
          awslogs-stream-prefix: "admin"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "admin" {
  name            = "admin"
  cluster         = aws_ecs_cluster.admin_cluster.id
  task_definition = aws_ecs_task_definition.admin.arn
  desired_count   = 1
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent = 100
  force_new_deployment = true
  wait_for_steady_state = true

  deployment_circuit_breaker {
    enable = true
    rollback = true
  }
}