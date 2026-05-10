terraform {
  backend "s3" {
    bucket = "shotnub-terraform-state-bucket"
    key    = "shotnub-app/terraform.tfstate"
    region = "us-east-1"
  }
}