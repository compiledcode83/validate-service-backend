resource "aws_ecr_repository" "api_gateway" {
  name = "api_gateway"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
