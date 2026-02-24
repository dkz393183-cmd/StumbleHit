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
    
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.classList.toggle('active');
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
    toggleMobileMenu();
    
    if (user) {
        // Se estiver logado, mostrar perfil
        if (window.location.pathname.includes('login.html')) {
            if (typeof showUserProfile === 'function') {
                showUserProfile();
            }
        } else {
            window.location.href = 'login.html';
        }
    } else {
        // Se não estiver logado, abrir modal de login
        if (window.location.pathname.includes('login.html')) {
            // Já está na página de login, apenas rolar para o topo
            window.scrollTo(0, 0);
        } else {
            // Abrir modal de login se existir
            if (typeof openAuthModal === 'function') {
                openAuthModal();
            } else {
                // Se não tiver modal, ir para página de login
                window.location.href = 'login.html';
            }
        }
    }
}

// Atualizar botão ao carregar a página
window.addEventListener('load', updateMobileLoginButton);
