function openPaymentModal(itemName, itemPrice) {
    const modal = document.getElementById('paymentModal');
    document.getElementById('modalItemName').textContent = itemName;
    document.getElementById('modalItemPrice').textContent = itemPrice;
    modal.style.display = 'flex';
    
    // Mostrar diretamente a tela de conclusão
    document.getElementById('paymentOptions').style.display = 'none';
    document.getElementById('pixDetails').style.display = 'none';
    document.getElementById('purchaseComplete').style.display = 'block';
    
    // Registrar tentativa de pagamento
    logPaymentAttempt(itemName, itemPrice);
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('paymentModal');
    if (event.target === modal) {
        closePaymentModal();
    }
}

// Registrar tentativa de pagamento no Firebase
async function logPaymentAttempt(itemName, itemPrice) {
    const user = JSON.parse(localStorage.getItem('stumbleUser'));
    
    if (!user) return;
    
    const newPayment = {
        userName: user.displayName,
        userEmail: user.email,
        itemName: itemName,
        itemPrice: itemPrice,
        timestamp: Date.now(),
        status: 'pending'
    };
    
    // Salvar no Firebase
    if (window.firebaseDB) {
        const paymentsRef = window.firebaseRef(window.firebaseDB, 'payments');
        await window.firebasePush(paymentsRef, newPayment);
    }
}
