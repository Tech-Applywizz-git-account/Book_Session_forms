document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(bookingForm);
            const data = Object.fromEntries(formData.entries());
            const fullMobile = `${data.countryCode} ${data.mobile}`;
            
            // 💾 Save details for the checkout page
            localStorage.setItem('bookingData', JSON.stringify({
                ...data,
                fullMobile
            }));

            // 🚀 Send user to the new Checkout page
            window.location.href = 'checkout.html';
        });
    }
});
