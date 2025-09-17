
// Este arquivo garante que o pool do MySQL2 seja criado apenas uma vez (singleton) e reutilizado em todas as requisições.
// Nunca crie pool ou conexão dentro de handlers/rotas! Use sempre o pool exportado deste módulo.

import mysql from 'mysql2/promise'
import { 
  encryptPersonalData, 
  decryptPersonalData, 
  encryptOrderData, 
  decryptOrderData,
  hashUserId,
  verifyUserIdHash,
  searchUserByEmail,
  ENCRYPTION_ENABLED
} from './encryption'

interface DBConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
  waitForConnections: boolean
  connectionLimit: number
  queueLimit: number
  timezone: string
  charset: string
}

interface ProductFilters {
  brand_id?: number
  category_id?: number
  subcategory_id?: number
  subcategory_slug?: string
  color?: string
  is_featured?: boolean
  search?: string
  limit?: number
  unique?: boolean
  min_price?: number
  max_price?: number
  color_ids?: number[] // Added for color filtering
}

interface OrderData {
  user_id?: number
  items: OrderItem[]
  customer: Customer
  shipping_address: ShippingAddress
  payment_data?: PaymentData
}

interface OrderItem {
  product_id: number
  variant_id?: number
  name: string
  sku?: string
  size?: string
  color?: string
  product_color?: string
  quantity: number
  price: number
}

interface Customer {
  name: string
  email: string
  phone?: string
}

interface ShippingAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipcode: string
}

interface PaymentData {
  external_reference?: string
  payment_status?: string
  payment_method?: string
  payment_id?: string
}

interface UserData {
  name: string
  email: string
  phone?: string
  cpf?: string
  password?: string
}

interface ReviewData {
  product_id: number
  user_id?: number
  reviewer_name: string
  reviewer_email: string
  rating: number
  title?: string
  comment: string
}

interface TestimonialFilters {
  is_featured?: boolean
  limit?: number
}

const dbConfig: DBConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vemprafonte_sp',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 50,
  timezone: 'Z',
  charset: 'utf8mb4'
}

let pool: mysql.Pool | null = null

if (process.env.NODE_ENV === 'development') {
  if (!(globalThis as any)._mysqlPool) {
    (globalThis as any)._mysqlPool = mysql.createPool(dbConfig)
  }
  pool = (globalThis as any)._mysqlPool
} else {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
}

export function getPool(): mysql.Pool {
  return pool as mysql.Pool
}

export async function query(sql: string, params: any[] = []): Promise<any> {
  try {
    const pool = getPool()
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error('Erro na query:', error)
    throw error
  }
}

export async function transaction(queries: Array<{ sql: string; params: any[] }>): Promise<any[]> {
  const pool = getPool()
  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()
    
    const results = []
    for (const { sql, params } of queries) {
      const [result] = await connection.execute(sql, params)
      results.push(result)
    }
    
    await connection.commit()
    return results
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}


