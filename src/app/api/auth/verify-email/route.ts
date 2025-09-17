import { NextRequest, NextResponse } from 'next/server';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { 
  getVerificationToken, 
  markVerificationTokenAsUsed, 
  updateUserEmailVerification 
} from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de verificação é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar token de verificação
    const verificationData = await getVerificationToken(token);
    if (!verificationData) {
      return NextResponse.json(
        { success: false, message: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    // Marcar token como usado
    await markVerificationTokenAsUsed(token);

    // Marcar e-mail como verificado
    await updateUserEmailVerification(verificationData.user_id);

    // Gerar token JWT para login automático
    const tokenPayload = {
      userId: verificationData.user_id,
      email: verificationData.email,
      name: verificationData.name,
      emailVerified: true,
    };

    console.log('Token payload:', tokenPayload);
    console.log('Verification data:', verificationData);

    const authToken = generateToken(tokenPayload);

    // Criar resposta com cookie
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'E-mail verificado com sucesso! Você já está logado.',
        user: {
          id: verificationData.user_id,
          name: verificationData.name,
          email: verificationData.email,
          emailVerified: true,
        }
      },
      { status: 200 }
    );

    // Definir cookie de autenticação
    return setAuthCookie(response, authToken);

  } catch (error) {
    console.error('Erro na verificação de e-mail:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 







