/**
 * Generates Order ID: ORDER_YYYYMMDDHHMMSS_USERID_COURSEID
 * Example: ORDER_20251223201530_00123_0045
 */
export function generateOrderId(userId: string, courseId: string): string {
    const now = new Date();

    // Timestamp: YYYYMMDDHHMMSS
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

    // User ID: Last 5 digits, padded
    const userPart = String(userId).slice(-5).padStart(5, '0');

    // Course ID: Last 4 digits, padded
    const coursePart = String(courseId).slice(-4).padStart(4, '0');

    return `ORDER_${timestamp}_${userPart}_${coursePart}`;
}

/**
 * Generates WhatsApp Web link with pre-filled payment notification
 */
export function generateWhatsAppLink(
    studentName: string,
    courseName: string,
    amount: number,
    transactionId: string,
    orderId: string
): string {
    const phoneNumber = process.env.TEACHER_PHONE || '919835019509'; // +91 98350 19509 (no spaces, no +)

    // Format message
    const message = `*New Course Payment Notification* 🎓

📝 *Student Name:* ${studentName}
📚 *Course:* ${courseName}
💰 *Amount Paid:* ₹${amount}
🔢 *Transaction ID:* ${transactionId}
📋 *Order ID:* ${orderId}
📅 *Date & Time:* ${new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
    })}

✅ *Payment proof submitted. Please verify and confirm enrollment.*`;

    // WhatsApp Web/App URL
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return whatsappURL;
}

/**
 * Generates UPI payment URL for QR code
 */
export function generateUPIURL(amount: number, orderId: string, courseName: string): string {
    // UPI payment parameters
    const upiId = process.env.UPI_ID || 'techt98350085@barodampay';
    const payeeName = 'SARTHI Education';

    // Transaction note (Order ID will appear in bank statement)
    const transactionNote = `${courseName.substring(0, 30)} | ${orderId}`;

    // Build UPI deep link
    const upiURL = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

    return upiURL;
}

/**
 * Copy text to clipboard
 */
export function copyToClipboard(text: string, label: string): void {
    navigator.clipboard.writeText(text).then(() => {
        // You can add a toast notification here
        alert(`${label} copied to clipboard!`);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}