// PRODUTOS
export async function getProducts(filters: ProductFilters = {}): Promise<any[]> {
  let sql = `
    SELECT p.*, b.name as brand_name, c.name as category_name, 
           s.name as subcategory_name, pi.image_url as primary_image
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
    WHERE p.is_active = TRUE
  `
  
  const params: any[] = []

  // Remover filtro unique relacionado a blob
  // if (filters.unique) {
  //   sql += ' AND pi.use_blob = TRUE'
  // }
  
  if (filters.brand_id) {
    sql += ' AND p.brand_id = ?'
    params.push(filters.brand_id)
  }
  
  if (filters.category_id) {
    sql += ' AND p.category_id = ?'
    params.push(filters.category_id)
  }
  
  if (filters.subcategory_id) {
    sql += ' AND p.subcategory_id = ?'
    params.push(filters.subcategory_id)
  }
  
  if (filters.subcategory_slug) {
    sql += ' AND s.slug = ?'
    params.push(filters.subcategory_slug)
  }
  
  if (filters.color) {
    sql += ' AND p.color = ?'
    params.push(filters.color)
  }

  if (filters.min_price !== undefined) {
    sql += ' AND p.price >= ?'
    params.push(filters.min_price)
  }
  if (filters.max_price !== undefined) {
    sql += ' AND p.price <= ?'
    params.push(filters.max_price)
  }


  
  if (filters.is_featured) {
    sql += ' AND p.is_featured = TRUE'
  }
  
  if (filters.search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.color LIKE ?)'
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`)
  }
  
  // if (filters.unique) {
  //   sql += ' GROUP BY p.id'
  // }

  //   // sql += " GROUP BY p.id, b.name, c.name, s.name, pi.image_url"

  sql += ' ORDER BY p.id ASC'
  
  if (filters.limit) {
    sql += ' LIMIT ?'
    params.push(parseInt(filters.limit.toString()))
  }
  
  return await query(sql, params)
}

export async function getProductById(id: number): Promise<any | null> {
  const sql = `
    SELECT p.*, b.name as brand_name, c.name as category_name, s.name as subcategory_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    WHERE p.id = ? AND p.is_active = TRUE
  `
  
  const results = await query(sql, [id])
  return results[0] || null
}

export async function getProductBySlug(slug: string): Promise<any | null> {
  const sql = `
    SELECT p.*, b.name as brand_name, c.name as category_name, s.name as subcategory_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    WHERE p.slug = ? AND p.is_active = TRUE
  `;
  const results = await query(sql, [slug]);
  return results[0] || null;
}

export async function getProductImages(productId: number): Promise<any[]> {
  const sql = `
    SELECT * FROM product_images 
    WHERE product_id = ? 
    ORDER BY is_primary DESC, sort_order ASC, id ASC
  `;
  return await query(sql, [productId]);
}

export async function getProductVideos(productId: number): Promise<any[]> {
  const sql = `
    SELECT * FROM product_videos 
    WHERE product_id = ? 
    ORDER BY is_primary DESC, sort_order ASC, id ASC
  `;
  return await query(sql, [productId]);
}

export async function getProductMedia(productId: number): Promise<{ images: any[], videos: any[] }> {
  const [images, videos] = await Promise.all([
    getProductImages(productId),
    getProductVideos(productId)
  ]);
  
  return { images, videos };
}

export async function getProductVariants(productId: number): Promise<any[]> {
  const sql = `
    SELECT DISTINCT size, id, product_id, is_active, created_at, updated_at
    FROM product_variants 
    WHERE product_id = ? AND is_active = TRUE
    ORDER BY size ASC
  `
  return await query(sql, [productId])
}

export async function getAvailableColors(): Promise<any[]> {
  const sql = `
    SELECT DISTINCT color, color_hex, COUNT(*) as product_count
    FROM products 
    WHERE is_active = TRUE AND color IS NOT NULL
    GROUP BY color, color_hex
    ORDER BY product_count DESC, color ASC
  `
  return await query(sql)
}

export async function getSimilarProducts(productId: number): Promise<any[]> {
  const sql = `
    SELECT p2.*, pi.image_url as primary_image
    FROM products p1
    JOIN products p2 ON p1.subcategory_id = p2.subcategory_id 
    LEFT JOIN product_images pi ON p2.id = pi.product_id AND pi.is_primary = TRUE
    WHERE p1.id = ? AND p2.id != ? AND p2.is_active = TRUE
    -- ORDER BY p2.color ASC
  `;
  return await query(sql, [productId, productId]);
}

// MARCAS
export async function getBrands(): Promise<any[]> {
  const sql = 'SELECT * FROM brands WHERE is_active = TRUE ORDER BY name ASC'
  const results = await query(sql)
  
  return results.map((brand: any) => ({
    ...brand,
    logo_url: brand.use_blob ? `/api/brands/images/${brand.id}` : brand.logo_url
  }))
}

export async function getBrandByName(name: string): Promise<any | null> {
  const sql = 'SELECT * FROM brands WHERE name = ? AND is_active = TRUE'
  const results = await query(sql, [name])
  return results[0] || null
}

export async function getBrandBySlug(slug: string): Promise<any | null> {
  // Primeiro tentar buscar pelo slug real
  const sqlBySlug = 'SELECT * FROM brands WHERE slug = ? AND is_active = TRUE'
  const resultsBySlug = await query(sqlBySlug, [slug])
  
  if (resultsBySlug.length > 0) {
    return resultsBySlug[0]
  }
  
  // Fallback: converter slug para nome da marca (ex: "nike" -> "Nike")
  const brandName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  return await getBrandByName(brandName)
}

// CATEGORIAS
export async function getCategories(): Promise<any[]> {
  const sql = 'SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC, name ASC'
  return await query(sql)
}

export async function getSubcategories(categoryId: number | null = null): Promise<any[]> {
  let sql = 'SELECT * FROM subcategories WHERE is_active = TRUE'
  const params: any[] = []
  
  if (categoryId) {
    sql += ' AND category_id = ?'
    params.push(categoryId)
  }
  
  sql += ' ORDER BY sort_order ASC, name ASC'
  return await query(sql, params)
}

// PEDIDOS
export async function createOrder(orderData: OrderData): Promise<{ orderId: number; orderNumber: string; total_amount: number }> {
  const { user_id, items, customer, shipping_address, payment_data } = orderData
  
  // TOTAIS
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping_cost = subtotal > 199 ? 0 : 15.90
  const total_amount = subtotal + shipping_cost
  
  const orderSql = `
    INSERT INTO orders (
      user_id, order_number, external_reference, status, payment_status,
      subtotal, shipping_cost, total_amount, customer_name, customer_email,
      customer_phone, shipping_address
    ) VALUES (?, ?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?)
  `
  
  const orderNumber = `VPF${Date.now()}`
  const externalReference = payment_data?.external_reference || `order_${Date.now()}`
  
  const orderParams = [
    user_id,
    orderNumber,
    externalReference,
    subtotal,
    shipping_cost,
    total_amount,
    customer.name,
    customer.email,
    customer.phone,
    JSON.stringify(shipping_address)
  ]
  
  const orderResult = await query(orderSql, orderParams)
  const orderId = orderResult.insertId
  
  for (const item of items) {
    const itemSql = `
      INSERT INTO order_items (
        order_id, product_id, variant_id, product_name, product_sku,
        size, color, product_color, quantity, unit_price, total_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const itemParams = [
      orderId,
      item.product_id,
      item.variant_id || null,
      item.name,
      item.sku || null,
      item.size || null,
      item.color || null,
      item.product_color || null,
      item.quantity,
      item.price,
      item.price * item.quantity
    ]
    
    await query(itemSql, itemParams)
  }
  
  return { orderId, orderNumber, total_amount }
}

