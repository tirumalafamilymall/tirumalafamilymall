import React from 'react';

export const metadata = {
  title: 'Terms & Conditions | Tirumala Family Mall',
  description: 'Terms and Conditions for using Tirumala Family Mall.',
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Terms & Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: June 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. General Overview</h2>
            <p>
              By accessing and placing an order with Tirumala Family Mall, you confirm that you are in agreement with and bound by the terms of service contained herein. These terms apply to the entire website and any email or other type of communication between you and Tirumala Family Mall.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Products and Pricing</h2>
            <p>
              All products listed on the website, their descriptions, and their prices are subject to change without notice. We reserve the right to modify or discontinue any product at any time. We have made every effort to display as accurately as possible the colors and images of our products that appear at the store.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Payment Terms</h2>
            <p>
              We process all payments securely through authorized payment gateways. By providing your payment information, you represent and warrant that you have the legal right to use the payment method provided. All transactions are final. We do not offer Cash on Delivery (COD) services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of India, specifically within the jurisdiction of Srikakulam District, Andhra Pradesh, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Contact Information</h2>
            <p>
              For any questions regarding these Terms & Conditions, please contact us at:<br />
              <strong>Address:</strong> Tekkali, Srikakulam District, Andhra Pradesh<br />
              <strong>WhatsApp:</strong> +91 99662 48223<br />
              <strong>Email:</strong> tirumalafamilymall@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}