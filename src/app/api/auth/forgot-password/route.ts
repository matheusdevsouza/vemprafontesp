import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, createPasswordResetToken, deleteExpiredPasswordResetTokens } from '@/lib/database'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body || {}

    console.log('=== FORGOT PASSWORD DEBUG ===')
    console.log('Email recebido:', email)
    console.log('SMTP_HOST:', process.env.SMTP_HOST)
    console.log('SMTP_USER:', process.env.SMTP_USER)
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      )
    }

    // Normalizar e-mail
    const normalizedEmail = email.trim().toLowerCase()
    console.log('Email normalizado:', normalizedEmail)

    // Não revelar se o e-mail existe (privacy)
    const user = await getUserByEmail(normalizedEmail)
    console.log('Usuário encontrado:', user ? 'SIM' : 'NÃO')

    // Limpar tokens expirados periodicamente
    await deleteExpiredPasswordResetTokens()

    if (user) {
      console.log('Usuário ID:', user.id)
      // Gerar token e salvar
      const token = crypto.randomBytes(32).toString('hex')
      console.log('Token gerado:', token.substring(0, 10) + '...')
      await createPasswordResetToken(user.id, token)

      // Enviar e-mail com link de redefinição
      console.log('Tentando enviar email...')
      const emailResult = await sendPasswordResetEmail({
        email: user.email,
        name: user.name || "Usuário",
        resetToken: token
      })
      console.log('Resultado do envio de email:', emailResult)
    }

    // Resposta genérica para evitar enumeração de e-mails
    return NextResponse.json(
      { 
        message: 'Se o e-mail estiver cadastrado, você receberá um link de redefinição em breve.',
        success: true 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro em forgot-password:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