export async function updateOrderStatus(orderId: number, status: string, paymentData: Partial<PaymentData> = {}): Promise<any> {
  const sql = `
    UPDATE orders 
    SET status = ?, payment_status = ?, payment_method = ?, payment_id = ?, updated_at = NOW()
    WHERE id = ?
  `
  
  const params = [
    status,
    paymentData.payment_status || status,
    paymentData.payment_method || null,
    paymentData.payment_id || null,
    orderId
  ]
  
  return await query(sql, params)
}

// USUÁRIOS
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'Other';
}

export async function createUser(userData: CreateUserData): Promise<any> {
  // Criptografar dados sensíveis antes de salvar
  const encryptedData = encryptPersonalData(userData);
  
  const sql = `
    INSERT INTO users (name, email, password, phone, cpf, birth_date, gender, email_verified_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 1)
  `;
  
  const params = [
    encryptedData.name,
    encryptedData.email,
    encryptedData.password, // Já deve estar hasheada
    encryptedData.phone || null,
    encryptedData.cpf || null,
    encryptedData.birth_date || null,
    encryptedData.gender || null,
  ];
  
  return await query(sql, params);
}

export async function getUserByEmail(email: string): Promise<any> {
  // Email fica em texto plano para busca funcionar
  const sql = `SELECT * FROM users WHERE email = ? AND is_active = 1`;
  const result = await query(sql, [email]);
  
  if (result[0]) {
    // Descriptografar outros campos sensíveis (email já está em texto plano)
    try {
      return decryptPersonalData(result[0]);
    } catch (error) {
      console.warn('Erro ao descriptografar dados do usuário, retornando dados originais:', error);
      return result[0];
    }
  }
  
  return null;
}

