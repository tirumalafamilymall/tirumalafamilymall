import { API_BASE } from './config'
import { getAdminToken, refreshAdminToken, authHeaders } from './auth'

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

async function adminFetch(path: string, options: RequestInit = {}) {
  let token = getAdminToken()

  const run = async (t: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
    })

  let res = await run(token)

  if (res.status === 401) {
    token = await refreshAdminToken()
    res = await run(token)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

async function userFetch(path: string, options: RequestInit = {}) {
  const headers = await authHeaders()
  return apiFetch(path, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  })
}

/* ─────────────────────────────────────────
   AUTH
───────────────────────────────────────── */

export const getMe = () => userFetch('/api/auth/me')

export const updateProfile = (data: { name?: string }) =>
  userFetch('/api/auth/update', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

/* ─────────────────────────────────────────
   PRODUCTS (PUBLIC)
───────────────────────────────────────── */

export const getProducts = (params?: {
  page?: number
  limit?: number
  department?: string 
  category?: string
  subcategory?: string
  sort?: string
  min_price?: number
  max_price?: number
  in_stock?: boolean
  search?: string
  size?: string   
  color?: string  
  brand?: string 
}) => {
  const q = new URLSearchParams()
  
  if (params?.page !== undefined)        q.set('page',        String(params.page))
  if (params?.limit !== undefined)       q.set('limit',       String(params.limit))
  if (params?.department)                q.set('department',  params.department)
  if (params?.category)                  q.set('category',    params.category)
  if (params?.subcategory)               q.set('subcategory', params.subcategory)
  if (params?.brand)                     q.set('brand',       params.brand) 
  if (params?.sort)                      q.set('sort',        params.sort)
  if (params?.min_price !== undefined)   q.set('min_price',   String(params.min_price))
  if (params?.max_price !== undefined)   q.set('max_price',   String(params.max_price))
  if (params?.in_stock)                  q.set('in_stock',    'true')
  if (params?.search)                    q.set('search',      params.search)
  if (params?.size)                      q.set('size',        params.size)
  if (params?.color)                     q.set('color',       params.color)
  
  return apiFetch(`/api/products?${q}`)
}

export const adminGetProducts = (params?: {
  page?: number
  limit?: number
  search?: string
  category?: string
  brand?: string
  is_active?: boolean
}) => {
  const q = new URLSearchParams()
  if (params?.page !== undefined)      q.set('page',      String(params.page))
  if (params?.limit !== undefined)     q.set('limit',     String(params.limit))
  if (params?.search)                  q.set('search',    params.search)
  if (params?.category)                q.set('category',  params.category)
  if (params?.brand)                   q.set('brand',     params.brand)
  if (params?.is_active !== undefined) q.set('is_active', String(params.is_active))
  return adminFetch(`/api/admin/products?${q}`)
}

export const getProduct = (id: string) =>
  apiFetch(`/api/products/${id}`)

export const searchProducts = (query: string, limit = 10) =>
  apiFetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=${limit}`)

export const getProductFilters = (department?: string) => {
  const q = new URLSearchParams()
  if (department) q.set('department', department)
  return apiFetch(`/api/products/filters?${q}`)
}

/* ─────────────────────────────────────────
   CART
───────────────────────────────────────── */

export const getCart = () => userFetch('/api/cart')

// CHANGED: variantId instead of productId
export const addToCart = (variantId: string, quantity: number) =>
  userFetch('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ variant_id: variantId, quantity }), 
  })

export const updateCartItem = (itemId: string, quantity: number) =>
  userFetch(`/api/cart/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  })

export const removeCartItem = (itemId: string) =>
  userFetch(`/api/cart/${itemId}`, { method: 'DELETE' })

export const clearCart = () =>
  userFetch('/api/cart', { method: 'DELETE' })

/* ─────────────────────────────────────────
   WISHLIST
───────────────────────────────────────── */

export const getWishlist = () => userFetch('/api/wishlist')

export const addToWishlist = (productId: string) =>
  userFetch('/api/wishlist', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId }),
  })

export const removeFromWishlist = (productId: string) =>
  userFetch('/api/wishlist', {
    method: 'DELETE',
    body: JSON.stringify({ product_id: productId }),
  })

/* ─────────────────────────────────────────
   ORDERS
───────────────────────────────────────── */

export const createOrder = (data: {
  shipping_address: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  notes?: string
  shipping_amount: number 
}) =>
  userFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const getMyOrders = () => userFetch('/api/orders')

export const getMyOrder = (orderId: string) =>
  userFetch(`/api/orders/${orderId}`)

/* ─────────────────────────────────────────
   PAYMENT
───────────────────────────────────────── */

export const createPaymentOrder = (orderId: string) =>
  userFetch('/api/payment/create-order', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
  })

