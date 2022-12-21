data "aws_secretsmanager_secret_version" "current" {
  secret_id = var.secret_manager_id
}

data "aws_ecr_image" "api_gateway_image" {
  repository_name = "api_gateway"
  image_tag       = "latest"
}

locals {
  env_vars = [
    for k, v in jsondecode(data.aws_secretsmanager_secret_version.current.secret_string) : { name = k, value = v }
  ]
}

resource "aws_ecs_cluster" "api_gateway_producer_cluster" {
  name = "api_gateway_producer_cluster"
}

data "aws_ami" "amz_linux" {
  owners      = ["amazon"]
  most_recent = true

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-2.0.*-x86_64-ebs"]
  }
}

resource "aws_cloudwatch_log_group" "api_gateway_producer" {
  name = "api_gateway_producer"

  tags = {
    Environment = "production"
    Application = "API Gateway Producer"
  }
}

resource "aws_ecs_task_definition" "api_gateway_producer_ecs_task_definition" {
  family                = "api_gateway_producer_ecs_task_definition"
  network_mode          = "bridge"
  container_definitions = jsonencode([
    {
      command : ["npm", "run", "producer"],
      environment : local.env_vars,
      memory : 400
      essential : true,
      image : "${var.api_gateway_erc_url}@${data.aws_ecr_image.api_gateway_image.image_digest}",
      name : "api_gateway_producer",
      logConfiguration: {
        logDriver: "awslogs",
        options: {
          awslogs-group: aws_cloudwatch_log_group.api_gateway_producer.name,
          awslogs-region: "eu-west-1",
          awslogs-stream-prefix: "api_gateway_producer"
        }
      }
    }
  ])
}

resource "aws_launch_configuration" "api_gateway_producer_launch_config" {
  name_prefix                 = "ecs_api_gateway_producer_"
  enable_monitoring           = true
  image_id                    = data.aws_ami.amz_linux.id
  iam_instance_profile        = var.ecs_agent_name
  security_groups             = [var.instance_security_group_id]
  associate_public_ip_address = false
  key_name                    = "validate-ec2-key"
  user_data                   = <<EOF
#!/bin/bash
echo ECS_CLUSTER=${aws_ecs_cluster.api_gateway_producer_cluster.name} >> /etc/ecs/ecs.config
EOF
  instance_type               = "t3.small"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "api_gateway_producer_ecs_asg" {
  name_prefix          = "api_gateway_producer_asg"
  launch_configuration = aws_launch_configuration.api_gateway_producer_launch_config.name
  vpc_zone_identifier = [var.private_subnet_a_id, var.private_subnet_b_id]
  
  desired_capacity          = 1
  min_size                  = 1
  max_size                  = 10
  min_elb_capacity          = 1
  health_check_grace_period = 300
  health_check_type         = "EC2"

  lifecycle {
    create_before_destroy = true
  }

  tag {
    key                 = "Name"
    propagate_at_launch = true
    value               = "API Gateway Producer"
  }
}

resource "aws_ecs_service" "api_gateway_producer_service" {
  name            = "api_gateway_producer_service"
  cluster         = aws_ecs_cluster.api_gateway_producer_cluster.id
  task_definition = aws_ecs_task_definition.api_gateway_producer_ecs_task_definition.arn
  desired_count   = 1
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent = 100
  force_new_deployment = true
  wait_for_steady_state = true

  deployment_circuit_breaker {
    enable = true
    rollback = true
  }

  ordered_placement_strategy {
    type = "spread"
    field = "attribute:ecs.availability-zone"
  }

  ordered_placement_strategy {
    type = "spread"
    field = "instanceId"
  }
}