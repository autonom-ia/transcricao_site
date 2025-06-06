provider "aws" {
  region = "us-east-1"  # ou sua região preferida
}

resource "aws_cognito_user_pool" "transcricao_pool" {
  name = "transcricao-user-pool-v2"

  auto_verified_attributes = ["email"]
  username_attributes     = ["email"]

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject       = "Código de Verificação - Autonom.ia Transcrição IA"
    email_message       = "Seu código de verificação é {####}"
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable            = true
    required           = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    mutable            = true
    required           = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    name                = "phone_number"
    attribute_data_type = "String"
    mutable            = true
    required           = false

    string_attribute_constraints {
      min_length = 1
      max_length = 20
    }
  }

  password_policy {
    minimum_length    = 6
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
    require_uppercase = false
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