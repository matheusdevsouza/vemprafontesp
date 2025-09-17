import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Função para carregar arquivos de ambiente
function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    console.log('🔧 [DEBUG] Carregando arquivo:', filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          
          // Remover aspas duplas se existirem
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          
          process.env[key.trim()] = value;
          console.log('🔧 [DEBUG] Carregado:', key.trim(), '=', value);
        }
      }
    }
  } else {
    console.log('🔧 [DEBUG] Arquivo não encontrado:', filePath);
  }
}

// Carregar variáveis de ambiente manualmente se não estiverem carregadas
if (!process.env.SMTP_HOST) {
  console.log('🔧 [DEBUG] Carregando variáveis de ambiente manualmente...');
  
  // Carregar arquivos de ambiente
  loadEnvFile('.env.local');
  loadEnvFile('.env');
  
  console.log('🔧 [DEBUG] Variáveis após carregamento:');
  console.log('🔧 [DEBUG] SMTP_HOST:', process.env.SMTP_HOST);
  console.log('🔧 [DEBUG] SMTP_PORT:', process.env.SMTP_PORT);
  console.log('🔧 [DEBUG] SMTP_USER:', process.env.SMTP_USER);
  console.log('🔧 [DEBUG] SMTP_PASS:', process.env.SMTP_PASS);
}

// Configuração do transporter de e-mail
const createTransporter = () => {
  console.log('🔧 [DEBUG] Criando transporter SMTP...');
  console.log('🔧 [DEBUG] SMTP_HOST:', process.env.SMTP_HOST);
  console.log('🔧 [DEBUG] SMTP_PORT:', process.env.SMTP_PORT, '(tipo:', typeof process.env.SMTP_PORT, ')');
  console.log('🔧 [DEBUG] SMTP_USER:', process.env.SMTP_USER);
  console.log('🔧 [DEBUG] SMTP_PASS:', process.env.SMTP_PASS);
  
  const config = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // Hostinger usa SSL na porta 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Para evitar problemas de certificado
      ciphers: 'SSLv3'
    }
  };
  
  console.log('🔧 [DEBUG] Configuração final:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass
    },
    tls: config.tls
  });
  
  return nodemailer.createTransport(config);
};

