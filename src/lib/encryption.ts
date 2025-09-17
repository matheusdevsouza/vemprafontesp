import crypto from 'crypto';

// Configurações de criptografia - todas via variáveis de ambiente
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'vemprafonte-ultra-secure-key-2024-encryption-protection';
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
    decipher.setAAD(Buffer.from('additional-data'));
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

  // ESTRATÉGIA HÍBRIDA V2: Nome, Email, Telefone e Endereço em texto plano, CPF criptografado
  // Campos que DEVEM ser criptografados (dados mais sensíveis)
  const sensitiveFields = [
    'cpf', 'birth_date', 'gender'
    // Nome, email, telefone e endereço NÃO são criptografados para facilitar uso do site
  ];

  const encrypted = { ...data };

  for (const field of sensitiveFields) {
    if (encrypted[field] && typeof encrypted[field] === 'string' && encrypted[field].trim() !== '') {
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

  // ESTRATÉGIA HÍBRIDA V2: Nome, Email, Telefone e Endereço em texto plano, CPF descriptografado
  const sensitiveFields = [
    'cpf', 'birth_date', 'gender'
    // Nome, email, telefone e endereço já estão em texto plano, não precisam descriptografar
  ];

  const decrypted = { ...data };

  for (const field of sensitiveFields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        // Verificar se o campo parece criptografado antes de tentar descriptografar
        const value = decrypted[field];
        const isEncrypted = value.includes(':') && value.length > 50;
        
        if (isEncrypted) {
          decrypted[field] = decrypt(value);
        }
        // Se não parece criptografado, mantém o valor original
        } catch (error) {
          // Se falhar na descriptografia, mantém o valor original
          console.warn(`Failed to decrypt field ${field}:`, error instanceof Error ? error.message : String(error));
        }
    }
  }

  return decrypted;
}

/**
 * Função para buscar usuário por email com criptografia transparente
 * Esta função descriptografa todos os emails e busca pelo email em texto plano
 */
export function searchUserByEmail(users: any[], email: string): any | null {
  if (!users || !Array.isArray(users)) {
    return null;
  }

  for (const user of users) {
    try {
      // Tentar descriptografar o email para comparação
      let userEmail = user.email;
      
      // Se o email parece criptografado, tentar descriptografar
      if (userEmail && userEmail.includes(':') && userEmail.split(':').length === 4) {
        try {
          userEmail = decrypt(userEmail);
        } catch (error) {
          // Se falhar, usar o email original
          console.warn('Erro ao descriptografar email para busca:', error instanceof Error ? error.message : String(error));
        }
      }
      
      // Comparar emails (case insensitive)
      if (userEmail && userEmail.toLowerCase() === email.toLowerCase()) {
        // Retornar usuário com dados descriptografados
        return decryptPersonalData(user);
      }
    } catch (error) {
      console.warn('Erro ao processar usuário na busca por email:', error instanceof Error ? error.message : String(error));
      continue;
    }
  }
  
  return null;
}

/**
 * Função especial para o painel admin - garante descriptografia completa
 * Esta função é usada exclusivamente pelo backend para exibir dados legíveis no admin
 */
export function decryptForAdmin(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Para o admin, descriptografamos apenas campos realmente criptografados (CPF, birth_date, gender)
  const adminFields = [
    'cpf', 'birth_date', 'gender',
    'customer_cpf' // Para pedidos
    // Nome, email, telefone, endereço já estão em texto plano para facilitar uso
  ];

  const decrypted = { ...data };

  for (const field of adminFields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        // Verificar se o campo parece criptografado
        const value = decrypted[field];
        const isEncrypted = value.includes(':') && value.split(':').length === 4;
        
        if (isEncrypted) {
          decrypted[field] = decrypt(value);
        }
      } catch (error) {
        // Se falhar na descriptografia, mantém o valor original
        console.warn(`Erro ao descriptografar ${field} para admin:`, error instanceof Error ? error.message : String(error));
      }
    }
  }

  return decrypted;
}

/**
 * Função inteligente e avançada para descriptografia automática de usuários para admin
 * Descriptografa automaticamente todos os dados sensíveis quando o admin acessa a página de usuários
 */
