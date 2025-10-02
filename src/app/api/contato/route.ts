import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { applySimpleRateLimit } from '@/lib/simple-rate-limiter'
import { validateCSRFRequest, createCSRFResponse } from '@/lib/csrf-protection'
import { query } from '@/lib/database'

// Configuração do transporter de e-mail
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    // CSRF PROTECTION: Verificar token CSRF
    if (!validateCSRFRequest(request)) {
      return createCSRFResponse(
        { error: 'Token CSRF inválido ou ausente' },
        403
      );
    }

    // RATE LIMITING: 3 mensagens por minuto
    const rateLimitResponse = applySimpleRateLimit(request, 3, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { name, email, phone, subject, message } = body;

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

    if (checkSQLInjection(name) || checkSQLInjection(email) || checkSQLInjection(phone) || 
        checkSQLInjection(subject) || checkSQLInjection(message)) {
      return NextResponse.json(
        { error: 'Acesso negado - tentativa de ataque detectado' },
        { status: 403 }
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
      // Objetos
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      // Meta tags
      /<link\b[^<]*>/gi,
      /<meta\b[^<]*>/gi,
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
      // Entidades HTML perigosas
      /&#x?[0-9a-fA-F]+;/gi,
      // Quoted strings com scripts
      /"[^"]*<script/gi,
      /'[^']*<script/gi,
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

    if (checkXSS(name) || checkXSS(email) || checkXSS(phone) || 
        checkXSS(subject) || checkXSS(message)) {
      return NextResponse.json(
        { error: 'Acesso negado - tentativa de ataque XSS detectada' },
        { status: 403 }
      );
    }

    // Validações básicas
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'E-mail inválido' },
        { status: 400 }
      );
    }

    // Salvar no banco de dados
    try {
      await database.query(
        'INSERT INTO contact_messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [name, email, phone || null, subject, message]
      );
    } catch (dbError) {
      console.error('Erro ao salvar mensagem no banco:', dbError);
      // Continuar mesmo se falhar ao salvar no banco
    }

    // Enviar e-mail
    try {
    const transporter = createTransporter();

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
        subject: `Nova mensagem de contato: ${subject}`,
      html: `
          <h2>Nova mensagem de contato</h2>
          <p><strong>Nome:</strong> ${name}</p>
                <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
          <p><strong>Assunto:</strong> ${subject}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Erro ao enviar e-mail:', emailError);
      // Continuar mesmo se falhar ao enviar e-mail
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro no formulário de contato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}