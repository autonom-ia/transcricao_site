#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando deploy da aplicação...${NC}"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js não encontrado. Por favor, instale o Node.js${NC}"
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm não encontrado. Por favor, instale o npm${NC}"
    exit 1
fi

# Instalar dependências
echo -e "${YELLOW}Instalando dependências...${NC}"
npm install gulp gulp-htmlmin gulp-uglify gulp-clean-css gulp-concat del gulp-replace gulp-imagemin --save-dev

# Executar build
echo -e "${YELLOW}Executando build...${NC}"
if ! npx gulp build; then
    echo -e "${RED}Erro durante o build. Abortando deploy.${NC}"
    exit 1
fi

# Verificar se a pasta dist foi criada
if [ ! -d "dist" ]; then
    echo -e "${RED}Pasta dist não foi criada. Erro no build.${NC}"
    exit 1
fi

# Parar o servidor atual se estiver rodando
echo -e "${YELLOW}Parando servidor atual...${NC}"
pkill -f "python3 -m http.server 8000" || true

# Iniciar o novo servidor a partir da pasta dist
echo -e "${YELLOW}Iniciando novo servidor...${NC}"
cd dist && python3 -m http.server 8000 &

echo -e "${GREEN}Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}Servidor rodando em http://localhost:8000${NC}"