export function decryptUsersForAdmin(users: any[]): any[] {
  if (!Array.isArray(users)) {
    return users;
  }

  console.log(`🔓 Descriptografando ${users.length} usuários para visualização do admin...`);

  return users.map((user, index) => {
    try {
      const decryptedUser = { ...user };

      // Lista de campos que podem estar criptografados (apenas CPF, birth_date, gender)
      const sensitiveFields = [
        'cpf', 'birth_date', 'gender',
        'customer_cpf' // Para pedidos
        // Nome, email, telefone, endereço já estão em texto plano
      ];

      // Função inteligente para tentar descriptografar
      const smartDecrypt = (value: string | null, fieldName: string): string | null => {
        if (!value || typeof value !== 'string') {
          return value;
        }

        try {
          // Verificar se parece criptografado (formato: salt:iv:tag:encrypted)
          const isEncrypted = value.includes(':') && value.split(':').length === 4;
          
          if (isEncrypted) {
            const decrypted = decrypt(value);
            console.log(`   ✅ ${fieldName}: descriptografado com sucesso`);
            return decrypted;
          } else {
            // Se não parece criptografado, pode ser texto plano
            console.log(`   ℹ️ ${fieldName}: já em texto plano`);
            return value;
          }
        } catch (error) {
          console.warn(`   ⚠️ ${fieldName}: falha na descriptografia, mantendo valor original`);
          return value;
        }
      };

      // Aplicar descriptografia inteligente em todos os campos sensíveis
      sensitiveFields.forEach(field => {
        if (decryptedUser[field] !== undefined) {
          decryptedUser[field] = smartDecrypt(decryptedUser[field], field);
        }
      });

      // Adicionar metadados de descriptografia para debug
      decryptedUser._decryption_status = 'success';
      decryptedUser._decrypted_at = new Date().toISOString();

      return decryptedUser;

    } catch (error) {
      console.error(`❌ Erro ao descriptografar usuário ${index + 1}:`, error);
      
      // Em caso de erro, retornar usuário original com status de erro
      return {
        ...user,
        _decryption_status: 'error',
        _decryption_error: error instanceof Error ? error.message : String(error),
        _decrypted_at: new Date().toISOString()
      };
    }
  });
}

/**
 * Função para descriptografia de um único usuário para admin (mais detalhada)
 * Usada quando o admin visualiza detalhes de um usuário específico
 */
export function decryptSingleUserForAdmin(user: any): any {
  if (!user || typeof user !== 'object') {
    return user;
  }

  console.log(`🔓 Descriptografando usuário ${user.id || 'desconhecido'} para admin...`);

  try {
    const decryptedUser = { ...user };

    // Campos que devem ser descriptografados para admin (apenas CPF, birth_date, gender)
    const adminFields = [
      'cpf', 'birth_date', 'gender'
      // Nome, email, telefone, endereço já estão em texto plano
    ];

    let decryptedCount = 0;
    let plaintextCount = 0;
    let errorCount = 0;

    adminFields.forEach(field => {
      if (decryptedUser[field] && typeof decryptedUser[field] === 'string') {
        try {
          const value = decryptedUser[field];
          const isEncrypted = value.includes(':') && value.split(':').length === 4;

          if (isEncrypted) {
            decryptedUser[field] = decrypt(value);
            decryptedCount++;
            console.log(`   ✅ ${field}: descriptografado`);
          } else {
            plaintextCount++;
            console.log(`   ℹ️ ${field}: texto plano`);
          }
        } catch (error) {
          errorCount++;
          console.warn(`   ⚠️ ${field}: erro na descriptografia`);
        }
      }
    });

    // Adicionar estatísticas de descriptografia
    decryptedUser._admin_decryption = {
      status: 'success',
      timestamp: new Date().toISOString(),
      stats: {
        decrypted_fields: decryptedCount,
        plaintext_fields: plaintextCount,
        error_fields: errorCount,
        total_processed: decryptedCount + plaintextCount + errorCount
      }
    };

    console.log(`   📊 Estatísticas: ${decryptedCount} descriptografados, ${plaintextCount} texto plano, ${errorCount} erros`);

    return decryptedUser;

  } catch (error) {
    console.error('❌ Erro crítico na descriptografia do usuário:', error);
    
    return {
      ...user,
      _admin_decryption: {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
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