// Função para salvar email em arquivo para desenvolvimento
const saveEmailToFile = async (mailOptions: any) => {
  try {
    const emailDir = path.join(process.cwd(), 'temp_emails');
    if (!fs.existsSync(emailDir)) {
      fs.mkdirSync(emailDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `email-${timestamp}.html`;
    const filepath = path.join(emailDir, filename);
    
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Email Debug - ${mailOptions.subject}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
    .content { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h3>Email Debug Information</h3>
    <p><strong>To:</strong> ${mailOptions.to}</p>
    <p><strong>From:</strong> ${mailOptions.from}</p>
    <p><strong>Subject:</strong> ${mailOptions.subject}</p>
    <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
  </div>
  <div class="content">
    ${mailOptions.html}
  </div>
</body>
</html>`;
    
    fs.writeFileSync(filepath, emailContent);
    console.log(`📧 Email salvo em: ${filepath}`);
    console.log(`📧 Para: ${mailOptions.to}`);
    console.log(`📧 Assunto: ${mailOptions.subject}`);
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar email:', error);
    return false;
  }
};

// Interface para dados do e-mail de verificação
export interface VerificationEmailData {
  email: string;
  name: string;
  verificationToken: string;
}

// Interface para dados do e-mail de redefinição de senha
export interface PasswordResetEmailData {
  email: string;
  name: string;
  resetToken: string;
}

// Interface para dados do e-mail de rastreamento
export interface TrackingEmailData {
  email: string;
  name: string;
  orderNumber: string;
  trackingCode: string;
  trackingUrl: string;
  shippingCompany: string;
}

// Interface para dados do e-mail de confirmação de pagamento
export interface PaymentConfirmationEmailData {
  email: string;
  name: string;
  orderNumber: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

// Interface para dados do e-mail de envio do pedido
export interface OrderShippedEmailData {
  email: string;
  name: string;
  orderNumber: string;
  trackingCode: string;
  trackingUrl: string;
  shippingCompany: string;
  estimatedDelivery: string;
}

// Função para enviar e-mail de verificação
export async function sendVerificationEmail(data: VerificationEmailData): Promise<void> {
  console.log('🚀 [DEBUG] ===== INÍCIO DA FUNÇÃO sendVerificationEmail =====');
  console.log('🚀 [DEBUG] Verificando variáveis de ambiente...');
  console.log('🚀 [DEBUG] NODE_ENV:', process.env.NODE_ENV);
  console.log('🚀 [DEBUG] SMTP_HOST:', process.env.SMTP_HOST);
  console.log('🚀 [DEBUG] SMTP_PORT:', process.env.SMTP_PORT);
  console.log('🚀 [DEBUG] SMTP_USER:', process.env.SMTP_USER);
  console.log('🚀 [DEBUG] SMTP_PASS:', process.env.SMTP_PASS);
  console.log('🚀 [DEBUG] NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
  
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verificar-email?token=${data.verificationToken}`;
  console.log('🚀 [DEBUG] URL de verificação:', verificationUrl);

  const mailOptions = {
    from: `"VemPraFonteSP" <${process.env.SMTP_FROM || process.env.EMAIL_FROM || 'noreply@example.com'}>`,
    to: data.email,
    subject: "Verifique sua conta - VemPraFonteSP",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifique sua conta</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e63946 0%, #b71c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #e63946; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VemPraFonteSP</h1>
            <p>Verifique sua conta</p>
          </div>
          <div class="content">
            <h2>Olá, ${data.name}!</h2>
            <p>Obrigado por se cadastrar na VemPraFonteSP. Para ativar sua conta, clique no botão abaixo:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" 
                 style="display:inline-block;background:#e63946;color:#fff;padding:15px 30px;text-decoration:none;border-radius:5px;margin:20px 0;font-weight:bold;font-size:16px;"
              >Verificar E-mail</a>
            </div>
            
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: white;">${verificationUrl}</p>
            
            <p><strong>Importante:</strong> Este link expira em 24 horas por segurança.</p>
            
            <p>Se você não criou uma conta na VemPraFonteSP, pode ignorar este e-mail.</p>
          </div>
          <div class="footer">
            <p>© 2025 VemPraFonteSP. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    console.log('📧 [DEBUG] Iniciando envio de email...');
    console.log('📧 [DEBUG] Dados do email:', {
      to: data.email,
      name: data.name,
      verificationUrl: verificationUrl
    });
    
    console.log('📧 [DEBUG] Criando transporter...');
    const transporter = createTransporter();
    
    console.log('📧 [DEBUG] Verificando conexão SMTP...');
    await transporter.verify();
    console.log('📧 [DEBUG] Conexão SMTP verificada com sucesso!');
    
    console.log('📧 [DEBUG] Enviando email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('📧 [DEBUG] Email enviado com sucesso!');
    console.log('📧 [DEBUG] Message ID:', result.messageId);
    console.log('📧 [DEBUG] Response:', result.response);
    
    console.log(`✅ Email de verificação enviado para ${data.email}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ [DEBUG] Erro detalhado ao enviar email:');
    console.error('❌ [DEBUG] Mensagem:', errorMessage);
    
    // Verificar se o erro tem propriedades específicas
    if (error && typeof error === 'object') {
      const errorObj = error as any;
      console.error('❌ [DEBUG] Código:', errorObj.code);
      console.error('❌ [DEBUG] Response:', errorObj.response);
      console.error('❌ [DEBUG] Command:', errorObj.command);
      console.error('❌ [DEBUG] Stack:', errorObj.stack);
    }
    
    console.log('📁 Salvando email em arquivo como fallback...');
    
    // Salvar email em arquivo como fallback
    await saveEmailToFile(mailOptions);
    console.log(`✅ Email de verificação salvo em arquivo para ${data.email}`);
    console.log(`🔗 Link de verificação: ${verificationUrl}`);
  }
}

// Função para enviar e-mail de redefinição de senha
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
  const transporter = createTransporter();

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${data.resetToken}`;

  const mailOptions = {
    from: `"VemPraFonteSP" <${process.env.SMTP_FROM || process.env.EMAIL_FROM || 'noreply@example.com'}>`,
    to: data.email,
    subject: "Redefinir Senha - VemPraFonteSP",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinir Senha</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e63946 0%, #b71c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #e63946; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VemPraFonteSP</h1>
            <p>Redefinir Senha</p>
          </div>
          <div class="content">
            <h2>Redefinir sua senha</h2>
            <p>Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </div>
            
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: white;">${resetUrl}</p>
            
            <p><strong>Importante:</strong> Este link expira em 1 hora por segurança.</p>
            
            <p>Se você não solicitou a redefinição de senha, pode ignorar este e-mail.</p>
          </div>
          <div class="footer">
            <p>© 2025 VemPraFonteSP. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Função para enviar e-mail de rastreamento
export async function sendTrackingEmail(data: TrackingEmailData): Promise<void> {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"VemPraFonteSP" <${process.env.SMTP_FROM || process.env.EMAIL_FROM || 'noreply@example.com'}>`,
    to: data.email,
    subject: `Rastreamento do Pedido ${data.orderNumber} - VemPraFonteSP`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rastreamento do Pedido - VemPraFonteSP</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            background-color: #dc2626;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 30px -30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            margin-bottom: 30px;
          }
          .tracking-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background-color: #dc2626;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #b91c1c;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VemPraFonteSP</h1>
          </div>
          
          <div class="content">
            <h2>Olá, ${data.name}!</h2>
            <p>Seu pedido foi enviado! Aqui estão as informações de rastreamento:</p>
            
            <div class="tracking-info">
              <h3>Informações do Pedido</h3>
              <p><strong>Número do Pedido:</strong> ${data.orderNumber}</p>
              <p><strong>Código de Rastreamento:</strong> ${data.trackingCode}</p>
              <p><strong>Transportadora:</strong> ${data.shippingCompany}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${data.trackingUrl}" class="button">Rastrear Pedido</a>
            </div>
            
            <p>Você também pode acompanhar seu pedido acessando sua conta em nosso site.</p>
          </div>
          
          <div class="footer">
            <p>© 2025 VemPraFonteSP. Todos os direitos reservados.</p>
            <p>Este é um e-mail automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Função para enviar e-mail de confirmação de pagamento
export async function sendPaymentConfirmationEmail(data: PaymentConfirmationEmailData): Promise<void> {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"VemPraFonteSP" <${process.env.SMTP_FROM || process.env.EMAIL_FROM || 'noreply@example.com'}>`,
    to: data.email,
    subject: `Pagamento Aprovado - Pedido ${data.orderNumber} - VemPraFonteSP`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pagamento Aprovado - VemPraFonteSP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e63946 0%, #b71c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 48px; color: #28a745; margin: 20px 0; }
          .order-info { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e63946; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .item:last-child { border-bottom: none; }
          .total { font-size: 18px; font-weight: bold; color: #e63946; margin-top: 15px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VemPraFonteSP</h1>
            <p>Pagamento Aprovado!</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <div class="success-icon">✅</div>
            </div>
            
            <h2>Olá, ${data.name}!</h2>
            <p>Ótimas notícias! Seu pagamento foi aprovado e seu pedido está sendo processado.</p>
            
            <div class="order-info">
              <h3>Detalhes do Pedido</h3>
              <p><strong>Número do Pedido:</strong> ${data.orderNumber}</p>
              <p><strong>Status:</strong> Processando</p>
              
              <h4>Itens do Pedido:</h4>
              ${data.items.map(item => `
                <div class="item">
                  <span>${item.name} x${item.quantity}</span>
                  <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              
              <div class="total">
                <div class="item">
                  <span>Total:</span>
                  <span>R$ ${data.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <p><strong>Próximos Passos:</strong></p>
            <ul>
              <li>Seu pedido está sendo preparado com carinho</li>
              <li>Você receberá um e-mail quando o produto for enviado</li>
              <li>O prazo de entrega é de 3 a 7 dias úteis</li>
            </ul>
            
            <p>Obrigado por escolher a VemPraFonteSP! 🎉</p>
          </div>
          <div class="footer">
            <p>© 2025 VemPraFonteSP. Todos os direitos reservados.</p>
            <p>Este é um e-mail automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Função para enviar e-mail de envio do pedido
export async function sendOrderShippedEmail(data: OrderShippedEmailData): Promise<void> {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"VemPraFonteSP" <${process.env.SMTP_FROM || process.env.EMAIL_FROM || 'noreply@example.com'}>`,
    to: data.email,
    subject: `Seu Pedido Foi Enviado! - ${data.orderNumber} - VemPraFonteSP`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pedido Enviado - VemPraFonteSP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e63946 0%, #b71c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .shipping-icon { font-size: 48px; color: #007bff; margin: 20px 0; }
          .tracking-info { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
          .button { display: inline-block; background: #007bff; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VemPraFonteSP</h1>
            <p>Seu Pedido Foi Enviado! 🚚</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <div class="shipping-icon">📦</div>
            </div>
            
            <h2>Olá, ${data.name}!</h2>
            <p>Ótimas notícias! Seu pedido foi enviado e está a caminho!</p>
            
            <div class="tracking-info">
              <h3>Informações de Rastreamento</h3>
              <p><strong>Número do Pedido:</strong> ${data.orderNumber}</p>
              <p><strong>Código de Rastreamento:</strong> ${data.trackingCode}</p>
              <p><strong>Transportadora:</strong> ${data.shippingCompany}</p>
              <p><strong>Previsão de Entrega:</strong> ${data.estimatedDelivery}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${data.trackingUrl}" class="button">Rastrear Pedido</a>
            </div>
            
            <p><strong>O que acontece agora?</strong></p>
            <ul>
              <li>Seu pedido está em trânsito</li>
              <li>Você pode acompanhar o status usando o código de rastreamento</li>
              <li>O prazo de entrega é de 3 a 7 dias úteis</li>
              <li>Em caso de dúvidas, entre em contato conosco</li>
            </ul>
            
            <p>Obrigado por escolher a VemPraFonteSP! 🎉</p>
          </div>
          <div class="footer">
            <p>© 2025 VemPraFonteSP. Todos os direitos reservados.</p>
            <p>Este é um e-mail automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
