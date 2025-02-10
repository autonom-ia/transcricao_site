#!/bin/bash

# Encontrar e matar o processo que está usando a porta 8000
PID=$(lsof -ti:8000)
if [ ! -z "$PID" ]; then
    echo "Matando processo existente na porta 8000 (PID: $PID)"
    kill -9 $PID
fi

# Aguardar um momento para garantir que a porta foi liberada
sleep 1

# Iniciar o servidor novamente
echo "Iniciando servidor na porta 8000"
python3 -m http.server 8000
