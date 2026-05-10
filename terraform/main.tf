terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.5.0"
}

provider "aws" {
  region = var.aws_region
}

# Networking (VPC, IGW, Subnet, Routing)
resource "aws_vpc" "shotnub_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.app_name}-vpc"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "shotnub_igw" {
  vpc_id = aws_vpc.shotnub_vpc.id

  tags = {
    Name = "${var.app_name}-igw"
  }
}

resource "aws_subnet" "shotnub_public_subnet" {
  vpc_id                  = aws_vpc.shotnub_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"

  tags = {
    Name = "${var.app_name}-public-subnet"
  }
}

resource "aws_route_table" "shotnub_public_rt" {
  vpc_id = aws_vpc.shotnub_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.shotnub_igw.id
  }

  tags = {
    Name = "${var.app_name}-public-rt"
  }
}

resource "aws_route_table_association" "shotnub_rta" {
  subnet_id      = aws_subnet.shotnub_public_subnet.id
  route_table_id = aws_route_table.shotnub_public_rt.id
}


# Security Group
resource "aws_security_group" "shotnub_sg" {
  name        = "${var.app_name}-sg"
  description = "Allow SSH, Jenkins, and App traffic"
  vpc_id      = aws_vpc.shotnub_vpc.id

  # SSH - Restricted to your IP
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_ip]
  }

  # Jenkins Web UI
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Frontend Application
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend Application
  ingress {
    from_port   = 2200
    to_port     = 2200
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # Outbound Rules
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-sg"
  }
}

# IAM & CloudWatch Logging
resource "aws_iam_role" "ec2_cloudwatch_role" {
  name = "${var.app_name}-cloudwatch-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cloudwatch_attach" {
  role       = aws_iam_role.ec2_cloudwatch_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.app_name}-profile"
  role = aws_iam_role.ec2_cloudwatch_role.name
}

resource "aws_cloudwatch_log_group" "backend_logs" {
  name              = "/spendnub-watch/backend"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "frontend_logs" {
  name              = "/spendnub-watch/frontend"
  retention_in_days = 7
}

# EC2 Compute (Jenkins & App Host)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical's official AWS account ID

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "shotnub_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.shotnub_public_subnet.id
  vpc_security_group_ids = [aws_security_group.shotnub_sg.id]
  key_name               = var.key_name

  # Attach the IAM profile
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  # Increase the hard drive size and use gp3 for better performance and cost-efficiency
  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = file("install.sh")

  tags = {
    Name        = "${var.app_name}-server"
    Environment = var.environment
  }
}