# Implementation Guide: Session Booking Form

This guide outlines the steps to integrate your actual payment link and Microsoft Teams link into the provided form.

## 1. Integrate Your Payment Link
In the `script.js` file, locate the `PAYMENT_LINK` variable:

```javascript
/* script.js: Line 4 */
const PAYMENT_LINK = "PAYMENT_URL_PLACEHOLDER"; // Replace with actual link
```

Replace `"PAYMENT_URL_PLACEHOLDER"` with the actual URL from your payment provider (e.g., Stripe, PayPal, Razorpay).

## 3. Automated Emails (EmailJS)
I have added EmailJS support to send confirmation emails to the user. To make it work, please:

1.  **Sign up** for a free account at [EmailJS.com](https://www.emailjs.com/).
2.  **Add a Service**: Connect your Gmail or Outlook account. Copy the **Service ID**.
3.  **Create a Template**: In the template editor, use these variables in the text:
    *   `{{to_name}}`: User's name
    *   `{{user_email}}`: User's email
    *   `{{session_slot}}`: Time they picked
    *   `{{user_mobile}}`: Their phone number
    *   *Copy the **Template ID**.*
4.  **Get Public Key**: Go to **Account > API Keys** and copy your **Public Key**.
5.  **Update `script.js`**: Replace the placeholders on lines 4 and 35 with your actual IDs.

## 3. Microsoft Teams Meeting Link
In the `success.html` file, update the `href` attribute of the Teams button:

```html
<!-- success.html: Line 38 -->
<a href="https://teams.microsoft.com/l/meetup-join/..." target="_blank" class="teams-btn">
    Join Microsoft Teams
</a>
</a>
```

Replace the `href` value with your actual Microsoft Teams meeting invitation link.

## 5. Razorpay Test Mode Card Details
While testing in **Test Mode**, you can use these card details:

| Field | Value |
| --- | --- |
| **Card Number** | `4111 1111 1111 1111` |
| **Expiry Date** | Any future date (e.g., `12/30`) |
| **CVV** | `123` |
| **Name on Card** | `TEST USER` |

> [!NOTE]
> For OTP, you can enter any 6 digits (e.g., `123456`) or use the "Success" button on the Razorpay screen.

## 6. Hosting Your Files
To make this work online, you will need to host these files (`index.html`, `styles.css`, `script.js`, `success.html`) on a web server or a hosting service like GitHub Pages, Vercel, Netlify, or AWS.
