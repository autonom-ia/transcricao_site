// Theme Toggle
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle.querySelector('img');
    
    let isDarkTheme = true;

    themeToggle.addEventListener('click', () => {
        isDarkTheme = !isDarkTheme;
        document.body.classList.toggle('light-theme');
        themeIcon.src = isDarkTheme ? 'images/moon.svg' : 'images/sun.svg';
    });
});
