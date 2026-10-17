export type UserRole = 
  | 'CUSTOMER' 
  | 'TECHNICIAN' 
  | 'SERVICE_MANAGER' 
  | 'SALES_MANAGER' 
  | 'INVENTORY_MANAGER' 
  | 'ACCOUNTANT' 
  | 'SUPPORT_AGENT' 
  | 'ADMIN' 
  | 'SUPER_ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type TechnicianAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_LEAVE';

export type BookingStatus = 
  | 'RECEIVED'
  | 'MATCHING'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CUSTOMER_CONFIRMED'
  | 'PAID'
  | 'CLOSED'
  | 'CANCELLED';

export type OrderStatus = 
  | 'PLACED'
  | 'PAYMENT_CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 
  | 'BKASH' 
  | 'NAGAD' 
  | 'CARD' 
  | 'BANK_TRANSFER' 
  | 'CASH_ON_DELIVERY';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string | null;
  createdAt?: string | Date;
  technicianProfileId?: string | null;
  customerProfileId?: string | null;
  customerProfile?: {
    id: string;
    alternativePhone?: string | null;
    addresses?: Array<{
      id: string;
      label: string;
      recipientName: string;
      phone: string;
      division: string;
      district: string;
      upazila: string;
      area: string;
      addressLine: string;
      landmark?: string | null;
      isDefault: boolean;
    }>;
  } | null;
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl?: string | null;
  basePrice: number;
  priceType: 'FIXED' | 'STARTING_FROM' | 'INSPECTION_BASED';
  estimatedDuration: string;
  requiredSkills?: string | null;
  serviceAreas: string;
  isEmergencyService: boolean;
  isActive: boolean;
}

export interface ProductItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  brandId?: string | null;
  brandName?: string | null;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  specifications?: Record<string, string> | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  condition: 'NEW' | 'REFURBISHED';
  warrantyPeriodMonths: number;
  images: string[];
  deliveryInfo?: string | null;
  isFeatured: boolean;
  isActive: boolean;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface TechnicianSummary {
  id: string;
  userId: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  experienceYears: number;
  skills: string[];
  specializations?: string | null;
  serviceAreas: string;
  verificationStatus: VerificationStatus;
  availableStatus: TechnicianAvailability;
  ratingOverall: number;
  totalCompletedJobs: number;
  totalReviews: number;
}
