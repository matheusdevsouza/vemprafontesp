import { NextRequest, NextResponse } from 'next/server'
import { getPasswordResetToken, markPasswordResetTokenAsUsed, updateUserPassword } from '@/lib/database'
import { hashPassword, validatePasswordStrength } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password, confirmPassword } = body || {}

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 400 })
    }

    if (!password || !confirmPassword) {
      return NextResponse.json({ success: false, message: 'Informe a nova senha e a confirmação' }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'As senhas não conferem' }, { status: 400 })
    }

    // Validação de força da senha
    const strength = validatePasswordStrength(password)
    if (!strength.isValid) {
      return NextResponse.json({ success: false, message: strength.errors[0] || 'Senha inválida' }, { status: 400 })
    }

    // Buscar token válido
    const tokenRow = await getPasswordResetToken(token)
    if (!tokenRow) {
      return NextResponse.json({ success: false, message: 'Token inválido ou expirado' }, { status: 400 })
    }

    const userId = tokenRow.user_id

    // Atualizar senha
    const hashed = await hashPassword(password)
    await updateUserPassword(userId, hashed)

    // Marcar token como usado
    await markPasswordResetTokenAsUsed(token)

    return NextResponse.json({ success: true, message: 'Senha redefinida com sucesso' })
  } catch (error) {
    console.error('Erro em reset-password:', error)
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}
