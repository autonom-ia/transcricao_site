output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.transcricao_pool.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.client.id
}

output "cognito_pool_arn" {
  value = aws_cognito_user_pool.transcricao_pool.arn
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.website_distribution.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.website_distribution.domain_name
}

output "website_bucket_name" {
  value = aws_s3_bucket.website_bucket.id
}
