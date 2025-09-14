import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

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
    const body = await request.json()
    const { nome, email, telefone, assunto, motivo, mensagem } = body || {}

    console.log('=== CONTATO DEBUG ===')
    console.log('Dados recebidos:', { nome, email, assunto, motivo })

    if (!nome || !email || !assunto || !mensagem) {
      return NextResponse.json(
        { error: 'Nome, e-mail, assunto e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    const transporter = createTransporter();

    // E-mail para o cliente
    const contatoEmail = {
      from: `"VemPraFonteSP" <${process.env.SMTP_FROM || process.env.EMAIL_FROM || 'noreply@example.com'}>`,
      to: process.env.CONTACT_EMAIL || 'contato@example.com',
      subject: `[Contato] ${assunto} - ${motivo || 'Geral'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Novo Contato - VemPraFonteSP</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e63946 0%, #b71c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e63946; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VemPraFonteSP</h1>
              <p>Novo Contato Recebido</p>
            </div>
            <div class="content">
              <div class="info">
                <h3>Informações do Cliente:</h3>
                <p><strong>Nome:</strong> ${nome}</p>
                <p><strong>E-mail:</strong> ${email}</p>
                ${telefone ? `<p><strong>Telefone:</strong> ${telefone}</p>` : ''}
                <p><strong>Assunto:</strong> ${assunto}</p>
                ${motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ''}
              </div>
              
              <div class="info">
                <h3>Mensagem:</h3>
                <p>${mensagem.replace(/\n/g, '<br>')}</p>
              </div>
              
              <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            <div class="footer">
              <p>© 2025 VemPraFonteSP. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // E-mail de confirmação para o cliente
    const confirmacaoEmail = {
      from: `"VemPraFonteSP" <${process.env.SMTP_FROM || process.env.EMAIL_FROM || 'noreply@example.com'}>`,
      to: email,
      subject: 'Confirmação de Contato - VemPraFonteSP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmação de Contato</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e63946 0%, #b71c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VemPraFonteSP</h1>
              <p>Contato Recebido</p>
            </div>
            <div class="content">
              <h2>Olá, ${nome}!</h2>
              <p>Recebemos sua mensagem e agradecemos pelo contato.</p>
              
              <p><strong>Assunto:</strong> ${assunto}</p>
              <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              
              <p>Nossa equipe analisará sua solicitação e retornaremos em breve.</p>
              
              <p>Se precisar de atendimento imediato, entre em contato conosco pelo WhatsApp: <strong>(11) 93902-5934</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 VemPraFonteSP. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Enviar e-mails
    await transporter.sendMail(contatoEmail);
    await transporter.sendMail(confirmacaoEmail);

    console.log('E-mails de contato enviados com sucesso');

    return NextResponse.json(
      { 
        message: 'Mensagem enviada com sucesso! Em breve retornaremos o contato.',
        success: true 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro em contato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
