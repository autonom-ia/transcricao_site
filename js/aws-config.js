// Configuração do AWS Cognito
const awsConfig = {
    Auth: {
        region: 'us-east-1',
        userPoolId: 'us-east-1_pYWYtZN5J',
        userPoolWebClientId: '3gqumv4civjbbd885mmt0n12te'
    }
};

// Configurar o Amplify
Amplify.configure(awsConfig);
