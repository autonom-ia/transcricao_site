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

# Verificar e encerrar qualquer processo usando a porta 8000
echo -e "${YELLOW}Verificando processos na porta 8000...${NC}"

# Verificar se lsof está disponível
if command -v lsof &> /dev/null; then
    # Encontrar PID do processo usando a porta 8000 (funciona em macOS e Linux)
    PORT_PID=$(lsof -ti:8000)
    
    if [ -n "$PORT_PID" ]; then
        echo -e "${YELLOW}Processo encontrado na porta 8000 (PID: $PORT_PID). Encerrando...${NC}"
        kill -9 $PORT_PID
        sleep 1
        # Verificar novamente se o processo foi encerrado
        if lsof -ti:8000 &> /dev/null; then
            echo -e "${RED}Falha ao encerrar o processo. Tente encerrá-lo manualmente.${NC}"
            exit 1
        else
            echo -e "${GREEN}Processo encerrado com sucesso.${NC}"
        fi
    else
        echo -e "${GREEN}Nenhum processo encontrado na porta 8000.${NC}"
    fi
else
    # Alternativa usando netstat se lsof não estiver disponível
    echo -e "${YELLOW}lsof não encontrado, tentando com netstat...${NC}"
    
    if command -v netstat &> /dev/null; then
        if netstat -tuln | grep -q ":8000 "; then
            echo -e "${YELLOW}Porta 8000 está em uso. Tentando encerrar processos...${NC}"
            # Tenta encerrar processos Python que possam estar usando a porta
            pkill -f "python.*http.server 8000" || true
            pkill -f "python3.*http.server 8000" || true
            sleep 1
            
            # Verifica novamente
            if netstat -tuln | grep -q ":8000 "; then
                echo -e "${RED}Porta 8000 ainda está em uso. Tente encerrar o processo manualmente.${NC}"
                exit 1
            else
                echo -e "${GREEN}Processo encerrado com sucesso.${NC}"
            fi
        else
            echo -e "${GREEN}Nenhum processo encontrado na porta 8000.${NC}"
        fi
    else
        echo -e "${YELLOW}Nem lsof nem netstat estão disponíveis. Tentando método alternativo...${NC}"
        # Última tentativa usando pkill
        pkill -f "python.*http.server 8000" || true
        pkill -f "python3.*http.server 8000" || true
        echo -e "${YELLOW}Tentativa de encerramento de processos Python na porta 8000 realizada.${NC}"
    fi
fi

# Iniciar o novo servidor a partir da pasta dist
echo -e "${YELLOW}Iniciando novo servidor...${NC}"

# Verificar qual versão do Python está disponível
if command -v python3 &> /dev/null; then
    cd dist && python3 -m http.server 8000 &
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    cd dist && python -m http.server 8000 &
    PYTHON_CMD="python"
else
    echo -e "${RED}Nenhuma versão do Python encontrada. Não foi possível iniciar o servidor.${NC}"
    exit 1
fi

# Verificar se o servidor foi iniciado corretamente
sleep 2
if command -v curl &> /dev/null; then
    if curl -s http://localhost:8000 > /dev/null; then
        echo -e "${GREEN}Servidor iniciado com sucesso!${NC}"
    else
        echo -e "${RED}Falha ao iniciar o servidor. Verifique se a porta 8000 está realmente livre.${NC}"
        echo -e "${YELLOW}Tentando iniciar novamente...${NC}"
        cd dist && $PYTHON_CMD -m http.server 8000 &
    fi
fi

echo -e "${GREEN}Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}Servidor rodando em http://localhost:8000${NC}"
echo -e "${YELLOW}Para encerrar o servidor, execute: lsof -ti:8000 | xargs kill -9${NC}"
