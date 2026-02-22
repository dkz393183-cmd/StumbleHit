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
