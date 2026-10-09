import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Zap, Phone } from 'lucide-react';
import { FAQItem } from './FAQAccordion';

export const metadata: Metadata = {
  title: 'FAQ | NEED ELECTRO – Frequently Asked Questions',
  description: 'Find answers to common questions about NEED ELECTRO services, bookings, products, warranty, payments, and technician registration.',
};

const FAQ_SECTIONS = [
  {
    category: 'Services & Bookings',
    icon: '🔧',
    faqs: [
      {
        q: 'What services does NEED ELECTRO offer?',
        a: 'NEED ELECTRO offers house wiring, electrical installations, AC and fan installation, CCTV system setup, computer and laptop repair, networking and WiFi setup, IPS/inverter installation, smart home setup, and emergency electrical services.',
      },
      {
        q: 'How do I book a technician?',
        a: 'Visit the Services page or click "Book a Service." Select your service category, describe the problem, provide your location in Moulvibazar, choose a preferred date and time slot, and confirm the booking. You can track the status in your account dashboard.',
      },
      {
        q: 'How quickly will a technician arrive?',
        a: 'Standard bookings are typically scheduled for the next available slot (usually same or next day). Emergency bookings are prioritized for same-day dispatch during business hours.',
      },
      {
        q: 'Can I cancel or reschedule a booking?',
        a: 'Yes. Contact us via phone (01733-983752) or WhatsApp at least 2 hours before the scheduled visit for cancellations or rescheduling.',
      },
      {
        q: 'What areas do you serve?',
        a: 'We primarily serve Moulvibazar Sadar, Kusumbag, Sreemangal, Kamalganj, Rajnagar, Kulaura, Barlekha, and Juri. We are expanding coverage — contact us to check availability in your area.',
      },
      {
        q: 'How is the service fee determined?',
        a: 'Service fees are based on the type and complexity of work. The technician provides a detailed quote on-site after initial inspection. Standard call-out fees may apply for emergency bookings.',
      },
    ],
  },
  {
    category: 'Products & Orders',
    icon: '📦',
    faqs: [
      {
        q: 'What products does NEED ELECTRO sell?',
        a: 'We sell laptops, desktop computers, accessories, CCTV kits, networking equipment, electrical components, smart devices, IPS/inverter units, and related technology products — all sourced from verified suppliers.',
      },
      {
        q: 'How can I place an order?',
        a: 'Browse the Shop, add products to your cart, and proceed through the checkout process. We support Cash on Delivery, bKash, Nagad, and card payments.',
      },
      {
        q: 'What is the delivery area and charge?',
        a: 'Free delivery within Moulvibazar Sadar for orders over ৳10,000. A ৳60 delivery charge applies for smaller orders. Contact us for delivery to other districts.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Delivery within Moulvibazar Sadar is typically within 1–2 business days after payment confirmation. Remote areas may take longer.',
      },
      {
        q: 'Can I return a product?',
        a: 'Products can be returned within 7 days of delivery if they are defective, damaged, or incorrect. Items must be unused and in original packaging. Contact support to initiate a return.',
      },
    ],
  },
  {
    category: 'Warranty',
    icon: '🛡️',
    faqs: [
      {
        q: 'How do I check my product warranty?',
        a: 'Visit the Warranty page and enter your product serial number or invoice number. You\'ll instantly see your warranty status, coverage period, and any claim history.',
      },
      {
        q: 'What does the warranty cover?',
        a: 'Warranty covers manufacturing defects and hardware failure under normal use. It does not cover physical damage, liquid damage, misuse, or unauthorized modifications.',
      },
      {
        q: 'How do I submit a warranty claim?',
        a: 'Visit the Warranty page and click "Submit Warranty Claim." Alternatively, open a Support ticket with type "Warranty Claim." Have your invoice and serial number ready.',
      },
      {
        q: 'How long do warranty repairs take?',
        a: 'Most warranty repairs are completed within 3–7 business days. Complex parts that require sourcing may take longer. We\'ll keep you updated throughout.',
      },
    ],
  },
  {
    category: 'Technician Registration',
    icon: '👷',
    faqs: [
      {
        q: 'How do I become a verified NEED ELECTRO technician?',
        a: 'Register an account, select "Technician" as your role, and complete the technician application form. Upload your NID and provide your skills and service areas. Our team will call you within 3 business days for verification.',
      },
      {
        q: 'What documents are required for verification?',
        a: 'You need a valid NID card (front and back), a passport photo, and any relevant technical certificates. Work experience photos are helpful but optional.',
      },
      {
        q: 'How do technicians receive job requests?',
        a: 'Verified technicians can see available jobs in their service area from their dashboard. They can accept or decline jobs based on availability.',
      },
      {
        q: 'How are technician earnings calculated?',
        a: 'Earnings are based on the job value minus the platform commission. Exact commission rates depend on the service category. Payments are processed weekly via bKash or Nagad.',
      },
    ],
  },
  {
    category: 'Payments & Security',
    icon: '💳',
    faqs: [
      {
        q: 'What payment methods are accepted?',
        a: 'We accept Cash on Delivery (Moulvibazar area), bKash, Nagad, and debit/credit cards. For large orders or service contracts, bank transfer is available.',
      },
      {
        q: 'Is my data secure?',
        a: 'Yes. All data is encrypted and stored securely. We never share personal information with third parties. Passwords are hashed and authentication uses secure HTTP-only cookies.',
      },
      {
        q: 'Do I need to pay upfront for services?',
        a: 'For standard service bookings, payment is made after the work is completed and you are satisfied. For product orders, payment options depend on your chosen method at checkout.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30 rounded-full px-4 py-1.5 text-xs font-bold text-brand-300 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">Got Questions?</h1>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            Everything you need to know about NEED ELECTRO services, products, bookings, warranty, and the technician program.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.category} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <h2 className="font-black text-slate-900 text-base">{section.category}</h2>
              </div>
              <div className="px-6">
                {section.faqs.map((faq) => (
                  <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-12 px-4 bg-white text-center">
        <div className="max-w-lg mx-auto space-y-4">
          <h2 className="text-xl font-black text-slate-900">Still Have Questions?</h2>
          <p className="text-sm text-slate-600">
            Our team is available Saturday–Thursday, 9 AM–8 PM. Don&apos;t hesitate to reach out.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="tel:+8801733983752" className="btn-primary text-xs py-3 gap-2">
              <Phone className="w-3.5 h-3.5" />
              Call 01733-983752
            </a>
            <Link href="/contact" className="btn-secondary text-xs py-3">
              Send a Message
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