export async function getUserById(id: number): Promise<any> {
  const sql = `SELECT * FROM users WHERE id = ? AND is_active = 1`;
  const result = await query(sql, [id]);
  
  if (result[0]) {
    // TRANSPARÊNCIA TOTAL: Sempre descriptografar dados do usuário
    try {
      return decryptPersonalData(result[0]);
    } catch (error) {
      console.warn('Erro ao descriptografar dados do usuário:', error instanceof Error ? error.message : String(error));
      return result[0]; // Retornar dados originais em caso de erro
    }
  }
  
  return null;
}

// Nova função para buscar usuário por UUID (mais segura)
export async function getUserByUuid(uuid: string): Promise<any> {
  const sql = `SELECT * FROM users WHERE user_uuid = ? AND is_active = 1`;
  const result = await query(sql, [uuid]);
  
  if (result[0]) {
    // TRANSPARÊNCIA TOTAL: Sempre descriptografar dados do usuário
    try {
      return decryptPersonalData(result[0]);
    } catch (error) {
      console.warn('Erro ao descriptografar dados do usuário:', error instanceof Error ? error.message : String(error));
      return result[0]; // Retornar dados originais em caso de erro
    }
  }
  
  return null;
}

export async function updateUserEmailVerification(userId: number): Promise<any> {
  const sql = `UPDATE users SET email_verified_at = NOW() WHERE id = ?`;
  return await query(sql, [userId]);
}

export async function updateUserLastLogin(userId: number): Promise<any> {
  const sql = `UPDATE users SET last_login = NOW() WHERE id = ?`;
  return await query(sql, [userId]);
}

// TOKENS DE VERIFICAÇÃO
export async function createVerificationToken(userId: number, token: string): Promise<any> {
  const sql = `
    INSERT INTO email_verification_tokens (user_id, token, expires_at)
    VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
  `;
  return await query(sql, [userId, token]);
}

export async function getVerificationToken(token: string): Promise<any> {
  const sql = `
    SELECT vt.*, u.email, u.name 
    FROM email_verification_tokens vt
    JOIN users u ON vt.user_id = u.id
    WHERE vt.token = ? AND vt.expires_at > NOW() AND vt.is_used = 0
  `;
  const result = await query(sql, [token]);
  return result[0] || null;
}

export async function markVerificationTokenAsUsed(token: string): Promise<any> {
  const sql = `UPDATE email_verification_tokens SET is_used = 1, used_at = NOW() WHERE token = ?`;
  return await query(sql, [token]);
}

export async function deleteExpiredVerificationTokens(): Promise<any> {
  const sql = `DELETE FROM email_verification_tokens WHERE expires_at < NOW()`;
  return await query(sql);
}

// TOKENS DE REDEFINIÇÃO DE SENHA
export async function createPasswordResetToken(userId: number, token: string): Promise<any> {
  const sql = `
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
  `;
  return await query(sql, [userId, token]);
}

export async function getPasswordResetToken(token: string): Promise<any> {
  const sql = `
    SELECT prt.*, u.email, u.name 
    FROM password_reset_tokens prt
    JOIN users u ON prt.user_id = u.id
    WHERE prt.token = ? AND prt.expires_at > NOW() AND prt.is_used = 0
  `;
  const result = await query(sql, [token]);
  return result[0] || null;
}

