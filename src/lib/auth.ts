import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

// Configurações de segurança
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h'; // Reduzido para 24h por segurança
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos
const PASSWORD_HISTORY_SIZE = 5;

// Armazenamento em memória para tentativas de login (em produção, usar Redis)
const loginAttempts = new Map<string, { count: number; lockoutUntil: number }>();
const passwordHistory = new Map<number, string[]>();
const activeSessions = new Map<string, { userId: number; lastActivity: number }>();

export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  emailVerified: boolean;
  isAdmin?: boolean;
  sessionId: string;
  iat: number;
}

export interface RefreshTokenPayload {
  userId: number;
  sessionId: string;
  tokenVersion: number;
}

// Funções de hash de senha com salt único
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 15; // Aumentado para 15 rounds
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Validação rigorosa de senha
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Senha deve ter pelo menos 12 caracteres');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial (@$!%*?&)');
  }
  
  if (!/(?=.*[^\w\s])/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere não alfanumérico');
  }
  
  // Verificar padrões comuns
  const commonPatterns = ['123456', 'password', 'qwerty', 'admin', 'user'];
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    errors.push('Senha não pode conter padrões comuns');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Verificar se senha foi usada recentemente
export function isPasswordReused(userId: number, newPassword: string): boolean {
  const history = passwordHistory.get(userId) || [];
  return history.some(oldHash => bcrypt.compareSync(newPassword, oldHash));
}

// Adicionar senha ao histórico
export function addPasswordToHistory(userId: number, hashedPassword: string): void {
  const history = passwordHistory.get(userId) || [];
  history.unshift(hashedPassword);
  
  // Manter apenas as últimas 5 senhas
  if (history.length > PASSWORD_HISTORY_SIZE) {
    history.splice(PASSWORD_HISTORY_SIZE);
  }
  
  passwordHistory.set(userId, history);
}

// Rate limiting para tentativas de login
export function checkLoginRateLimit(identifier: string): { allowed: boolean; remainingTime: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);
  
  if (!attempt) {
    return { allowed: true, remainingTime: 0 };
  }
  
  if (attempt.lockoutUntil > now) {
    return { 
      allowed: false, 
      remainingTime: Math.ceil((attempt.lockoutUntil - now) / 1000) 
    };
  }
  
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    // Resetar contador após lockout
    attempt.count = 0;
    attempt.lockoutUntil = 0;
  }
  
  return { allowed: true, remainingTime: 0 };
}

// Registrar tentativa de login
export function recordLoginAttempt(identifier: string, success: boolean): void {
  const attempt = loginAttempts.get(identifier) || { count: 0, lockoutUntil: 0 };
  
  if (success) {
    // Resetar contador em caso de sucesso
    attempt.count = 0;
    attempt.lockoutUntil = 0;
  } else {
    attempt.count++;
    
    if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
      attempt.lockoutUntil = Date.now() + LOCKOUT_DURATION;
    }
  }
  
  loginAttempts.set(identifier, attempt);
}

// Gerar session ID único
export function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

// Funções de JWT com segurança reforçada
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'sessionId'>): string {
  const sessionId = generateSessionId();
  const tokenPayload = {
    ...payload,
    sessionId,
    iat: Math.floor(Date.now() / 1000),
  };
  
  // Registrar sessão ativa
  // Comentado temporariamente para evitar problemas de desenvolvimento
  // activeSessions.set(sessionId, {
  //   userId: payload.userId,
  //   lastActivity: Date.now()
  // });
  
  return jwt.sign(tokenPayload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS512', // Algoritmo mais seguro
    issuer: 'vemprafonte',
    audience: 'vemprafonte-users'
  });
}

export function generateRefreshToken(userId: number, sessionId: string): string {
  const payload: RefreshTokenPayload = {
    userId,
    sessionId,
    tokenVersion: Date.now() // Versão do token para invalidação
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    algorithm: 'HS512',
    issuer: 'vemprafonte',
    audience: 'vemprafonte-refresh'
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS512'],
      issuer: 'vemprafonte',
      audience: 'vemprafonte-users'
    }) as JWTPayload;
    
    // Verificar se a sessão ainda está ativa
    // Comentado temporariamente para evitar problemas de desenvolvimento
    // if (!activeSessions.has(payload.sessionId)) {
    //   return null;
    // }
    
    // Atualizar última atividade
    // const session = activeSessions.get(payload.sessionId);
    // if (session) {
    //   session.lastActivity = Date.now();
    //   activeSessions.set(payload.sessionId, session);
    // }
    
    return payload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS512'],
      issuer: 'vemprafonte',
      audience: 'vemprafonte-refresh'
    }) as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
}

