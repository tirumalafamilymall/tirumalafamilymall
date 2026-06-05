import React from 'react';

export const metadata = {
  title: 'Cancellation & Refund Policy | Tirumala Family Mall',
  description: 'Our strict no refund, no cancellation, and no return policy.',
};

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Cancellation & Refund Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: June 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. No Returns or Exchanges</h2>
            <p>
              At Tirumala Family Mall, we maintain a strict quality control process before dispatching any items. Because of this, <strong>we do not accept returns or exchanges</strong> once a product has been successfully delivered. Please review your cart, sizing, and color choices carefully before completing your purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. No Cancellations</h2>
            <p>
              Once an order is placed and payment is successfully captured, it is immediately sent to our dispatch team to ensure fast shipping. Therefore, <strong>orders cannot be canceled or modified</strong> after the payment is confirmed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. No Refunds</h2>
            <p>
              We operate on a strict <strong>no-refund policy</strong>. All sales are final. Refunds will only be considered under highly exceptional circumstances initiated by us, such as if a product becomes entirely out of stock after your payment is captured and we are unable to fulfill the order.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Cash on Delivery (COD)</h2>
            <p>
              We currently <strong>do not</strong> offer Cash on Delivery (COD) as a payment method. All orders must be fully prepaid via our secure online payment gateway.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Contact Support</h2>
            <p>
              If you receive an entirely incorrect item due to a dispatch error on our end, please reach out to our support team within 24 hours of delivery with photographic evidence.<br /><br />
              <strong>WhatsApp:</strong> +91 99662 48223<br />
              <strong>Email:</strong> tirumalafamilymall@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}