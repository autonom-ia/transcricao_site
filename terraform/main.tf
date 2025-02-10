provider "aws" {
  region = "us-east-1"  # ou sua região preferida
}

resource "aws_cognito_user_pool" "transcricao_pool" {
  name = "transcricao-user-pool"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required           = true
    mutable            = true
    string_attribute_constraints {
      min_length = 1
      max_length = 100
    }
  }

  schema {
    name                = "phone_number"
    attribute_data_type = "String"
    required           = true
    mutable            = true
    string_attribute_constraints {
      min_length = 10
      max_length = 15
    }
  }

  auto_verified_attributes = ["email"]

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject = "Código de verificação"
    email_message = "Seu código de verificação é {####}"
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name = "transcricao-client"

  user_pool_id = aws_cognito_user_pool.transcricao_pool.id

  generate_secret = false
  
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]
}