export async function markPasswordResetTokenAsUsed(token: string): Promise<any> {
  const sql = `UPDATE password_reset_tokens SET is_used = 1, used_at = NOW() WHERE token = ?`;
  return await query(sql, [token]);
}

export async function updateUserPassword(userId: number, hashedPassword: string): Promise<any> {
  const sql = `UPDATE users SET password = ? WHERE id = ?`;
  return await query(sql, [hashedPassword, userId]);
}

export async function deleteExpiredPasswordResetTokens(): Promise<any> {
  const sql = `DELETE FROM password_reset_tokens WHERE expires_at < NOW()`;
  return await query(sql);
}

// VERIFICAÇÕES
export async function isEmailAlreadyRegistered(email: string): Promise<boolean> {
  const sql = `SELECT COUNT(*) as count FROM users WHERE email = ?`;
  const result = await query(sql, [email]);
  return result[0].count > 0;
}

export async function isUserEmailVerified(userId: number): Promise<boolean> {
  const sql = `SELECT email_verified_at FROM users WHERE id = ?`;
  const result = await query(sql, [userId]);
  return result[0]?.email_verified_at !== null;
}

// AVALIAÇÕES
export async function getProductReviews(productId: number, limit: number = 10): Promise<any[]> {
  try {
    const sql = `
      SELECT * FROM product_reviews 
      WHERE product_id = ? AND is_approved = TRUE
      ORDER BY created_at DESC
      LIMIT ?
    `
    return await query(sql, [productId, limit])
  } catch (error) {
    console.error('Erro ao buscar reviews do produto:', error)
    return []
  }
}

export async function createProductReview(reviewData: ReviewData): Promise<any> {
  const sql = `
    INSERT INTO product_reviews (
      product_id, user_id, reviewer_name, reviewer_email, rating, title, comment, is_approved
    ) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)
  `
  
  const params = [
    reviewData.product_id,
    reviewData.user_id || null,
    reviewData.reviewer_name,
    reviewData.reviewer_email,
    reviewData.rating,
    reviewData.title || null,
    reviewData.comment,
  ]
  
  return await query(sql, params)
}

// DEPOIMENTOS
export async function getTestimonials(filters: TestimonialFilters = {}): Promise<any[]> {
  let sql = `
    SELECT t.*
    FROM testimonials t
    WHERE t.is_active = TRUE
  `
  const params: any[] = []
  
  if (filters.is_featured !== undefined) {
    sql += ' AND t.is_featured = ?'
    params.push(filters.is_featured)
  }
  
  sql += ' ORDER BY t.is_featured DESC, t.sort_order ASC, t.created_at DESC'
  
  if (filters.limit) {
    sql += ' LIMIT ?'
    params.push(filters.limit)
  }
  
  return await query(sql, params)
}

// BANNERS
export async function getBanners(position: string = 'hero'): Promise<any[]> {
  const sql = `
    SELECT * FROM banners 
    WHERE is_active = TRUE AND position = ?
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
    ORDER BY sort_order ASC
  `
  return await query(sql, [position])
}

// CONFIGURAÇÕES
export async function getSetting(key: string): Promise<string | null> {
  const sql = 'SELECT setting_value FROM site_settings WHERE setting_key = ?'
  const results = await query(sql, [key])
  return results[0]?.setting_value || null
}

export async function setSetting(key: string, value: string, type: string = 'text'): Promise<any> {
  const sql = `
    INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at)
    VALUES (?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
  `
  return await query(sql, [key, value, type])
}

