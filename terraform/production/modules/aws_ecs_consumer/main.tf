data "aws_secretsmanager_secret_version" "current" {
  secret_id = var.secret_manager_id_consumer
}

data "aws_ecr_image" "valicit_backend_image" {
  repository_name = "valicit_backend"
  image_tag       = "production"
}

locals {
  env_vars = [
    for k, v in jsondecode(data.aws_secretsmanager_secret_version.current.secret_string) : { name = k, value = v }
  ]
}

resource "aws_ecs_cluster" "consumer_cluster" {
  name = "consumer_cluster"
}

data "aws_ami" "amz_linux" {
  owners      = ["amazon"]
  most_recent = true

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-2.0.*-x86_64-ebs"]
  }
}

resource "aws_cloudwatch_log_group" "consumer" {
  name = "consumer"

  tags = {
    Environment = "production"
    Application = "Consumer"
  }
}

resource "aws_ecs_task_definition" "consumer_ecs_task_definition" {
  family                = "consumer_ecs_task_definition"
  network_mode          = "bridge"
  container_definitions = jsonencode([
    {
      command : ["npm", "run", "consumer:start:prod"],
      environment : local.env_vars,
      memory : 600
      essential : true,
      image : "${var.valicit_backend_erc_url}@${data.aws_ecr_image.valicit_backend_image.image_digest}",
      name : "consumer",
      logConfiguration: {
        logDriver: "awslogs",
        options: {
          awslogs-group: aws_cloudwatch_log_group.consumer.name,
          awslogs-region: "eu-west-1",
          awslogs-stream-prefix: "consumer"
        }
      }
    }
  ])
}

resource "aws_launch_configuration" "consumer_launch_config" {
  name_prefix                 = "ecs_consumer_"
  enable_monitoring           = true
  image_id                    = data.aws_ami.amz_linux.id
  iam_instance_profile        = var.ecs_agent_name
  security_groups             = [var.instance_security_group_id]
  associate_public_ip_address = false
  key_name                    = "validate-ec2-key"
  user_data                   = <<EOF
#!/bin/bash
echo ECS_CLUSTER=${aws_ecs_cluster.consumer_cluster.name} >> /etc/ecs/ecs.config
sudo dd if=/dev/zero of=/swapfile bs=128M count=8
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
sudo swapon -s
echo "/swapfile swap swap defaults 0 0" >> /etc/fstab
EOF
  instance_type               = "t3.small"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "consumer_ecs_asg" {
  name_prefix          = "consumer_asg"
  launch_configuration = aws_launch_configuration.consumer_launch_config.name
  vpc_zone_identifier = [var.public_subnet_a_id, var.public_subnet_b_id]
  
  desired_capacity          = 2
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
    value               = "Consumer"
  }
}

resource "aws_ecs_service" "consumer_service" {
  name            = "consumer_service"
  cluster         = aws_ecs_cluster.consumer_cluster.id
  task_definition = aws_ecs_task_definition.consumer_ecs_task_definition.arn
  desired_count   = 2
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent = 200
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