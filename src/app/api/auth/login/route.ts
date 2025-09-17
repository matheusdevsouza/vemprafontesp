import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, generateToken, setAuthCookie } from '@/lib/auth';
import { getUserByEmail, updateUserLastLogin } from '@/lib/database';
import { applySimpleRateLimit } from '@/lib/simple-rate-limiter';
import { createSecureResponse } from '@/lib/security-headers';
import { validateCSRFRequest, createCSRFResponse } from '@/lib/csrf-protection';

export async function POST(request: NextRequest) {
  try {
    // CSRF PROTECTION: Temporariamente desabilitado para login
    // if (!validateCSRFRequest(request)) {
    //   return createCSRFResponse(
    //     { error: 'Token CSRF inválido ou ausente' },
    //     403
    //   );
    // }

    // RATE LIMITING: 5 tentativas por minuto
    const rateLimitResponse = applySimpleRateLimit(request, 5, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { email, password } = body;

    // PROTECÇÃO AVANÇADA: Verificar SQL Injection
    const sqlPatterns = [
      // Comandos SQL
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|FROM|WHERE|HAVING|GROUP\s+BY|ORDER\s+BY)\b)/gi,
      // Caracteres perigosos
      /[;'\"\\]/gi,
      // Comentários SQL
      /(\-\-|\/\*|\*\/|#)/gi,
      // Padrões de bypass
      /(OR\s+['"]?\d*['"]?\s*=\s*['"]?\d*['"]?)/gi,
      /(AND\s+['"]?\d*['"]?\s*=\s*['"]?\d*['"]?)/gi,
      /(OR\s+['"]?[a-zA-Z]*['"]?\s*=\s*['"]?[a-zA-Z]*['"]?)/gi,
      /(UNION\s+SELECT)/gi,
      // Padrões específicos detectados
      /(OR\s+['"]?1['"]?\s*=\s*['"]?1['"]?)/gi,
      /(OR\s+['"]?a['"]?\s*=\s*['"]?a['"]?)/gi,
      /(OR\s+['"]?x['"]?\s*=\s*['"]?x['"]?)/gi,
      // Parênteses e operadores
      /(\(['"]?\d*['"]?\s*OR\s*['"]?\d*['"]?\))/gi,
      // Comandos INSERT/DROP
      /(INSERT\s+INTO|DROP\s+TABLE|DELETE\s+FROM)/gi
    ];

    const checkSQLInjection = (value: string) => {
      return sqlPatterns.some(pattern => pattern.test(value));
    };

    if (checkSQLInjection(email) || checkSQLInjection(password)) {
      return createSecureResponse(
        { error: 'Acesso negado - tentativa de ataque detectada' },
        403
      );
    }

    // PROTECÇÃO XSS ULTRA AVANÇADA: Verificar payloads XSS
    const xssPatterns = [
      // Scripts
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<script[^>]*>.*?<\/script>/gi,
      // Iframes
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<iframe[^>]*>/gi,
      // JavaScript
      /javascript:/gi,
      // Event handlers - TODOS os tipos
      /on\w+\s*=/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onfocus\s*=/gi,
      /ontoggle\s*=/gi,
      // Imagens com eventos - padrões específicos
      /<img[^>]*onerror/gi,
      /<img[^>]*src\s*=\s*[^>]*onerror/gi,
      // SVG com eventos
      /<svg[^>]*onload/gi,
      /<svg[^>]*onerror/gi,
      // Body com eventos
      /<body[^>]*onload/gi,
      // Inputs com eventos
      /<input[^>]*onfocus/gi,
      /<select[^>]*onfocus/gi,
      /<textarea[^>]*onfocus/gi,
      /<keygen[^>]*onfocus/gi,
      // Media com eventos
      /<video[^>]*onerror/gi,
      /<audio[^>]*onerror/gi,
      /<source[^>]*onerror/gi,
      // Details com eventos
      /<details[^>]*ontoggle/gi,
      // Alertas e funções
      /alert\s*\(/gi,
      /confirm\s*\(/gi,
      /prompt\s*\(/gi,
      // Padrões específicos que estavam passando
      /<img\s+src\s*=\s*x\s+onerror/gi,
      /<svg\s+onload/gi,
      /<iframe\s+src\s*=\s*"javascript:/gi,
      /<body\s+onload/gi,
      /<input[^>]*onfocus[^>]*autofocus/gi,
      /<select[^>]*onfocus[^>]*autofocus/gi,
      /<textarea[^>]*onfocus[^>]*autofocus/gi,
      /<keygen[^>]*onfocus[^>]*autofocus/gi,
      /<video[^>]*><source[^>]*onerror/gi,
      /<audio[^>]*src\s*=\s*x[^>]*onerror/gi,
      /<details[^>]*open[^>]*ontoggle/gi
    ];

    const checkXSS = (value: string) => {
      return xssPatterns.some(pattern => pattern.test(value));
    };

    if (checkXSS(email) || checkXSS(password)) {
      return NextResponse.json(
        { error: 'Acesso negado - tentativa de ataque XSS detectada' },
        { status: 403 }
      );
    }

    // Validações
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'E-mail ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verificar senha
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'E-mail ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verificar se o e-mail está verificado
    if (!user.email_verified_at) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'E-mail não verificado. Verifique sua caixa de entrada e clique no link de verificação.',
          emailNotVerified: true 
        },
        { status: 401 }
      );
    }

    // Verificar se a conta está ativa
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, message: 'Conta desativada. Entre em contato conosco.' },
        { status: 401 }
      );
    }

    // Atualizar último login
    await updateUserLastLogin(user.id);

    // Gerar token JWT com todos os campos necessários
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      emailVerified: !!user.email_verified_at,
      isAdmin: !!user.is_admin,
    };

    const token = generateToken(tokenPayload);

    // Criar resposta com cookie
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login realizado com sucesso!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: !!user.email_verified_at,
          is_admin: user.is_admin,
        }
      },
      { status: 200 }
    );

    // Definir cookie de autenticação
    return setAuthCookie(response, token);

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}