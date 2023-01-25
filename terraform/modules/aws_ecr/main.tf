resource "aws_ecr_repository" "valicit_backend" {
  name = "valicit_backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
