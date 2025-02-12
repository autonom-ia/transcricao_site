#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se o AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI não encontrado. Por favor, instale o AWS CLI${NC}"
    exit 1
fi

# Verificar se o Terraform está instalado
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Terraform não encontrado. Por favor, instale o Terraform${NC}"
    exit 1
fi

echo -e "${YELLOW}Iniciando deploy da aplicação...${NC}"

# Build da aplicação
echo -e "${YELLOW}Executando build da aplicação...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro durante o build. Abortando deploy.${NC}"
    exit 1
fi

# Entrar no diretório do Terraform
cd terraform

# Inicializar o Terraform
echo -e "${YELLOW}Inicializando Terraform...${NC}"
terraform init

# Aplicar as configurações do Terraform
echo -e "${YELLOW}Aplicando configurações do Terraform...${NC}"
terraform apply -auto-approve

# Capturar outputs do Terraform
BUCKET_NAME=$(terraform output -raw website_bucket_name)
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)

# Aguardar a criação/atualização da distribuição CloudFront
echo -e "${YELLOW}Aguardando a distribuição CloudFront ser implantada...${NC}"
aws cloudfront wait distribution-deployed --id $DISTRIBUTION_ID
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Aviso: Tempo de espera excedido para a distribuição CloudFront.${NC}"
    echo -e "${YELLOW}O deploy continuará, mas pode levar alguns minutos para as alterações se propagarem.${NC}"
fi

# Fazer upload dos arquivos para o S3
echo -e "${YELLOW}Fazendo upload dos arquivos para o S3...${NC}"
cd ../dist
aws s3 sync . s3://$BUCKET_NAME --delete

# Invalidar cache do CloudFront
echo -e "${YELLOW}Invalidando cache do CloudFront...${NC}"
aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"

echo -e "${GREEN}Deploy concluído com sucesso!${NC}"

# Mostrar URL do CloudFront
cd ../terraform
CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain_name)
echo -e "${GREEN}Seu site está disponível em: https://$CLOUDFRONT_DOMAIN${NC}"
echo -e "${YELLOW}Nota: Pode levar alguns minutos para as alterações se propagarem pelo CloudFront.${NC}"

# Mostrar outros dados importantes
echo -e "\n${YELLOW}Informações importantes:${NC}"
echo -e "Bucket S3: ${GREEN}$BUCKET_NAME${NC}"
echo -e "CloudFront Distribution ID: ${GREEN}$DISTRIBUTION_ID${NC}"
echo -e "CloudFront Domain: ${GREEN}$CLOUDFRONT_DOMAIN${NC}"
