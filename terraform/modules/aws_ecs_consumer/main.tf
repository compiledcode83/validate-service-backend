data "aws_secretsmanager_secret_version" "current" {
  secret_id = var.secret_manager_id
}

locals {
  env_vars = [
    for k, v in jsondecode(data.aws_secretsmanager_secret_version.current.secret_string) : { name = k, value = v }
  ]
}

resource "aws_ecs_cluster" "web3_consumer_cluster" {
  name = "web3_consumer_cluster"
}

data "aws_ami" "amz_linux" {
  owners      = ["amazon"]
  most_recent = true

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-2.0.*-x86_64-ebs"]
  }
}

resource "aws_cloudwatch_log_group" "web3_consumer" {
  name = "web3_consumer"

  tags = {
    Environment = "production"
    Application = "Web3 Consumer"
  }
}

resource "aws_ecs_task_definition" "web3_consumer_ecs_task_definition" {
  family                = "web3_consumer_ecs_task_definition"
  network_mode          = "bridge"
  container_definitions = jsonencode([
    {
      command : ["npm", "run", "consumer"],
      environment : local.env_vars,
      memory : 400
      essential : true,
      image : var.api_gateway_erc_url,
      name : "web3_consumer",
      logConfiguration: {
        logDriver: "awslogs",
        options: {
          awslogs-group: aws_cloudwatch_log_group.web3_consumer.name,
          awslogs-region: "eu-west-1",
          awslogs-stream-prefix: "web3_consumer"
        }
      }
    }
  ])
}

resource "aws_launch_configuration" "web3_consumer_launch_config" {
  name_prefix                 = "ecs_web3_consumer_"
  enable_monitoring           = true
  image_id                    = data.aws_ami.amz_linux.id
  iam_instance_profile        = var.ecs_agent_name
  security_groups             = [var.instance_security_group_id]
  associate_public_ip_address = false
  key_name                    = "validate-ec2-key"
  user_data                   = <<EOF
#!/bin/bash
echo ECS_CLUSTER=${aws_ecs_cluster.web3_consumer_cluster.name} >> /etc/ecs/ecs.config
EOF
  instance_type               = "t3.micro"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "web3_consumer_ecs_asg" {
  name_prefix          = "web3_consumer_asg"
  launch_configuration = aws_launch_configuration.web3_consumer_launch_config.name
  vpc_zone_identifier = [var.private_subnet_a_id, var.private_subnet_b_id]
  
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
    value               = "Web3 Consumer"
  }
}

resource "aws_ecs_service" "web3_consumer_service" {
  name            = "web3_consumer_service"
  cluster         = aws_ecs_cluster.web3_consumer_cluster.id
  task_definition = aws_ecs_task_definition.web3_consumer_ecs_task_definition.arn
  desired_count   = 2
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent = 200

  ordered_placement_strategy {
    type = "spread"
    field = "attribute:ecs.availability-zone"
  }

  ordered_placement_strategy {
    type = "spread"
    field = "instanceId"
  }
}