document.addEventListener('DOMContentLoaded', () => {
    // 🔌 Configuration
    const SUPABASE_URL = "https://vmknpibvavubiihffnet.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZta25waWJ2YXZ1YmlpaGZmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDk4NTYsImV4cCI6MjA5MDA4NTg1Nn0.Wi7XM42eZaaT7FvfjjjZcSd0xxGBRv4ZRVvB4-acpkA";
    
    // 🛠️ URLs for your new workflow (Server-side)
    const CREATE_URL = `${SUPABASE_URL}/functions/v1/create-paypal-order`;
    const CAPTURE_URL = `${SUPABASE_URL}/functions/v1/capture-paypal-payment`;

    const bookingData = JSON.parse(localStorage.getItem('bookingData'));
    if (bookingData) {
        document.getElementById('userName').textContent = bookingData.name || 'User';
    } else {
        window.location.href = 'index.html'; // ⚠️ Safety if no data
        return;
    }

    if (window.paypal) {
        paypal.Buttons({
            style: { layout: 'vertical', color: 'gold', shape: 'rect' },

            // 1. Create Server-side Order (Price hardcoded to $34.99 for security)
            createOrder: async () => {
                const res = await fetch(CREATE_URL, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
                    body: JSON.stringify({ amount: "34.99", currency: "USD" })
                });
                const data = await res.json();
                return data.id;
            },

            // 2. Capture Server-side Payment & Setup Account
            onApprove: async (data, actions) => {
                try {
                    const [firstName, ...rest] = bookingData.name.split(' ');
                    const lastName = rest.join(' ') || 'User';

                    const res = await fetch(CAPTURE_URL, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                        },
                        body: JSON.stringify({
                            orderId: data.orderID,
                            email: bookingData.email,
                            firstName: firstName,
                            lastName: lastName,
                            mobile: bookingData.fullMobile
                        })
                    });

                    const result = await res.json();
                    if (result.success) {
                        window.location.href = 'success.html'; // 🎉 Success!
                    } else {
                        throw new Error(result.error || "Internal Server error");
                    }
                } catch (err) {
                    console.error("Capture Failed:", err);
                    alert("Payment received but account setup failed: " + err.message);
                }
            }
        }).render('#paypal-button-container');
    }
});