// MODELOS
export async function getModels(): Promise<any[]> {
  try {
    // Mapeamento das imagens dos modelos
    const modelData: { [key: string]: { image: string, description: string } } = {
      'air-max-95': {
        image: '/images/modelos/Air Max 95.webp',
        description: 'Design icônico inspirado na anatomia humana com tecnologia Air Max visível. O clássico que revolucionou o mundo dos tênis.'
      },
      'air-max-plus-tn1': {
        image: '/images/modelos/Air Max Plus TN1.avif',
        description: 'O clássico Air Max Plus com design ondulado e tecnologia Tuned Air. Conforto e estilo em um só tênis.'
      },
      'air-max-plus-tn3': {
        image: '/images/modelos/Air Max Plus TN3.avif',
        description: 'Versão premium do Air Max Plus com acabamentos superiores e tecnologia avançada. Elegância e performance.'
      },
      'air-max-plus-drift': {
        image: '/images/modelos/Air Max Plus Drift.webp',
        description: 'Air Max Plus com design drift único. Estilo urbano e tecnologia de ponta para quem busca o diferencial.'
      },
      'air-max-dn': {
        image: '/images/modelos/Air Max DN.webp',
        description: 'Futurístico Air Max DN com design inovador. O futuro do conforto e da tecnologia Nike.'
      },
      'mizuno-prophecy-6': {
        image: '/images/modelos/Mizuno Prophecy 6.avif',
        description: 'Mizuno Prophecy 6 com tecnologia Wave avançada. Conforto e estabilidade para corridas de longa distância.'
      },
      'mizuno-prophecy-7': {
        image: '/images/modelos/Mizuno Prophecy 7.avif',
        description: 'Mizuno Prophecy 7 com design avançado e tecnologia de ponta. Performance excepcional para atletas exigentes.'
      },
      'mizuno-prophecy-8': {
        image: '/images/modelos/Mizuno Prophecy 8.avif',
        description: 'Mizuno Prophecy 8 com design de ponta e tecnologia revolucionária. O ápice da engenharia Mizuno.'
      },
      'mizuno-ls': {
        image: '/images/modelos/Mizuno LS.avif',
        description: 'Mizuno LS com design elegante e sofisticado. Estilo e conforto para o dia a dia.'
      }
    }

    const sql = `
      SELECT id, name, slug, description, image_url, use_blob, sort_order
      FROM models 
      WHERE is_active = TRUE 
      ORDER BY sort_order ASC
    `
    const results = await query(sql)
    
    return results.map((model: any) => {
      // Usar os dados mapeados se disponíveis, senão usar os do banco
      const modelInfo = modelData[model.slug]
      const finalImageUrl = modelInfo?.image || (model.use_blob ? `/api/models/images/${model.id}` : model.image_url)
      
      return {
        ...model,
        image_url: finalImageUrl
      }
    })
  } catch (error) {
    console.error('Erro em getModels:', error)
    throw error
  }
}

