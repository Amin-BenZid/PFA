variable "aws_region"       { default = "eu-north-1" }
variable "project_name"     { default = "apple-doctor" }
variable "instance_type"    { default = "t3.micro" }
variable "s3_images_bucket" { default = "apple-disease-uploads" }

variable "ec2_key_name" {
  description = "Name of your EC2 Key Pair (create in AWS Console → EC2 → Key Pairs)"
  type        = string
}

variable "mongodb_uri" {
  description = "MongoDB Atlas URI"
  type        = string
  sensitive   = true
}