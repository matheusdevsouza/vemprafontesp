// Tipos de produtos
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  image: string
  brand?: string
  category: Category
  categoryId: string
  stock: number
  rating?: number
  reviews?: number
  isNew?: boolean
  isSale?: boolean
  createdAt: Date
  updatedAt: Date
}

// Tipos de categorias
export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  products?: Product[]
  createdAt: Date
  updatedAt: Date
}

// Tipos de usuários
export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  orders?: Order[]
  createdAt: Date
  updatedAt: Date
}

// Tipos de pedidos
export interface Order {
  id: string
  userId: string
  user: User
  total: number
  status: OrderStatus
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  price: number
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// Tipos de modelos
export interface Model {
  id: string
  name: string
  image: string
  category?: string
  createdAt: Date
  updatedAt: Date
}

// Tipos de banners
export interface Banner {
  id: string
  imageUrl: string
  mobileImageUrl?: string
  title: string
  subtitle?: string
  buttonText?: string
  buttonUrl?: string
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

// Tipos de carrinho
export interface CartItem {
  id: string
  product: Product
  quantity: number
  price: number
  size?: string // Tamanho selecionado do produto
  image?: string // Imagem principal do produto
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

// Tipos de autenticação
export interface AuthUser {
  id: string
  name: string
  email: string
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// Tipos de endereço
export interface Address {
  id?: string
  userId?: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault?: boolean
}

// Tipos de pagamento
export interface PaymentMethod {
  id: string
  type: 'credit_card' | 'debit_card' | 'pix' | 'boleto'
  name: string
  details: any
}

export interface CreditCard {
  number: string
  holderName: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}

// Tipos de frete
export interface ShippingOption {
  id: string
  name: string
  price: number
  estimatedDays: number
  company: string
}

export interface ShippingCalculation {
  zipCode: string
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
}

// Tipos de checkout
export interface CheckoutData {
  user: User
  cart: Cart
  shippingAddress: Address
  billingAddress?: Address
  shippingOption: ShippingOption
  paymentMethod: PaymentMethod
  total: number
  subtotal: number
  shippingCost: number
  taxes: number
}

// Tipos de filtros
export interface ProductFilters {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'oldest' | 'rating'
  isNew?: boolean
  isSale?: boolean
  inStock?: boolean
  search?: string
}

export interface PaginationParams {
  page: number
  limit: number
  total?: number
  totalPages?: number
}

// Tipos de API Response
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Tipos de depoimentos
export interface Testimonial {
  id: string
  name: string
  avatar: string
  location: string
  rating: number
  comment: string
  product: string
  createdAt: Date
}

// Tipos de newsletter
export interface NewsletterSubscription {
  email: string
  subscribedAt: Date
}

// Tipos de contato
export interface ContactMessage {
  name: string
  email: string
  subject: string
  message: string
  phone?: string
}

// Tipos de tema
export interface ThemeConfig {
  mode: 'light' | 'dark'
  primaryColor: string
  accentColor: string
}

// Tipos de configuração
export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
    instagram: string
    facebook: string
  }
}

// Tipos de animação
export interface AnimationConfig {
  duration: number
  delay?: number
  ease?: string
  stagger?: number
}

// Tipos de notificação
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Tipos de meta dados
export interface MetaData {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  canonical?: string
} 