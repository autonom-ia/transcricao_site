// Configuração do Google OAuth
const googleConfig = {
    client_id: 'SEU_CLIENT_ID_AQUI', // Substitua pelo seu Client ID do Google Cloud Console
    callback: handleGoogleResponse
};

// Inicialização do Google Sign-In
function initializeGoogleAuth() {
    google.accounts.id.initialize({
        client_id: googleConfig.client_id,
        callback: googleConfig.callback
    });
}

// Função de callback para resposta do Google
function handleGoogleResponse(response) {
    // Decodifica o token JWT
    const responsePayload = decodeJwtResponse(response.credential);
    
    // Dados do usuário
    const userData = {
        email: responsePayload.email,
        name: responsePayload.name,
        picture: responsePayload.picture
    };

    // Aqui você pode enviar os dados para seu backend
    console.log('Usuário logado:', userData);
    
    // Redireciona para a página inicial com mensagem de sucesso
    alert('Login realizado com sucesso! Em breve entraremos em contato.');
    window.location.href = 'index.html';
}

// Função para decodificar o token JWT
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Função para login com Google
function loginWithGoogle() {
    google.accounts.id.prompt();
}

// Função para signup com Google (mesma função do login)
function signupWithGoogle() {
    loginWithGoogle();
}

// Inicialização da máscara de telefone
function initPhoneMask() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        IMask(phoneInput, {
            mask: '(00) 00000-0000'
        });
    }
}

// Função para validar o formato do telefone
function isValidPhone(phone) {
    const phoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
    return phoneRegex.test(phone);
}

// Form Authentication
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a máscara de telefone
    initPhoneMask();

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const user = await Auth.signIn(email, password);
                console.log('Login successful:', user);
                window.location.href = 'subscription.html';
            } catch (error) {
                console.error('Error signing in:', error);
                if (error.code === 'UserNotConfirmedException') {
                    alert('Por favor, confirme seu email antes de fazer login.');
                    window.location.href = `confirm.html?email=${encodeURIComponent(email)}`;
                } else {
                    alert('Erro ao fazer login: ' + error.message);
                }
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const { user } = await Auth.signUp({
                    username: email,
                    password,
                    attributes: {
                        name,
                        email
                    }
                });
                
                console.log('Signup successful:', user);
                alert('Cadastro realizado com sucesso! Por favor, verifique seu email para confirmar o cadastro.');
                window.location.href = `confirm.html?email=${encodeURIComponent(email)}`;
            } catch (error) {
                console.error('Error signing up:', error);
                alert('Erro ao fazer cadastro: ' + error.message);
            }
        });
    }
});
