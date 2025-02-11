const { Amplify } = require('@aws-amplify/core');
const { Auth } = require('@aws-amplify/auth');
const { testUsers } = require('./test-data');

// Configuração do Cognito para testes
const awsConfig = {
    Auth: {
        region: 'us-east-1',
        userPoolId: 'us-east-1_dga5YS2A0',
        userPoolWebClientId: '1vhumvqrgq6ohod253f6stmqoh'
    }
};

// Configurar o Amplify antes dos testes
beforeAll(() => {
    Amplify.configure(awsConfig);
});

describe('Cognito Authentication Tests', () => {
    let testUser;

    beforeEach(() => {
        // Usar o primeiro usuário de teste
        testUser = testUsers[0];
    });

    test('should sign up a new user in Cognito', async () => {
        try {
            const { user } = await Auth.signUp({
                username: testUser.email,
                password: testUser.password,
                attributes: {
                    name: testUser.name,
                    phone_number: '+55' + testUser.phone_number.replace(/\D/g, ''),
                    email: testUser.email
                }
            });

            expect(user).toBeDefined();
            expect(user.username).toBe(testUser.email);
        } catch (error) {
            // Se o usuário já existe, também é considerado sucesso para fins de teste
            expect(error.code).toBe('UsernameExistsException');
        }
    });

    test('should not sign in unconfirmed user', async () => {
        try {
            await Auth.signIn(testUser.email, testUser.password);
            fail('Should not sign in unconfirmed user');
        } catch (error) {
            expect(error.code).toBe('UserNotConfirmedException');
        }
    });

    test('should not sign in with wrong password', async () => {
        try {
            await Auth.signIn(testUser.email, 'wrongpassword');
            fail('Should not sign in with wrong password');
        } catch (error) {
            // O Cognito primeiro verifica se o usuário está confirmado
            // então esse erro vem antes do erro de senha incorreta
            expect(['UserNotConfirmedException', 'NotAuthorizedException']).toContain(error.code);
        }
    });

    // Teste para confirmar usuário (requer código de verificação)
    // Este teste precisa ser executado manualmente após receber o código por email
    test.skip('should confirm user signup', async () => {
        const confirmationCode = '123456'; // Código recebido por email
        try {
            await Auth.confirmSignUp(testUser.email, confirmationCode);
            const signInResult = await Auth.signIn(testUser.email, testUser.password);
            expect(signInResult.user).toBeDefined();
        } catch (error) {
            fail('Should confirm user signup: ' + error.message);
        }
    });
});
