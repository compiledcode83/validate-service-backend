resource "aws_secretsmanager_secret" "api_development" {
  name = "api/development"
  recovery_window_in_days = 0

  lifecycle {
    prevent_destroy = false
  }
}

data "aws_secretsmanager_secret_version" "api_current" {
  secret_id = aws_secretsmanager_secret.api_development.id
}

resource "aws_secretsmanager_secret" "web_development" {
  name = "web/development"
  recovery_window_in_days = 0

  lifecycle {
    prevent_destroy = false
  }
}

data "aws_secretsmanager_secret_version" "web_current" {
  secret_id = aws_secretsmanager_secret.web_development.id
}

resource "aws_secretsmanager_secret" "admin_development" {
  name = "admin/development"
  recovery_window_in_days = 0

  lifecycle {
    prevent_destroy = false
  }
}

data "aws_secretsmanager_secret_version" "admin_current" {
  secret_id = aws_secretsmanager_secret.admin_development.id
}

resource "aws_secretsmanager_secret" "producer_development" {
  name = "producer/development"
  recovery_window_in_days = 0

  lifecycle {
    prevent_destroy = false
  }
}

data "aws_secretsmanager_secret_version" "producer_current" {
  secret_id = aws_secretsmanager_secret.producer_development.id
}

resource "aws_secretsmanager_secret" "consumer_development" {
  name = "consumer/development"
  recovery_window_in_days = 0

  lifecycle {
    prevent_destroy = false
  }
}

data "aws_secretsmanager_secret_version" "consumer_current" {
  secret_id = aws_secretsmanager_secret.consumer_development.id
}

resource "aws_secretsmanager_secret" "kafka_ui_development" {
  name = "kafka_ui/development"
  recovery_window_in_days = 0

  lifecycle {
    prevent_destroy = false
  }
}

data "aws_secretsmanager_secret_version" "kafka_ui_current" {
  secret_id = aws_secretsmanager_secret.kafka_ui_development.id
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