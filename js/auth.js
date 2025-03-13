console.log('auth.js loaded');

// Função para decodificar o token JWT
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Função para validar o formato do telefone
function isValidPhone(phone) {
    const phoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
    return phoneRegex.test(phone);
}

// Esperar o Amplify ser carregado
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('DOMContentLoaded');
        console.log('aws_amplify:', window.aws_amplify);

        // Configurar o Amplify
        const { Amplify, Auth } = window.aws_amplify;
        console.log('Amplify:', Amplify);
        console.log('Auth:', Auth);

        Amplify.configure(window.awsConfig);
        console.log('Amplify configured');

        // Expor Auth globalmente
        window.Auth = Auth;
        console.log('Auth exposed globally');

        // Procurar formulário de login
        console.log('Looking for login form...');
        const loginForm = document.getElementById('loginForm');
        console.log('loginForm:', loginForm);

        if (loginForm) {
            console.log('Login form found');
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                console.log('Login form submitted');

                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                console.log('Attempting login with:', email);
                
                try {
                    // Fazer login usando Cognito
                    console.log('Attempting Cognito login...');
                    const authData = new AmazonCognitoIdentity.AuthenticationDetails({
                        Username: email,
                        Password: password
                    });
                    
                    const userData = {
                        Username: email,
                        Pool: userPool
                    };
                    
                    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
                    
                    const user = await new Promise((resolve, reject) => {
                        cognitoUser.authenticateUser(authData, {
                            onSuccess: (session) => {
                                cognitoUser.getUserAttributes((err, attributes) => {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }
                                    const attrs = {};
                                    attributes.forEach(attr => {
                                        attrs[attr.Name] = attr.Value;
                                    });
                                    resolve({ attributes: attrs });
                                });
                            },
                            onFailure: (err) => {
                                reject(err);
                            }
                        });
                    });
                    console.log('Login successful:', user);
                    
                    // Obter atributos do usuário
                    const { email: userEmail, name, phone_number } = user.attributes;
                    console.log('Atributos do usuário:', { userEmail, name, phone_number });

                    // Se tiver número de telefone, verificar instância
                    if (phone_number) {
                        try {
                            // Formatar número removendo '+' e qualquer outro caractere não numérico
                            const formattedPhone = phone_number.replace(/^\+/, '').replace(/\D/g, '');
                            console.log('Número formatado:', formattedPhone);

                            console.log('Chamando API para verificar instância...');
                            const response = await fetch('https://n8n.autonomia.site/webhook/transcricao_site', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    messageType: 'checkingInstante',
                                    phoneNumber: formattedPhone
                                })
                            });

                            console.log('Resposta da API:', response.status);
                            const data = await response.json();
                            console.log('Dados da resposta:', data);
                            
                            if (response.status === 200 && data.message === 'createInstance') {
                                console.log('Redirecionando para conexão WhatsApp...');
                                window.location.href = '/whatsapp-connect.html?hidePayment=true';
                                return;
                            }
                        } catch (error) {
                            console.error('Erro ao verificar instância:', error);
                        }
                    } else {
                        console.log('Usuário não tem número de telefone cadastrado');
                    }

                    // Se não tiver telefone ou a verificação falhar, redirecionar para a página de planos
                    window.location.href = '/subscription.html';
                } catch (error) {
                    console.error('Login error:', error);
                    if (error.code === 'UserNotConfirmedException') {
                        alert('Por favor, confirme seu email antes de fazer login.');
                        window.location.href = `/confirm.html?email=${encodeURIComponent(email)}`;
                    } else {
                        alert('Erro ao fazer login: ' + error.message);
                    }
                }
            });
        } else {
            console.log('Login form not found');
        }

        // Inicializar máscara de telefone se estiver na página de signup
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            IMask(phoneInput, {
                mask: '(00) 00000-0000'
            });
        }
    } catch (error) {
        console.error('Erro durante inicialização:', error);
    }
});
