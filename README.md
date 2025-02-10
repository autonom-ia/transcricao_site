# Transcrição IA Website

Este é um site moderno para um serviço de transcrição de áudio usando IA. O site foi desenvolvido usando HTML5, CSS3 e JavaScript.

## Estrutura do Projeto

```
transcricao-site/
├── css/
│   ├── style.css
│   └── auth.css
├── js/
│   ├── main.js
│   └── auth.js
├── images/
│   ├── logo.png
│   ├── google-icon.svg
│   ├── moon.svg
│   └── sun.svg
├── index.html
├── login.html
├── signup.html
└── README.md
```

## Funcionalidades

- Página inicial com design moderno e responsivo
- Sistema de autenticação (login/cadastro)
- Integração com Google OAuth (preparado para implementação)
- Tema escuro/claro
- Design responsivo para todos os dispositivos

## Configuração para AWS

1. Faça upload dos arquivos para um bucket S3
2. Configure o bucket para hospedagem de site estático
3. Configure o CloudFront para distribuição do conteúdo
4. Configure o Route 53 para o domínio personalizado

## Desenvolvimento Local

1. Clone este repositório
2. Abra o arquivo `index.html` em seu navegador
3. Para desenvolvimento, recomenda-se usar um servidor local como Live Server

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript
- Google Fonts (Montserrat)
- AWS (para hospedagem)

## Próximos Passos

1. Implementar autenticação com Google OAuth
2. Configurar backend para processamento de áudio
3. Implementar sistema de pagamentos
4. Adicionar área do usuário
5. Implementar funcionalidade de upload de áudio
