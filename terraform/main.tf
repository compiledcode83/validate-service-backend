terraform {
  backend "s3" {
    bucket = "validate-tf-state"
    region = "eu-west-1"
    key = "prod"
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

module "api_gateway_ecs" {
  source = "./modules/aws_ecs_api_gateway"

  depends_on = [module.ecr_repository, module.ecs_agent, module.networking, module.secrets_manager]

  vpc_id = module.networking.vpc_id
  alb_security_group_id = module.networking.alb_sg_id
  instance_security_group_id = module.networking.instance_sg_id
  public_subnet_a_id = module.networking.public_subnet_a_id
  public_subnet_b_id = module.networking.public_subnet_b_id
  private_subnet_a_id = module.networking.private_subnet_a_id
  private_subnet_b_id = module.networking.private_subnet_b_id
  ecs_agent_name = module.ecs_agent.ecs_agent_name
  api_gateway_erc_url = module.ecr_repository.api_gateway_erc_url
  secret_manager_id = module.secrets_manager.aws_secret_manager_id
}

module "web3_consumer_ecs" {
  source = "./modules/aws_ecs_consumer"

  depends_on = [module.ecr_repository, module.ecs_agent, module.networking, module.secrets_manager]

  instance_security_group_id = module.networking.instance_sg_id
  private_subnet_a_id = module.networking.private_subnet_a_id
  private_subnet_b_id = module.networking.private_subnet_b_id
  ecs_agent_name = module.ecs_agent.ecs_agent_name
  api_gateway_erc_url = module.ecr_repository.api_gateway_erc_url
  secret_manager_id = module.secrets_manager.aws_secret_manager_id
}
