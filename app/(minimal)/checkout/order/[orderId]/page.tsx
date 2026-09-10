'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Copy, Check, Upload, ArrowRight, AlertCircle, CheckCircle2, QrCode } from 'lucide-react';
import Image from 'next/image';

interface PendingOrder {
    orderId: string;
    studentEmail: string;
    studentName: string;
    courseId: string;
    courseName: string;
    amount: number;
    timestamp: number;
    status: 'awaiting_payment' | 'proof_uploaded' | 'verified' | 'rejected';
}

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.orderId as string | undefined;

    const [order, setOrder] = useState<PendingOrder | null>(null);
    const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string>('');
    const [transactionId, setTransactionId] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    useEffect(() => {
        if (!orderId) return;

        const orderData = storage.get<PendingOrder>(`order:${orderId}`, true);
        if (orderData) {
            setOrder(orderData);
        } else {
            // Order not found
            setTimeout(() => router.push('/dashboard'), 3000);
        }
    }, [orderId, router]);

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied({ ...copied, [key]: true });
        setTimeout(() => setCopied({ ...copied, [key]: false }), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            setScreenshot(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitProof = async () => {
        if (!screenshot || !transactionId.trim() || !order) {
            alert('Please upload screenshot and enter transaction ID');
            return;
        }

        setUploading(true);

        try {
            // Store screenshot as base64 in storage (in production, upload to cloud storage)
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Screenshot = reader.result as string;

                // Create enrollment with pending status
                const enrollmentId = `enrollment:${order.studentEmail}:${order.courseId}`;
                const enrollment = {
                    enrollmentId,
                    userId: order.studentEmail,
                    courseId: order.courseId,
                    paymentId: orderId,
                    amountPaid: order.amount,
                    paymentDate: Date.now(),
                    paymentStatus: 'pending',
                    status: 'active',
                    enrolledDate: Date.now(),
                    progress: 0,
                    completedLessons: [],
                    videosWatched: 0,
                    totalVideos: 0,
                    quizzesPassed: 0,
                    totalQuizzes: 0,
                    lastAccessedDate: Date.now(),
                    timeSpentMinutes: 0,
                    certificateIssued: false,
                    paymentProof: {
                        screenshot: base64Screenshot,
                        transactionId: transactionId,
                        uploadedAt: Date.now()
                    }
                };

                storage.set(enrollmentId, enrollment, true);

                // Update order status
                const updatedOrder = {
                    ...order,
                    status: 'proof_uploaded' as const,
                    transactionId,
                    screenshotUrl: base64Screenshot,
                    proofUploadedAt: Date.now()
                };
                storage.set(`order:${orderId}`, updatedOrder, true);

                setUploadSuccess(true);
                setUploading(false);

                // Redirect after 3 seconds
                setTimeout(() => {
                    router.push('/dashboard?payment=pending');
                }, 3000);
            };
            reader.readAsDataURL(screenshot);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload proof. Please try again.');
            setUploading(false);
        }
    };

    if (!order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (uploadSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-3">Payment Proof Submitted!</h1>
                    <p className="text-gray-600 mb-6">
                        Your payment is being verified by our team. You&apos;ll receive a confirmation within 24 hours.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <strong>Order ID:</strong> {orderId}
                        </p>
                        <p className="text-sm text-blue-800 mt-1">
                            <strong>Transaction ID:</strong> {transactionId}
                        </p>
                    </div>
                    <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    const upiLink = `upi://pay?pa=techt98350085@barodampay&pn=SARTHI&am=${order.amount}&cu=INR&tn=Order-${orderId}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Complete Your Payment</h1>
                    <p className="text-gray-600">Follow the steps below to enroll in your course</p>
                </div>

                {/* Course Info Card */}
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border-2 border-brand-orange">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Course</p>
                            <h2 className="text-xl font-bold text-gray-900">{order.courseName}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Amount to Pay</p>
                            <p className="text-3xl font-extrabold text-brand-orange">₹{order.amount.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Your Order ID</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-gray-100 px-4 py-2 rounded-lg font-mono text-lg font-bold text-gray-800">
                                {orderId}
                            </code>
                            <button
                                onClick={() => copyToClipboard(orderId || '', 'orderId')}
                                className="p-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                {copied.orderId ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <QrCode className="w-7 h-7 text-brand-orange" />
                        Pay Using Any UPI App
                    </h3>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* QR Code Section */}
                        <div className="text-center">
                            <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 inline-block mb-4">
                                <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                                    {/* QR Code would be generated here - using placeholder */}
                                    <div className="text-center">
                                        <QrCode className="w-32 h-32 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Scan to Pay</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Scan with Google Pay, PhonePe, Paytm, or any UPI app</p>
                        </div>

                        {/* Manual Details Section */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4">Or Pay Manually:</h4>
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-1">UPI ID</p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 font-mono font-bold text-gray-800">techt98350085@barodampay</code>
                                        <button
                                            onClick={() => copyToClipboard('techt98350085@barodampay', 'upi')}
                                            className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            {copied.upi ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-1">Payee Name</p>
                                    <p className="font-bold text-gray-800">SARTHI Education</p>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                                    <p className="font-bold text-brand-orange text-xl">₹{order.amount.toLocaleString()}</p>
                                </div>

                                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                                    <div className="flex gap-2">
                                        <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-orange-900 text-sm mb-1">IMPORTANT!</p>
                                            <p className="text-sm text-orange-800">
                                                Add <strong>{orderId}</strong> in the payment note/remarks field
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-2">
                                <h5 className="font-bold text-gray-700 text-sm">Steps:</h5>
                                <ol className="space-y-2 text-sm text-gray-600">
                                    <li className="flex gap-2">
                                        <span className="font-bold text-brand-orange">1.</span>
                                        <span>Open your UPI app (GPay/PhonePe/Paytm)</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-brand-orange">2.</span>
                                        <span>Scan QR or enter UPI ID</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-brand-orange">3.</span>
                                        <span>Enter amount: ₹{order.amount}</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-brand-orange">4.</span>
                                        <span>Add Order ID in remarks: {orderId}</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-brand-orange">5.</span>
                                        <span>Complete payment</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Proof Section */}
                <div className="bg-white rounded-3xl shadow-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold">
                            2
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Upload Payment Proof</h3>
                    </div>

                    <p className="text-gray-600 mb-6">After completing the payment, upload a screenshot and transaction details below:</p>

                    <div className="space-y-6">
                        {/* Screenshot Upload */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Payment Screenshot *</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand-orange transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="screenshot-upload"
                                />
                                <label htmlFor="screenshot-upload" className="cursor-pointer">
                                    {screenshotPreview ? (
                                        <div className="space-y-4">
                                            <div className="relative h-64 w-full">
                                                <Image
                                                    src={screenshotPreview}
                                                    alt="Preview"
                                                    fill
                                                    className="object-contain rounded-lg"
                                                    unoptimized
                                                />
                                            </div>
                                            <p className="text-sm text-green-600 font-medium">✓ Screenshot uploaded</p>
                                            <button className="text-brand-orange text-sm font-bold hover:underline">
                                                Change Screenshot
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600 font-medium mb-1">Click to upload or drag and drop</p>
                                            <p className="text-sm text-gray-500">PNG, JPG, PDF (max 5MB)</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Transaction ID */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Transaction ID / UTR Number *</label>
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Enter 12-digit transaction ID"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-orange focus:outline-none font-mono"
                            />
                            <p className="text-xs text-gray-500 mt-1">You can find this in your payment app under transaction details</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmitProof}
                            disabled={!screenshot || !transactionId.trim() || uploading}
                            className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    Submit Payment Proof
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h4 className="font-bold text-blue-900 mb-2">Need Help?</h4>
                    <p className="text-sm text-blue-800 mb-3">
                        If you face any issues with payment, contact us on WhatsApp:
                    </p>
                    <a
                        href="https://api.whatsapp.com/send?phone=919835019509"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        Chat on WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}
