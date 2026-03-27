document.addEventListener('DOMContentLoaded', () => {
    // 🔌 Configuration
    const SUPABASE_URL = "https://vmknpibvavubiihffnet.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZta25waWJ2YXZ1YmlpaGZmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDk4NTYsImV4cCI6MjA5MDA4NTg1Nn0.Wi7XM42eZaaT7FvfjjjZcSd0xxGBRv4ZRVvB4-acpkA";
    const CAPTURE_URL = `${SUPABASE_URL}/functions/v1/capture-razorpay-payment`; // Reusing your existing automation function

    const bookingData = JSON.parse(localStorage.getItem('bookingData'));

    if (bookingData) {
        document.getElementById('userName').textContent = bookingData.name || 'Your Name';
    } else {
        // ⚠️ Safety: Redirect back if no data found
        window.location.href = 'index.html';
        return;
    }

    // 💳 Initialize PayPal Buttons
    if (window.paypal) {
        paypal.Buttons({
            style: {
                layout: 'vertical',
                color:  'gold',
                shape:  'rect',
                label:  'paypal'
            },

            // 🛒 CREATE THE TRANSACTION
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: '1.00' // $1.00 USD
                        },
                        description: 'Consultation Session - Wage Trail'
                    }]
                });
            },

            // ✅ PAYMENT APPROVED
            onApprove: async (data, actions) => {
                try {
                    const order = await actions.order.capture();
                    console.log("PayPal Order Captured:", order);

                    // 🚀 SAVE TO SUPABASE (Stage 2 - Confirmed)
                    const response = await fetch(CAPTURE_URL, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                        },
                        body: JSON.stringify({
                            paymentId: order.id,      // Match Edge Function variable name
                            orderId: `ord_${Date.now()}`,
                            email: bookingData.email,
                            name: bookingData.name,      // Match Edge Function direct variable
                            mobile: bookingData.fullMobile, // Sending mobile for updated Edge Function
                            amount: 100,               // Send as 100 subunits (Edge function divides by 100)
                            currency: 'USD',
                            signature: 'paypal_verified'
                        })
                    });

                    if (response.ok) {
                        window.location.href = 'success.html';
                    } else {
                        const err = await response.json();
                        throw new Error(err.message || "Failed to record payment");
                    }

                } catch (err) {
                    console.error("Payment Capture Failed:", err);
                    alert("Payment successful but storage failed. Please contact support with Order ID: " + data.orderID);
                }
            },

            // ❌ PAYMENT CANCELLED
            onCancel: (data) => {
                console.log("Payment cancelled by user.");
            },

            // ⚠️ ERROR
            onError: (err) => {
                console.error("PayPal SDK Error:", err);
                alert("The PayPal system encountered an error. Please try again or use a different card.");
            }
        }).render('#paypal-button-container');
    } else {
        console.error("PayPal SDK failed to load. Check your Client ID.");
    }
});
