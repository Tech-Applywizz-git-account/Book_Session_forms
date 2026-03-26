document.addEventListener('DOMContentLoaded', () => {
    // 🔌 Configuration
    const PAYPAL_LINK = "https://www.paypal.com/ncp/payment/3JZQPA5MTTVB4";
    const SUPABASE_URL = "https://vmknpibvavubiihffnet.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZta25waWJ2YXZ1YmlpaGZmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDk4NTYsImV4cCI6MjA5MDA4NTg1Nn0.Wi7XM42eZaaT7FvfjjjZcSd0xxGBRv4ZRVvB4-acpkA";
    
    const bookingForm = document.getElementById('bookingForm');
    const btn = document.getElementById('bookBtn');
    
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData.entries());
        
        // Save form data to localStorage for the success page
        localStorage.setItem('bookingData', JSON.stringify(data));
        
        btn.disabled = true;
        btn.innerHTML = `<span>Opening PayPal...</span>`;

        try {
            // 📝 Step 1: Record user details in Supabase
            await fetch(`${SUPABASE_URL}/functions/v1/capture-razorpay-payment`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    paymentId: `paypal_${Date.now()}`,
                    orderId: `order_${Date.now()}`,
                    signature: 'paypal_payment',
                    email: data.email,
                    name: data.name,
                    amount: 100,
                    currency: 'USD'
                })
            });
        } catch (err) {
            console.error("Details save error (non-blocking):", err);
        }

        // 💳 Step 2: Open PayPal payment in a new tab
        window.open(PAYPAL_LINK, '_blank');

        // 🔄 Step 3: Show confirmation UI on current page
        const card = document.querySelector('.booking-card');
        card.innerHTML = `
            <div class="card-header">
                <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#f59e0b);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </div>
                <h1>Complete Your Payment</h1>
                <p style="color:#94a3b8;margin-top:8px;">A PayPal window has opened. Please complete the payment there.</p>
            </div>

            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin:24px 0;border:1px solid rgba(255,255,255,0.1);">
                <p style="color:#94a3b8;font-size:0.85rem;margin-bottom:4px;">Booking for:</p>
                <p style="color:#fff;font-weight:600;font-size:1.1rem;">${data.name}</p>
                <p style="color:#94a3b8;font-size:0.85rem;margin-top:8px;">${data.email}</p>
            </div>

            <div style="display:flex;flex-direction:column;gap:12px;margin-top:24px;">
                <a href="success.html" class="submit-btn" style="text-decoration:none;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>I've Completed Payment</span>
                </a>

                <button onclick="window.open('${PAYPAL_LINK}', '_blank')" style="background:transparent;border:1px solid rgba(255,255,255,0.2);color:#94a3b8;padding:12px 24px;border-radius:12px;cursor:pointer;font-family:inherit;font-size:0.9rem;">
                    Reopen PayPal Window
                </button>
            </div>

            <p style="font-size:0.75rem;color:#64748b;margin-top:16px;text-align:center;">
                Only click "I've Completed Payment" after you finish paying on PayPal.
            </p>
        `;
    });
});
