// ================== DASHBOARD ==================
export const getDashboard = async () => ({
  stats: {
    products: 1240,
    orders: 340,
    revenue: "₹2.8L",
    customers: 890,
  },
  orders: []
})

// ================== PRODUCTS ==================
export const getProducts = async () => []
export const createProduct = async () => ({ success: true })
export const updateProduct = async () => ({ success: true })
export const deleteProduct = async () => ({ success: true })
export const bulkUploadJSON = async () => ({ success: true })
export const uploadExcel = async () => ({ success: true })

// ================== ORDERS ==================
export const getOrders = async () => []
export const getOrder = async () => ({})
export const updateOrderStatus = async () => ({ success: true })
export const createShipment = async () => ({ success: true })
export const generateAWB = async () => ({ success: true })
export const getLabel = async () => ({ success: true })
export const cancelShipment = async () => ({ success: true })

// ================== USERS ==================
export const getUsers = async () => []
export const getUser = async () => ({})
export const changeUserRole = async () => ({ success: true })

// ================== INSTA LIVE ==================
export const getInstaLivePosts = async () => []
export const createInstaPost = async () => ({ success: true })
export const updateInstaPost = async () => ({ success: true })
export const deleteInstaPost = async () => ({ success: true })

// 👉 THIS WAS MISSING
export const linkProduct = async () => ({ success: true })
export const unlinkProduct = async () => ({ success: true })

// ================== SEARCH ==================
export const searchProducts = async () => []

// ================== UPLOAD ==================
export const uploadPresign = async () => "https://dummy-url.com/image.jpg"