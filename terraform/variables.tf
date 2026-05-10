variable "aws_region" {
  default = "us-east-1"
}

variable "app_name" {
  default = "spendnub-app"
}

variable "environment" {
  default = "dev"
}

variable "instance_type" {
  default = "t3.small"
}

variable "key_name" {
  description = "The name of the SSH key pair created in AWS"
  type        = string
  default     = "shotnub-devops-key" # Ensure this matches the key pair you create in the AWS console
}

variable "allowed_ssh_ip" {
  description = "Your local IP address formatted as a CIDR block (e.g., x.x.x.x/32)"
  type        = string
  # Run `curl ifconfig.me` in your terminal to get your IP, then pass it during apply:
  # terraform apply -var="allowed_ssh_ip=$(curl -s ifconfig.me)/32"
}