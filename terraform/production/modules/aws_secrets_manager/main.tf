resource "aws_secretsmanager_secret" "api_production" {
  name = "api/production"
  recovery_window_in_days = 0

  lifecycle {
    prevent_destroy = false
  }
}

data "aws_secretsmanager_secret_version" "api_current" {
  secret_id = aws_secretsmanager_secret.api_production.id
}

resource "aws_secretsmanager_secret" "web_production" {
  name = "web/production"
  recovery_window_in_days = 0

  lifecycle {
    prevent_destroy = false
  }
}

data "aws_secretsmanager_secret_version" "web_current" {
  secret_id = aws_secretsmanager_secret.web_production.id
}

resource "aws_secretsmanager_secret" "admin_production" {
  name = "admin/production"
  recovery_window_in_days = 0

  lifecycle {
    prevent_destroy = false
  }
}

data "aws_secretsmanager_secret_version" "admin_current" {
  secret_id = aws_secretsmanager_secret.admin_production.id
}

resource "aws_secretsmanager_secret" "producer_production" {
  name = "producer/production"
  recovery_window_in_days = 0

  lifecycle {
    prevent_destroy = false
  }
}

data "aws_secretsmanager_secret_version" "producer_current" {
  secret_id = aws_secretsmanager_secret.producer_production.id
}

resource "aws_secretsmanager_secret" "consumer_production" {
  name = "consumer/production"
  recovery_window_in_days = 0

  lifecycle {
    prevent_destroy = false
  }
}

data "aws_secretsmanager_secret_version" "consumer_current" {
  secret_id = aws_secretsmanager_secret.consumer_production.id
}

resource "aws_secretsmanager_secret" "kafka_ui_production" {
  name = "kafka_ui/production"
  recovery_window_in_days = 0

  lifecycle {
    prevent_destroy = false
  }
}

data "aws_secretsmanager_secret_version" "kafka_ui_current" {
  secret_id = aws_secretsmanager_secret.kafka_ui_production.id
}

output "aws_secret_manager_id_api" {
  value = data.aws_secretsmanager_secret_version.api_current.secret_id
}

output "aws_secret_manager_id_web" {
  value = data.aws_secretsmanager_secret_version.web_current.secret_id
}

output "aws_secret_manager_id_admin" {
  value = data.aws_secretsmanager_secret_version.admin_current.secret_id
}

output "aws_secret_manager_id_producer" {
  value = data.aws_secretsmanager_secret_version.producer_current.secret_id
}

output "aws_secret_manager_id_consumer" {
  value = data.aws_secretsmanager_secret_version.consumer_current.secret_id
}

output "aws_secret_manager_id_kafka_ui" {
  value = data.aws_secretsmanager_secret_version.kafka_ui_current.secret_id
}