import React from 'react';

export const metadata = {
  title: 'Shipping & Delivery Policy | Tirumala Family Mall',
  description: 'Information regarding order dispatch and shipping times.',
};

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shipping & Delivery Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: June 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Order Processing Time</h2>
            <p>
              All orders are processed and dispatched within <strong>24 to 48 hours</strong> (excluding Sundays and public holidays) after receiving your order confirmation email and successful payment. You will receive a notification via WhatsApp and email once your order has shipped.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Estimated Delivery Time</h2>
            <p>
              Once dispatched, the standard delivery time across India is generally between <strong>3 to 7 business days</strong>, depending on your location. Deliveries to remote or non-metro areas may take slightly longer. We rely on trusted courier partners to ensure safe transit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Shipping Rates</h2>
            <p>
              Shipping charges for your order will be calculated and displayed at checkout before you complete your payment. Any applicable flat-rate fees or free shipping thresholds will be automatically applied to your cart.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Order Tracking</h2>
            <p>
              When your order has shipped, you will receive a notification from us containing a tracking number and a link to check the status of your package. Please allow 12-24 hours for the tracking portal to become fully active.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
            <p>
              If you haven't received your order within 8 days of receiving your shipping confirmation, please contact us with your name and order number, and we will look into it for you.<br /><br />
              <strong>WhatsApp:</strong> +91 99662 48223<br />
              <strong>Email:</strong> tirumalafamilymall@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}