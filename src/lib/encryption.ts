import crypto from 'crypto';

// Configurações de criptografia - todas via variáveis de ambiente
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Para AES, sempre 16 bytes
const SALT_LENGTH = 64; // Para PBKDF2
const HASH_ITERATIONS = 100000; // PBKDF2 iterations
const HASH_ALGORITHM = 'sha512';

// Verificar se a criptografia está habilitada
export const ENCRYPTION_ENABLED = !!ENCRYPTION_KEY && ENCRYPTION_KEY.length >= 32;

// Função para verificar se a criptografia está disponível
function checkEncryptionAvailable() {
  if (!ENCRYPTION_ENABLED) {
    console.warn('⚠️ Criptografia desabilitada - configure ENCRYPTION_KEY para habilitar');
    return false;
  }
  return true;
}

/**
 * Gera um IV (Initialization Vector) aleatório
 */
function generateIV(): Buffer {
  return crypto.randomBytes(IV_LENGTH);
}

/**
 * Gera um salt aleatório para hashing
 */
function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * Deriva uma chave de criptografia a partir da chave principal
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, 32, HASH_ALGORITHM);
}

/**
 * Criptografa um texto usando AES-256-GCM (se habilitado)
 */
export function encrypt(text: string): string {
  if (!checkEncryptionAvailable()) {
    // Retorna o texto original se a criptografia não estiver habilitada
    return text;
  }

  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid input for encryption');
    }

    const iv = generateIV();
    const salt = generateSalt();
    const key = deriveKey(ENCRYPTION_KEY!, salt);
    
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    cipher.setAAD(salt); // Additional Authenticated Data
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Retorna: salt:iv:authTag:encryptedData
    return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Descriptografa um texto usando AES-256-GCM (se habilitado)
 */
export function decrypt(encryptedText: string): string {
  if (!checkEncryptionAvailable()) {
    // Retorna o texto original se a criptografia não estiver habilitada
    return encryptedText;
  }

  try {
    if (!encryptedText || typeof encryptedText !== 'string') {
      throw new Error('Invalid input for decryption');
    }

    // Se não está no formato criptografado, retorna como está
    if (!encryptedText.includes(':')) {
      return encryptedText;
    }

    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }

    const [saltHex, ivHex, authTagHex, encryptedData] = parts;
    
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = deriveKey(ENCRYPTION_KEY!, salt);
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAAD(salt);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Se falhar na descriptografia, retorna o texto original
    return encryptedText;
  }
}

/**
 * Gera um hash seguro para IDs de usuários
 */
export function hashUserId(userId: number): string {
  if (!checkEncryptionAvailable()) {
    // Retorna um hash simples se a criptografia não estiver habilitada
    return crypto.createHash('sha256').update(userId.toString()).digest('hex').substring(0, 16);
  }

  try {
    const salt = process.env.USER_ID_SALT;
    if (!salt) {
      throw new Error('USER_ID_SALT environment variable is required');
    }
    
    const data = `${userId}:${salt}:${Date.now()}`;
    const hash = crypto.createHmac(HASH_ALGORITHM, ENCRYPTION_KEY!)
      .update(data)
      .digest('hex');
    
    // Retorna apenas os primeiros 16 caracteres para URLs amigáveis
    return hash.substring(0, 16);
  } catch (error) {
    console.error('User ID hashing error:', error);
    throw new Error('Failed to hash user ID');
  }
}

/**
 * Verifica se um hash de ID corresponde a um usuário
 */
export function verifyUserIdHash(hash: string, userId: number): boolean {
  try {
    // Para verificação, precisamos gerar o hash novamente
    const generatedHash = hashUserId(userId);
    return generatedHash === hash;
  } catch (error) {
    console.error('User ID verification error:', error);
    return false;
  }
}

/**
 * Criptografa dados pessoais sensíveis
 */
export function encryptPersonalData(data: any): any {
  if (!checkEncryptionAvailable()) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'name', 'email', 'phone', 'cpf', 'address', 'display_name',
    'birth_date', 'gender', 'zip_code', 'city', 'state', 'country'
  ];

  const encrypted = { ...data };

  for (const field of sensitiveFields) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encrypt(encrypted[field]);
    }
  }

  return encrypted;
}

/**
 * Descriptografa dados pessoais sensíveis
 */
export function decryptPersonalData(data: any): any {
  if (!checkEncryptionAvailable()) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'name', 'email', 'phone', 'cpf', 'address', 'display_name',
    'birth_date', 'gender', 'zip_code', 'city', 'state', 'country'
  ];

  const decrypted = { ...data };

  for (const field of sensitiveFields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        decrypted[field] = decrypt(decrypted[field]);
      } catch (error) {
        // Se falhar na descriptografia, mantém o valor original
        console.warn(`Failed to decrypt field ${field}:`, error);
      }
    }
  }

  return decrypted;
}

