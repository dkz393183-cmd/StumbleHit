function closeCookieBanner() {
    document.getElementById('cookieBanner').style.display = 'none';
}

function acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    closeCookieBanner();
}

function cookieSettings() {
    alert('Configurações de cookies - Aqui você pode personalizar suas preferências');
}

window.onload = function() {
    if (localStorage.getItem('cookiesAccepted')) {
        closeCookieBanner();
    }
}

// Menu Mobile
function toggleMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const hamburger = document.querySelector('.hamburger-menu');
    
    if (menu && overlay && hamburger) {
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        hamburger.classList.toggle('active');
    }
}

// Atualizar botão de login no menu mobile
function updateMobileLoginButton() {
    const user = localStorage.getItem('stumbleUser');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    
    if (mobileLoginBtn) {
        if (user) {
            mobileLoginBtn.textContent = 'PERFIL';
        } else {
            mobileLoginBtn.textContent = 'FAZER LOGIN';
        }
    }
}

// Lidar com clique no botão de login/perfil do menu mobile
function handleMobileLogin() {
    const user = localStorage.getItem('stumbleUser');
    
    // Fechar menu mobile
    const menu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const hamburger = document.querySelector('.hamburger-menu');
    
    if (menu && overlay && hamburger) {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        hamburger.classList.remove('active');
    }
    
    // Pequeno delay para a animação de fechamento
    setTimeout(() => {
        if (user) {
            // Se estiver logado, ir para página de login que mostra o perfil
            window.location.href = 'login.html';
        } else {
            // Se não estiver logado, ir para página de login
            window.location.href = 'login.html';
        }
    }, 300);
}

// Atualizar botão ao carregar a página
if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
        updateMobileLoginButton();
    });
}
