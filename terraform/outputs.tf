output "jenkins_url" {
  value       = "http://${aws_instance.shotnub_server.public_ip}:8080"
  description = "The URL to access the Jenkins web interface"
}

output "frontend_application_url" {
  value       = "http://${aws_instance.shotnub_server.public_ip}:3000"
  description = "The URL to access the NestJS application"
}

output "backend_application_url" {
  value       = "http://${aws_instance.shotnub_server.public_ip}:2200/api"
  description = "The URL to access the NestJS application"
}

output "server_public_ip" {
  value       = aws_instance.shotnub_server.public_ip
  description = "The public IP of the EC2 instance for SSH access"
}