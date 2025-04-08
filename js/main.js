// Theme Toggle & Domain Check
document.addEventListener('DOMContentLoaded', () => {
    // Verificar o domínio e alternar o logo quando apropriado
    const currentDomain = window.location.hostname;
    const logoImage = document.getElementById('logoImage');
    const currentPath = window.location.pathname;
    
    // Verificar se está na página inicial
    const isHomePage = currentPath === '/' || currentPath === '/index.html';
    
    // Alternar o logo apenas na página inicial
    if (isHomePage && logoImage) {
        if (currentDomain === 'hub2you.autonomia.site' || localStorage.getItem('useHub2YouLogo') === 'true') {
            // Usar o logo combinado Hub2You-Autonomia
            logoImage.src = 'images/hub2you-autonomia-logo.png';
            logoImage.alt = 'Logo Hub2You Autonomia';
        } else {
            // Usar o logo padrão da Autonomia
            logoImage.src = 'images/logo.png';
            logoImage.alt = 'Logo Transcrição IA';
        }
    }
    
    // O botão de alternância de logo foi removido conforme solicitado
    
    // Theme Toggle (código existente)
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('img');
        
        let isDarkTheme = true;

        themeToggle.addEventListener('click', () => {
            isDarkTheme = !isDarkTheme;
            document.body.classList.toggle('light-theme');
            themeIcon.src = isDarkTheme ? 'images/moon.svg' : 'images/sun.svg';
        });
    }
});
