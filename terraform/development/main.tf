terraform {
  backend "s3" {
    bucket = "valicit-backend-tf-state"
    region = "eu-west-1"
    key = "dev"
  }
}

provider "aws" {
  region = "eu-west-1"
}

module "ecr_repository" {
  source = "./modules/aws_ecr"
}

module "networking" {
  source = "./modules/networking"
}

module "ecs_agent" {
  source = "./modules/aws_ecs_roles"
}

module "secrets_manager" {
  source = "./modules/aws_secrets_manager"
}

module "ecs_api" {
  source = "./modules/aws_ecs_api"

  depends_on = [module.ecr_repository, module.ecs_agent, module.networking, module.secrets_manager]

  vpc_id = module.networking.vpc_id
  alb_security_group_id = module.networking.alb_sg_id
  instance_security_group_id = module.networking.instance_sg_id
  public_subnet_a_id = module.networking.public_subnet_a_id
  public_subnet_b_id = module.networking.public_subnet_b_id
  ecs_agent_name = module.ecs_agent.ecs_agent_name
  valicit_backend_erc_url = module.ecr_repository.valicit_backend_erc_url
  secret_manager_id_api = module.secrets_manager.aws_secret_manager_id_api
}

module "ecs_web" {
  source = "./modules/aws_ecs_web"

  depends_on = [module.ecr_repository, module.ecs_agent, module.networking, module.secrets_manager]

  vpc_id = module.networking.vpc_id
  alb_security_group_id = module.networking.alb_sg_id
  instance_security_group_id = module.networking.instance_sg_id
  public_subnet_a_id = module.networking.public_subnet_a_id
  public_subnet_b_id = module.networking.public_subnet_b_id
  ecs_agent_name = module.ecs_agent.ecs_agent_name
  valicit_backend_erc_url = module.ecr_repository.valicit_backend_erc_url
  secret_manager_id_web = module.secrets_manager.aws_secret_manager_id_web
}

module "ecs_admin" {
  source = "./modules/aws_ecs_admin"

  depends_on = [module.ecr_repository, module.ecs_agent, module.networking, module.secrets_manager]

  vpc_id = module.networking.vpc_id
  instance_security_group_id = module.networking.instance_sg_id
  public_subnet_a_id = module.networking.public_subnet_a_id
  public_subnet_b_id = module.networking.public_subnet_b_id
  ecs_agent_name = module.ecs_agent.ecs_agent_name
  valicit_backend_erc_url = module.ecr_repository.valicit_backend_erc_url
  secret_manager_id_admin = module.secrets_manager.aws_secret_manager_id_admin
}

module "ecs_consumer" {
  source = "./modules/aws_ecs_consumer"

  depends_on = [module.ecr_repository, module.ecs_agent, module.networking, module.secrets_manager]

  instance_security_group_id = module.networking.instance_sg_id
  ecs_agent_name = module.ecs_agent.ecs_agent_name
  valicit_backend_erc_url = module.ecr_repository.valicit_backend_erc_url
  secret_manager_id_consumer = module.secrets_manager.aws_secret_manager_id_consumer
  public_subnet_a_id = module.networking.public_subnet_a_id
  public_subnet_b_id = module.networking.public_subnet_b_id
}

module "ecs_producer" {
  source = "./modules/aws_ecs_producer"

  depends_on = [module.ecr_repository, module.ecs_agent, module.networking, module.secrets_manager]

  instance_security_group_id = module.networking.instance_sg_id
  ecs_agent_name = module.ecs_agent.ecs_agent_name
  valicit_backend_erc_url = module.ecr_repository.valicit_backend_erc_url
  secret_manager_id_producer = module.secrets_manager.aws_secret_manager_id_producer
  public_subnet_a_id = module.networking.public_subnet_a_id
  public_subnet_b_id = module.networking.public_subnet_b_id
}

module "ecs_kafka_ui" {
  source = "./modules/aws_ecs_kafka_ui"

  depends_on = [module.ecr_repository, module.ecs_agent, module.networking, module.secrets_manager, module.ecs_admin]

  secret_manager_id_kafka_ui = module.secrets_manager.aws_secret_manager_id_kafka_ui
}
