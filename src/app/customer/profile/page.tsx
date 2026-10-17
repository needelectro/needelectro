import { Metadata } from 'next';
import CustomerProfileView from '@/components/profile/CustomerProfileView';

export const metadata: Metadata = {
  title: 'My Profile | NEED ELECTRO Customer Portal',
  description: 'Manage your personal details, delivery addresses, and account security with NEED ELECTRO Bangladesh.',
};

export default function CustomerProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50/70 pb-16 pt-2">
      <CustomerProfileView isStandalonePage={true} />
    </div>
  );
}