export async function getModelBySlug(slug: string): Promise<any | null> {
  try {
    // Mapeamento das imagens e descrições dos modelos
    const modelData: { [key: string]: { image: string, description: string } } = {
      'air-max-95': {
        image: '/images/modelos/Air Max 95.webp',
        description: 'Design icônico inspirado na anatomia humana com tecnologia Air Max visível. O clássico que revolucionou o mundo dos tênis.'
      },
      'air-max-plus-tn1': {
        image: '/images/modelos/Air Max Plus TN1.avif',
        description: 'O clássico Air Max Plus com design ondulado e tecnologia Tuned Air. Conforto e estilo em um só tênis.'
      },
      'air-max-plus-tn3': {
        image: '/images/modelos/Air Max Plus TN3.avif',
        description: 'Versão premium do Air Max Plus com acabamentos superiores e tecnologia avançada. Elegância e performance.'
      },
      'air-max-plus-drift': {
        image: '/images/modelos/Air Max Plus Drift.webp',
        description: 'Air Max Plus com design drift único. Estilo urbano e tecnologia de ponta para quem busca o diferencial.'
      },
      'air-max-dn': {
        image: '/images/modelos/Air Max DN.webp',
        description: 'Futurístico Air Max DN com design inovador. O futuro do conforto e da tecnologia Nike.'
      },
      'air-max-plus-dn8': {
        image: '/images/modelos/Air Max DN8.webp',
        description: 'Air Max Plus DN8 com design inovador e tecnologia de ponta. A evolução do conforto e estilo Nike.'
      },
      'mizuno-prophecy-6': {
        image: '/images/modelos/Mizuno Prophecy 6.avif',
        description: 'Mizuno Prophecy 6 com tecnologia Wave avançada. Conforto e estabilidade para corridas de longa distância.'
      },
      'mizuno-prophecy-7': {
        image: '/images/modelos/Mizuno Prophecy 7.avif',
        description: 'Mizuno Prophecy 7 com design avançado e tecnologia de ponta. Performance excepcional para atletas exigentes.'
      },
      'mizuno-prophecy-8': {
        image: '/images/modelos/Mizuno Prophecy 8.avif',
        description: 'Mizuno Prophecy 8 com tecnologia de ponta e design revolucionário. O ápice da engenharia Mizuno.'
      },
      'mizuno-ls': {
        image: '/images/modelos/Mizuno LS.avif',
        description: 'Mizuno LS com design elegante e sofisticado. Estilo e conforto para o dia a dia.'
      },

    }
    
    const sql = `
      SELECT id, name, slug, description, image_url, use_blob
      FROM models 
      WHERE slug = ?
    `
    const results = await query(sql, [slug])
    
    if (results.length > 0) {
      const model = results[0]
      
      // Usar os dados mapeados se disponíveis, senão usar os do banco
      const modelInfo = modelData[slug]
      const finalImageUrl = modelInfo?.image || (model.use_blob ? `/api/models/images/${model.id}` : model.image_url)
      const finalDescription = modelInfo?.description || model.description
      
      return {
        ...model,
        image_url: finalImageUrl,
        description: finalDescription
      }
    }
    
    return null
  } catch (error) {
    console.error('Erro em getModelBySlug:', error)
    throw error
  }
}

