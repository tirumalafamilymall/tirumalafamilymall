export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'PAID' | 'UNPAID'
export type UserRole = 'USER' | 'ADMIN'

export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: string
  recentOrders: Order[]
  lowStockProducts: Product[]
}

export interface Product {
  id: string
  code: string
  name: string
  category: string
  subcategory?: string
  brand?: string
  price: number
  stock: number
  color?: string
  size?: string
  barcode?: string
  images: string[]
  is_active: boolean
  created_at: string
}

export interface Order {
  id: string
  orderNumber: string
  customer: { name: string; email: string; phone: string }
  shippingAddress: { line1: string; line2?: string; city: string; state: string; pincode: string; phone: string }
  items: OrderItem[]
  amount: number
  paymentMethod: 'ONLINE'
  paymentStatus: PaymentStatus
  status: OrderStatus
  razorpayOrderId?: string
  razorpayPaymentId?: string
  shiprocketOrderId?: string
  awb?: string
  trackingUrl?: string
  createdAt: string
}

export interface OrderItem {
  productId: string
  name: string
  image: string
  qty: number
  price: number
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  ordersCount: number
  createdAt: string
}

export interface InstaLivePost {
  id: string
  title?: string
  instagramUrl: string
  thumbnail: string
  is_active: boolean
  products: LinkedProduct[]
  createdAt: string
}

export interface LinkedProduct {
  id: string
  name: string
  price: number
}

export interface BulkUploadResult {
  created: number
  updated: number
  failed: number
  parseErrors: number
  failedRows: { row: number; reason: string }[]
  parseErrorList: string[]
}