// Invalidar sessão
export function invalidateSession(sessionId: string): boolean {
  return activeSessions.delete(sessionId);
}

// Invalidar todas as sessões de um usuário
export function invalidateAllUserSessions(userId: number): void {
  for (const [sessionId, session] of Array.from(activeSessions.entries())) {
    if (session.userId === userId) {
      activeSessions.delete(sessionId);
    }
  }
}

// Limpar sessões inativas (executar periodicamente)
export function cleanupInactiveSessions(): void {
  const now = Date.now();
  const maxInactiveTime = 24 * 60 * 60 * 1000; // 24 horas
  
  for (const [sessionId, session] of Array.from(activeSessions.entries())) {
    if (now - session.lastActivity > maxInactiveTime) {
      activeSessions.delete(sessionId);
    }
  }
}

// Funções de cookie com segurança máxima
export function setAuthCookie(response: NextResponse, token: string, refreshToken?: string): NextResponse {
  // Cookie principal com httpOnly e secure
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Mudado para lax para evitar problemas de desenvolvimento
    maxAge: 24 * 60 * 60, // 24 horas
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined,
  });
  
  // Refresh token em cookie separado (se fornecido)
  if (refreshToken) {
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Mudado para lax para evitar problemas de desenvolvimento
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/api/auth/refresh',
      domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined,
    });
  }
  
  return response;
}

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete('auth-token');
  response.cookies.delete('refresh-token');
  return response;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const cookie = request.cookies.get('auth-token');
  return cookie?.value || null;
}

export function getRefreshTokenFromRequest(request: NextRequest): string | null {
  const cookie = request.cookies.get('refresh-token');
  return cookie?.value || null;
}

// Middleware de autenticação com validação rigorosa
export async function authenticateUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;
  
  // Verificar se o IP mudou (proteção contra token theft)
  // Comentado temporariamente para evitar problemas de desenvolvimento
  // const clientIP = getClientIP(request);
  // const expectedIP = getExpectedIP(payload.sessionId);
  
  // if (expectedIP && expectedIP !== clientIP) {
  //   // IP mudou - invalidar sessão por segurança
  //   invalidateSession(payload.sessionId);
  //   return null;
  // }
  
  return payload;
}

// Função para obter IP do cliente
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return '127.0.0.1';
}

// Armazenar IP esperado para cada sessão (em produção, usar Redis)
// Comentado temporariamente para evitar problemas de desenvolvimento
// const sessionIPs = new Map<string, string>();

// function getExpectedIP(sessionId: string): string | null {
//   return sessionIPs.get(sessionId) || null;
// }

// function setExpectedIP(sessionId: string, ip: string): void {
//   sessionIPs.set(sessionId, ip);
// }

// Funções de verificação
export function isAuthenticated(payload: JWTPayload | null): boolean {
  return payload !== null;
}

export function isEmailVerified(payload: JWTPayload | null): boolean {
  return payload?.emailVerified || false;
}

export function canAccessProtectedPages(payload: JWTPayload | null): boolean {
  return isAuthenticated(payload) && isEmailVerified(payload);
} 

export function isAdmin(payload: JWTPayload | null): boolean {
  return payload?.isAdmin || false;
}

// Função para verificar se o usuário pode acessar recursos específicos
export function canAccessResource(payload: JWTPayload | null, resourceOwnerId: number): boolean {
  if (!payload) return false;
  
  // Admins podem acessar qualquer recurso
  if (payload.isAdmin) return true;
  
  // Usuários só podem acessar seus próprios recursos
  return payload.userId === resourceOwnerId;
}

// Função para registrar atividade de segurança
export function logSecurityEvent(event: string, details: any): void {
  console.log(`[SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    ...details
  });
  
  // Em produção, enviar para sistema de logging/auditoria
}

// Configurar limpeza automática de sessões
// Comentado temporariamente para evitar problemas de desenvolvimento
// if (typeof setInterval !== 'undefined') {
//   setInterval(cleanupInactiveSessions, 60 * 60 * 1000); // A cada hora
// } 