export const verifyPayment = (data: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  order_id: string
}) =>
  userFetch('/api/payment/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  })

/* ─────────────────────────────────────────
   SHIPPING (PUBLIC)
───────────────────────────────────────── */

export const trackShipment = (orderId: string) =>
  userFetch(`/api/shipping/track?order_id=${orderId}`)

export const checkServiceability = (pincode: string) =>
  apiFetch(`/api/shipping/serviceability?pincode=${pincode}`)

/* ─────────────────────────────────────────
   INSTA LIVE (PUBLIC)
───────────────────────────────────────── */

export const getInstaLivePosts = (withProducts = false) =>
  apiFetch(`/api/insta-live${withProducts ? '?with_products=true' : ''}`)

/* ─────────────────────────────────────────
   CONTACT
───────────────────────────────────────── */

export const sendContact = (data: {
  name: string
  email: string
  phone: string
  message: string
}) =>
  apiFetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

/* ─────────────────────────────────────────
   UPLOAD
───────────────────────────────────────── */

export const getPresignedUrl = (filename: string, type: string) =>
  adminFetch(
    `/api/upload/presign?filename=${encodeURIComponent(filename)}&type=${encodeURIComponent(type)}`
  )

export const uploadToSpaces = async (file: File): Promise<string> => {
  const { uploadUrl, publicUrl } = await getPresignedUrl(file.name, file.type)
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })
  return publicUrl
}

/* ─────────────────────────────────────────
   ADMIN — DASHBOARD
───────────────────────────────────────── */

export const getDashboard = () =>
  adminFetch('/api/admin/dashboard')

/* ─────────────────────────────────────────
   ADMIN — PRODUCTS
───────────────────────────────────────── */

export const getCategories = () => adminFetch('/api/admin/categories') // RESTORED THIS!


export const adminGetProduct = (id: string) =>
  adminFetch(`/api/admin/products/${id}`)

export const createProduct = (data: object) =>
  adminFetch('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateProduct = (id: string, data: object) =>
  adminFetch(`/api/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const deleteProduct = (id: string) =>
  adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' })

export const bulkUploadJSON = (products: object[]) =>
  adminFetch('/api/admin/products/bulk', {
    method: 'POST',
    body: JSON.stringify(products),
  })

export const uploadExcel = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  const token = getAdminToken()
  return fetch(`${API_BASE}/api/admin/products/excel`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  }).then(r => r.json())
}

/* ─────────────────────────────────────────
   ADMIN — ORDERS
───────────────────────────────────────── */

export const adminGetOrders = (params?: {
  page?: number
  limit?: number
  status?: string
}) => {
  const q = new URLSearchParams()
  if (params?.page)   q.set('page',   String(params.page))
  if (params?.limit)  q.set('limit',  String(params.limit))
  if (params?.status) q.set('status', params.status)
  return adminFetch(`/api/admin/orders?${q}`)
}

export const adminGetOrder = (orderId: string) =>
  adminFetch(`/api/admin/orders/${orderId}`)

export const updateOrderStatus = (
  orderId: string,
  data: { status?: string; tracking_url?: string; shiprocket_order_id?: string }
) =>
  adminFetch(`/api/admin/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

/* ─────────────────────────────────────────
   ADMIN — USERS
───────────────────────────────────────── */

export const getUsers = (params?: { page?: number; search?: string }) => {
  const q = new URLSearchParams()
  if (params?.page)   q.set('page',   String(params.page))
  if (params?.search) q.set('search', params.search)
  return adminFetch(`/api/admin/users?${q}`)
}

export const getUser = (id: string) =>
  adminFetch(`/api/admin/users/${id}`)

export const changeUserRole = (id: string, role: 'USER' | 'ADMIN') =>
  adminFetch(`/api/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })

/* ─────────────────────────────────────────
   ADMIN — INSTA LIVE
───────────────────────────────────────── */

export const adminGetInstaLivePosts = () =>
  adminFetch('/api/admin/insta-live')

export const createInstaPost = (data: {
  title?: string
  instagram_url: string
  thumbnail: string
  is_active?: boolean
  product_ids?: string[]
}) =>
  adminFetch('/api/admin/insta-live', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateInstaPost = (id: string, data: object) =>
  adminFetch(`/api/admin/insta-live/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const deleteInstaPost = (id: string) =>
  adminFetch(`/api/admin/insta-live/${id}`, { method: 'DELETE' })

export const linkProduct = (postId: string, productId: string) =>
  adminFetch(`/api/admin/insta-live/${postId}/products`, {
    method: 'POST',
    body: JSON.stringify({ product_id: productId }),
  })

export const unlinkProduct = (postId: string, productId: string) =>
  adminFetch(`/api/admin/insta-live/${postId}/products`, {
    method: 'DELETE',
    body: JSON.stringify({ product_id: productId }),
  })

export const searchProductsForLink = (query: string) =>
  adminFetch(`/api/admin/products?search=${encodeURIComponent(query)}&limit=10`)

/* ─────────────────────────────────────────
   ADMIN — SHIPPING
───────────────────────────────────────── */

export const createShipment = (orderId: string) =>
  adminFetch('/api/shipping/create', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
  })

export const generateAWB = (orderId: string, shipmentId: string) =>
  adminFetch('/api/admin/shipping/awb', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, shipment_id: shipmentId }),
  })

export const getLabel = (shipmentId: string) =>
  adminFetch('/api/admin/shipping/label', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: shipmentId }),
  })

// RESTORED THIS!
export const schedulePickup = (orderId: string, shipmentId: string) => 
  adminFetch('/api/admin/shipping/pickup', { 
    method: 'POST', 
    body: JSON.stringify({ order_id: orderId, shipment_id: shipmentId }) 
  })

export const getShippingQueue = () => adminFetch('/api/admin/shipping')