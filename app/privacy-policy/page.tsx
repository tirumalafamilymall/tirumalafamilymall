import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Tirumala Family Mall',
  description: 'Privacy Policy and Data Handling for Tirumala Family Mall.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: June 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              Welcome to Tirumala Family Mall. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Identity Data:</strong> First name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> Billing address, delivery address, email address, and telephone/WhatsApp numbers.</li>
              <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products you have purchased from us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. How We Use Your Data & WhatsApp Communications</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to process and deliver your order, manage payments, fees and charges, and keep you updated on your order status.
            </p>
            <p className="mt-4">
              <strong>WhatsApp Notifications:</strong> By providing your phone number during checkout, you consent to receiving transactional messages regarding your order status, shipping updates, and payment confirmations via the WhatsApp Business API. We do not use this channel for spam or unsolicited marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Data Security & Third Parties</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorised way. We may share your data with trusted third parties strictly for operational purposes, including:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Payment gateways (e.g., Razorpay) for secure transaction processing.</li>
              <li>Logistics partners (e.g., Shiprocket) for order fulfillment and delivery.</li>
              <li>Communication platforms (e.g., Meta/WhatsApp) for sending transactional updates.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Your Legal Rights & Data Deletion</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, or erasure of your personal data. If you wish to delete your data or opt-out of WhatsApp communications, please contact us directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at: <br />
              <strong>Email:</strong> tirumalafamilymall@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}