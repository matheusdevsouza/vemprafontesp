import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, updateUserEmailVerification } from '@/lib/database';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'E-mail é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (user.email_verified) {
      return NextResponse.json(
        { success: false, message: 'E-mail já foi verificado' },
        { status: 400 }
      );
    }

    // Gerar novo token de verificação
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);

    // Atualizar token no banco
    await updateUserEmailVerification(user.id);

    // Enviar e-mail de verificação
    const emailSent = await sendVerificationEmail({
      email: user.email,
      name: user.name || user.display_name || 'Usuário',
      verificationToken: verificationToken
    });

    return NextResponse.json({
      success: true,
      message: 'E-mail de verificação reenviado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao reenviar verificação:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}





