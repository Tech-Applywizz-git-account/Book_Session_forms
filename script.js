document.addEventListener('DOMContentLoaded', () => {
    // 🔌 Configuration — LIVE KEYS
    const RAZORPAY_KEY = "rzp_live_SCjkNy569aq6F2"; 
    const SUPABASE_URL = "https://vmknpibvavubiihffnet.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZta25waWJ2YXZ1YmlpaGZmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDk4NTYsImV4cCI6MjA5MDA4NTg1Nn0.Wi7XM42eZaaT7FvfjjjZcSd0xxGBRv4ZRVvB4-acpkA";
    
    const CREATE_ORDER_URL = `${SUPABASE_URL}/functions/v1/smooth-function`;
    const CAPTURE_PAYMENT_URL = `${SUPABASE_URL}/functions/v1/capture-razorpay-payment`;
    
    const bookingForm = document.getElementById('bookingForm');
    
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData.entries());
        
        const btn = document.getElementById('bookBtn');
        btn.disabled = true;
        btn.innerHTML = `<span>Creating Order...</span>`;

        try {
            // 📞 Step 1: Create Order via Edge Function
            const orderResponse = await fetch(CREATE_ORDER_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ 
                    amount: "1.00",     // ₹1.00 (100 paise)
                    currency: "INR"
                })
            });

            const orderData = await orderResponse.json();
            console.log("Order created:", orderData);

            if (orderData.error) {
                throw new Error(orderData.error);
            }

            if (!orderData.id) {
                throw new Error("No order ID received from server");
            }

            // 💳 Step 2: Open Razorpay Checkout
            const options = {
                key: RAZORPAY_KEY,
                order_id: orderData.id,
                name: "Elite Coaching",
                description: "Session Fee",
                handler: async function (response) {
                    console.log("Payment success:", response);
                    btn.innerHTML = `<span>Recording Payment...</span>`;

                    try {
                        await fetch(CAPTURE_PAYMENT_URL, {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'apikey': SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                            },
                            body: JSON.stringify({
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                signature: response.razorpay_signature,
                                email: data.email,
                                name: data.name,
                                amount: orderData.amount,
                                currency: orderData.currency
                            })
                        });
                    } catch (captureErr) {
                        console.error("Capture error (non-blocking):", captureErr);
                    }

                    window.location.href = 'success.html';
                },
                prefill: {
                    name: data.name,
                    email: data.email,
                    contact: data.mobile || ''
                },
                notes: {
                    booking_type: "session",
                    customer_name: data.name
                },
                theme: { color: "#3B82F6" },
                modal: {
                    ondismiss: function() {
                        btn.disabled = false;
                        btn.innerHTML = `<span>Book Session</span>`;
                    }
                }
            };

            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Payment failed:", response.error);
                alert("Payment failed: " + response.error.description);
                btn.disabled = false;
                btn.innerHTML = `<span>Book Session</span>`;
            });
            rzp.open();

        } catch (error) {
            console.error("Payment flow error:", error);
            alert("Error: " + error.message);
            btn.disabled = false;
            btn.innerHTML = `<span>Book Session</span>`;
        }
    });
});