// BUSCA DE PRODUTOS
export async function searchProducts(searchQuery: string): Promise<any[]> {
  try {
    const sql = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.original_price,
        p.is_new,
        p.is_featured,
        p.is_bestseller,
        p.stock_quantity,
        p.created_at,
        b.name as brand_name,
        c.name as category_name,
        sc.name as subcategory_name,
        COALESCE(pi.image_url, '/images/Logo.png') as image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE p.is_active = TRUE
        AND (
          p.name LIKE ? OR
          p.description LIKE ? OR
          b.name LIKE ? OR
          c.name LIKE ? OR
          sc.name LIKE ? OR
          p.slug LIKE ?
        )
      ORDER BY 
        CASE 
          WHEN p.name LIKE ? THEN 1
          WHEN p.name LIKE ? THEN 2
          ELSE 3
        END,
        p.is_featured DESC,
        p.is_new DESC,
        p.created_at DESC
      LIMIT 100
    `
    
    const searchTerm = `%${searchQuery}%`
    const startsWith = `${searchQuery}%`
    const exactMatch = searchQuery
    
    const results = await query(sql, [
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
      startsWith, exactMatch
    ])
    
    return results
  } catch (error) {
    console.error('Erro em searchProducts:', error)
    throw error
  }
}

export async function getProductsByModel(modelSlug: string): Promise<any[]> {
  try {
    console.log('getProductsByModel chamada com slug:', modelSlug)
    
    // Primeiro buscar o modelo pelo slug para obter o ID
    const modelSql = `
      SELECT id, name, slug 
      FROM models 
      WHERE slug = ? AND is_active = TRUE
    `
    const modelResults = await query(modelSql, [modelSlug])
    
    if (modelResults.length === 0) {
      console.log('Modelo não encontrado:', modelSlug)
      return []
    }
    
    const model = modelResults[0]
    console.log('Modelo encontrado:', model.name, 'ID:', model.id)
    
    // Buscar produtos por model_id
    const productsSql = `
      SELECT p.*, b.name as brand_name, c.name as category_name, 
             s.name as subcategory_name,
             (
               SELECT pi2.image_url FROM product_images pi2 
               WHERE pi2.product_id = p.id AND pi2.is_primary = TRUE 
               LIMIT 1
             ) as primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.is_active = TRUE 
        AND p.model_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `
    
    const products = await query(productsSql, [model.id])
    console.log('Produtos encontrados no banco:', products.length)
    
    return products
  } catch (error) {
    console.error('Erro em getProductsByModel:', error)
    throw error
  }
}

export async function getProductsByBrand(brandSlug: string): Promise<any[]> {
  // Primeiro tentar buscar pelo slug real
  let brand = await getBrandBySlug(brandSlug)
  
  if (!brand) {
    // Fallback: converter slug para nome da marca (ex: "nike" -> "Nike")
    const brandName = brandSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    brand = await getBrandByName(brandName)
  }
  
  if (!brand) return []

  const sql = `
    SELECT p.*, b.name as brand_name, c.name as category_name, 
           s.name as subcategory_name,
           (
             SELECT pi2.image_url FROM product_images pi2 WHERE pi2.product_id = p.id AND pi2.is_primary = TRUE LIMIT 1
           ) as primary_image
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    WHERE p.is_active = TRUE 
      AND p.brand_id = ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `
  return await query(sql, [brand.id])
}

// Função auxiliar para mapear slugs para nomes de pastas
function getFolderNameBySlug(slug: string): string {
  const PRODUCT_FOLDER_MAP: { [key: string]: string } = {
    'nike-air-max-plus-og-hyper-blue': 'Air Max Plus OG \'Hyper Blue\'',
    'nike-air-max-plus-tn-25th-anniversary': 'Air Max Plus TN \'25th Anniversary\'',
    'nike-air-max-plus-tn-aquarius': 'Air Max Plus TN \'Aquarius\'',
    'nike-air-max-plus-tn-black-university-blue': 'Air Max Plus TN \'Black University Blue\'',
    'nike-air-max-plus-tn-deadpool': 'Air Max Plus TN \'Deadpool\''
  }
  return PRODUCT_FOLDER_MAP[slug] || ''
}

export async function getProductColors(): Promise<any[]> {
  const sql = `
    SELECT DISTINCT color as name, color_hex as hex, color as slug
    FROM products 
    WHERE is_active = TRUE AND color IS NOT NULL
    ORDER BY color ASC
  `;
  return await query(sql);
}

// Função para buscar pedido por código de rastreio
export async function getOrderByTrackingCode(trackingCode: string): Promise<any | null> {
  const sql = `
    SELECT * FROM orders 
    WHERE tracking_code = ? AND is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1
  `
  
  const results = await query(sql, [trackingCode]);
  return results[0] || null;
}

// Função para buscar itens de um pedido
export async function getOrderItems(orderId: number): Promise<any[]> {
  const sql = `
    SELECT oi.*, p.name, p.slug
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ? AND oi.is_active = TRUE
    ORDER BY oi.created_at ASC
  `
  
  return await query(sql, [orderId]);
}

// Função para buscar pedido por ID
export async function getOrderById(orderId: number): Promise<any | null> {
  const sql = `
    SELECT * FROM orders 
    WHERE id = ? AND is_active = TRUE
  `
  
  const results = await query(sql, [orderId]);
  return results[0] || null;
}

const database = { 
  query, 
  transaction, 
  getProducts, 
  getProductById, 
  getAvailableColors,
  getSimilarProducts,
  getBrands, 
  getBrandByName,
  getBrandBySlug,
  getCategories,
  createOrder,
  updateOrderStatus,
  getModels,
  getModelBySlug,
  getProductsByModel,
  getProductsByBrand,
  getProductColors,
  searchProducts,
  getOrderByTrackingCode,
  getOrderItems,
  getOrderById
}

export default database 