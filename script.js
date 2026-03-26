document.addEventListener('DOMContentLoaded', () => {
    // 📧 1. Initialize EmailJS with your Public Key
    // signup at emailjs.com to get this
    // The email will NOT send until you replace these placeholders with real keys
    const PUBLIC_KEY = "YOUR_PUBLIC_KEY"; 
    const SERVICE_ID = "YOUR_SERVICE_ID";
    const TEMPLATE_ID = "YOUR_TEMPLATE_ID";

    if (typeof emailjs !== 'undefined' && PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
        emailjs.init(PUBLIC_KEY);
    } else if (typeof emailjs === 'undefined') {
        console.error("EmailJS library failed to load. Check your internet connection or script tag.");
    }

    const bookingForm = document.getElementById('bookingForm');
    
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData.entries());
        
        // Save to local storage for the success page
        localStorage.setItem('bookingData', JSON.stringify(data));
        
        // Add loading state to button
        const btn = document.getElementById('bookBtn');
        btn.disabled = true;
        btn.innerHTML = `<span>Scheduling...</span>`;

        const finalizeBooking = () => {
            setTimeout(() => {
                window.location.href = 'success.html';
            }, 800);
        };

        // 📧 2. Send the Booking Email if EmailJS is configured
        if (typeof emailjs !== 'undefined' && 
            PUBLIC_KEY !== "YOUR_PUBLIC_KEY" &&
            SERVICE_ID !== "YOUR_SERVICE_ID" && 
            TEMPLATE_ID !== "YOUR_TEMPLATE_ID") {

            const emailParams = {
                from_name: "Elite Coaching",
                to_name: data.name,
                user_email: data.email,
                user_mobile: data.mobile,
                reply_to: data.email
            };

            emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams)
                .then(() => {
                    console.log("Email sent successfully!");
                    finalizeBooking();
                }, (error) => {
                    console.error("Email failed to send. Error:", error);
                    finalizeBooking();
                });
        } else {
            const reason = (typeof emailjs === 'undefined') ? "Library missing" : "Keys are placeholders";
            console.warn(`Email not sent: ${reason}. Please configure PUBLIC_KEY, SERVICE_ID, and TEMPLATE_ID in script.js.`);
            finalizeBooking();
        }
    });
});
