// Cookies - Salvar no Firebase quando aceitar
async function acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    
    // Salvar no Firebase se estiver disponível
    if (window.firebaseDB) {
        const user = localStorage.getItem('stumbleUser');
        if (user) {
            const userData = JSON.parse(user);
            const cookiesRef = window.firebaseRef(window.firebaseDB, 'cookies');
            await window.firebasePush(cookiesRef, {
                userEmail: userData.email,
                userName: userData.displayName,
                acceptedAt: Date.now()
            });
        }
    }
}

window.onload = function() {
    // Cookies já foram removidos da interface
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


// Registrar acesso ao site
async function registerPageView() {
    // Aguardar Firebase carregar
    await new Promise(resolve => {
        const checkFirebase = setInterval(() => {
            if (window.firebaseDB) {
                clearInterval(checkFirebase);
                resolve();
            }
        }, 100);
        
        // Timeout após 5 segundos
        setTimeout(() => {
            clearInterval(checkFirebase);
            resolve();
        }, 5000);
    });
    
    if (!window.firebaseDB) return;
    
    // Registrar acesso
    const viewsRef = window.firebaseRef(window.firebaseDB, 'pageViews');
    await window.firebasePush(viewsRef, {
        page: window.location.pathname,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
    });
}

// Registrar acesso ao carregar a página
if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
        registerPageView();
    });
}
