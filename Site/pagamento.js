const pixKey = "00020101021126330014br.gov.bcb.pix0111557611058705204000053039865802BR5917BRUNO R A CORREIA6009SAO PAULO62070503***6304E7C4";

function generateQRCode() {
    const qrcodeContainer = document.getElementById('qrcodeImage');
    qrcodeContainer.innerHTML = '';
    
    // Usando API do QR Server para gerar QR Code
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixKey)}`;
    
    const img = document.createElement('img');
    img.src = qrCodeURL;
    img.alt = 'QR Code PIX';
    img.style.maxWidth = '300px';
    img.style.width = '100%';
    img.style.border = '3px solid #000';
    img.style.borderRadius = '10px';
    
    qrcodeContainer.appendChild(img);
}

function openPaymentModal(itemName, itemPrice) {
    const modal = document.getElementById('paymentModal');
    document.getElementById('modalItemName').textContent = itemName;
    document.getElementById('modalItemPrice').textContent = itemPrice;
    modal.style.display = 'flex';
    
    // Reset para mostrar opções de pagamento
    document.getElementById('paymentOptions').style.display = 'block';
    document.getElementById('pixDetails').style.display = 'none';
    
    // Gerar QR Code
    generateQRCode();
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function selectPix() {
    document.getElementById('paymentOptions').style.display = 'none';
    document.getElementById('pixDetails').style.display = 'block';
}

function showQRCode() {
    document.getElementById('qrcodeSection').style.display = 'block';
    document.getElementById('pixKeySection').style.display = 'none';
}

function showPixKey() {
    document.getElementById('qrcodeSection').style.display = 'none';
    document.getElementById('pixKeySection').style.display = 'block';
}

function copyPixKey() {
    const pixKeyText = document.getElementById('pixKeyText').textContent;
    navigator.clipboard.writeText(pixKeyText).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '✓ Copiado!';
        btn.style.background = '#00FF00';
        setTimeout(() => {
            btn.textContent = '📋 Copiar Chave';
            btn.style.background = 'linear-gradient(180deg, #FFE600, #FF9500)';
        }, 2000);
    });
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('paymentModal');
    if (event.target === modal) {
        closePaymentModal();
    }
}
