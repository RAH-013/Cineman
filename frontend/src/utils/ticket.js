export const formatDateTime = (dateString) => {
    if (!dateString) return { date: '', time: '' };
    const d = new Date(dateString.replace(' ', 'T'));
    const date = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
};

export const isNewlyPurchased = (purchasedAt, currentTime) => {
    if (!purchasedAt) return false;
    const purchaseDate = new Date(purchasedAt.replace(' ', 'T'));
    const diffInMinutes = (currentTime - purchaseDate) / (1000 * 60);
    return diffInMinutes < 2;
};