/**
 * Gera um hash seguro para senhas (compatível com bcrypt)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, 64, HASH_ALGORITHM);
  return `${salt}:${hash.toString('hex')}`;
}

/**
 * Verifica se uma senha corresponde ao hash
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, 64, HASH_ALGORITHM);
    return hash === verifyHash.toString('hex');
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Gera um token seguro para verificação de email/reset de senha
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Criptografa dados de pedidos sensíveis
 */
export function encryptOrderData(orderData: any): any {
  if (!checkEncryptionAvailable()) {
    return orderData;
  }

  if (!orderData || typeof orderData !== 'object') {
    return orderData;
  }

  const sensitiveFields = [
    'customer_name', 'customer_email', 'customer_phone', 'customer_cpf',
    'billing_address', 'shipping_address', 'payment_method'
  ];

  const encrypted = { ...orderData };

  for (const field of sensitiveFields) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encrypt(encrypted[field]);
    }
  }

  return encrypted;
}

/**
 * Descriptografa dados de pedidos sensíveis
 */
export function decryptOrderData(orderData: any): any {
  if (!checkEncryptionAvailable()) {
    return orderData;
  }

  if (!orderData || typeof orderData !== 'object') {
    return orderData;
  }

  const sensitiveFields = [
    'customer_name', 'customer_email', 'customer_phone', 'customer_cpf',
    'billing_address', 'shipping_address', 'payment_method'
  ];

  const decrypted = { ...orderData };

  for (const field of sensitiveFields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        decrypted[field] = decrypt(decrypted[field]);
      } catch (error) {
        console.warn(`Failed to decrypt order field ${field}:`, error);
      }
    }
  }

  return decrypted;
}

// Função para verificar o status da criptografia
export function getEncryptionStatus() {
  return {
    enabled: ENCRYPTION_ENABLED,
    hasKey: !!ENCRYPTION_KEY,
    keyLength: ENCRYPTION_KEY?.length || 0,
    hasUserIdSalt: !!process.env.USER_ID_SALT
  };
}

/**
 * Criptografa dados específicos de checkout (dados do cliente e endereço)
 */
export function encryptCheckoutData(checkoutData: any): any {
  if (!checkEncryptionAvailable()) {
    return checkoutData;
  }

  try {
    const encryptedData = { ...checkoutData };
    
    // Criptografar dados do cliente
    if (checkoutData.customer) {
      encryptedData.customer = encryptPersonalData(checkoutData.customer);
    }
    
    // Criptografar endereço de entrega
    if (checkoutData.shipping_address) {
      if (typeof checkoutData.shipping_address === 'string') {
        encryptedData.shipping_address = encrypt(checkoutData.shipping_address);
      } else {
        // Se for objeto, criptografar campos sensíveis
        const shippingData = { ...checkoutData.shipping_address };
        const sensitiveShippingFields = ['street', 'number', 'complement', 'neighborhood', 'city', 'state', 'zipcode'];
        
        for (const field of sensitiveShippingFields) {
          if (shippingData[field]) {
            shippingData[field] = encrypt(shippingData[field]);
          }
        }
        
        encryptedData.shipping_address = JSON.stringify(shippingData);
      }
    }
    
    return encryptedData;
  } catch (error) {
    console.error('Error encrypting checkout data:', error);
    return checkoutData;
  }
}

/**
 * Descriptografa dados específicos de checkout
 */
export function decryptCheckoutData(encryptedData: any): any {
  if (!checkEncryptionAvailable()) {
    return encryptedData;
  }

  try {
    const decryptedData = { ...encryptedData };
    
    // Descriptografar dados do cliente
    if (encryptedData.customer) {
      decryptedData.customer = decryptPersonalData(encryptedData.customer);
    }
    
    // Descriptografar endereço de entrega
    if (encryptedData.shipping_address) {
      try {
        // Tentar descriptografar como string primeiro
        const decryptedAddress = decrypt(encryptedData.shipping_address);
        decryptedData.shipping_address = decryptedAddress;
      } catch {
        // Se falhar, tentar como JSON
        try {
          const addressObj = JSON.parse(encryptedData.shipping_address);
          const sensitiveShippingFields = ['street', 'number', 'complement', 'neighborhood', 'city', 'state', 'zipcode'];
          
          for (const field of sensitiveShippingFields) {
            if (addressObj[field]) {
              addressObj[field] = decrypt(addressObj[field]);
            }
          }
          
          decryptedData.shipping_address = JSON.stringify(addressObj);
        } catch {
          // Se ambos falharem, retornar dados originais
          console.warn('Could not decrypt shipping address, returning original data');
        }
      }
    }
    
    return decryptedData;
  } catch (error) {
    console.error('Error decrypting checkout data:', error);
    return encryptedData;
  }
}
