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
        
        // Save form data to localStorage for the verification page
        localStorage.setItem('bookingData', JSON.stringify(data));
        
        btn.disabled = true;
        btn.innerHTML = `<span>Saving Details...</span>`;

        try {
            // 📝 LEAD CAPTURE: Save details as 'INITIATED' so we don't lose the email
            await fetch(`${SUPABASE_URL}/rest/v1/payment_details`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    email: data.email,
                    name: data.name,
                    transaction_id: `lead_${Date.now()}`,
                    amount: 1, // $1.00
                    currency: 'USD',
                    status: 'INITIATED'
                })
            });
        } catch (err) {
            console.error("Lead capture error:", err);
        }

        // 💳 OPEN PAYPAL
        window.open(PAYPAL_LINK, '_blank');

        // 🔄 SHOW CONFIRMATION UI
        const card = document.querySelector('.booking-card');
        card.innerHTML = `
            <div class="card-header" style="text-align: center;">
                <div style="width:64px;height:64px;border-radius:50%;background: linear-gradient(135deg, var(--primary-yellow), #f59e0b); display:flex;align-items:center;justify-content:center;margin:0 auto 20px; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </div>
                <h1 style="font-size: 1.8rem; color: var(--primary-blue);">Complete Your Payment</h1>
                <p style="color:var(--text-muted);margin-top:8px;">A PayPal window has opened. Finish the $1.00 payment there.</p>
            </div>

            <div style="background: #f8fafc; border-radius:16px; padding:24px; margin:32px 0; border: 1px solid var(--border-color); text-align: left;">
                <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:6px; text-transform: uppercase; font-weight: 600;">Session for:</p>
                <p style="color:var(--text-main); font-weight:700; font-size:1.2rem;">${data.name}</p>
                <p style="color:var(--text-muted); font-size:0.9rem; margin-top:4px;">${data.email}</p>
            </div>

            <div style="display:flex; flex-direction:column; gap:16px; margin-top:32px;">
                <a href="success.html" id="completedBtn" class="submit-btn" style="text-decoration:none; text-align:center; display:flex; align-items:center; justify-content:center; gap:10px; padding: 18px; font-weight: 600; background: var(--primary-blue);">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>I've Completed Payment</span>
                </a>

                <button onclick="window.open('${PAYPAL_LINK}', '_blank')" style="background:transparent; border:1px solid var(--border-color); color:var(--primary-blue); padding:14px; border-radius:12px; cursor:pointer; font-family:inherit; font-size:0.95rem; font-weight: 500; transition:all 0.3s;">
                    Reopen PayPal Payment Link
                </button>
            </div>

            <p style="font-size:0.75rem; color: var(--text-muted); margin-top:24px; text-align:center; font-style: italic;">
                The next step will verify your payment and show the calendar.
            </p>
        `;
    });
});
