import { NextResponse } from 'next/server';

export async function GET() {
  // Verificar se está em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Apenas em desenvolvimento' }, { status: 403 });
  }

  const envInfo = {
    nodeEnv: process.env.NODE_ENV,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    databaseUrl: process.env.DATABASE_URL ? '***' : 'undefined',
    emailUser: process.env.EMAIL_USER ? '***' : 'undefined',
    smtpHost: process.env.SMTP_HOST,
    debug: process.env.NEXT_PUBLIC_DEBUG,
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(envInfo, { status: 200 });
}
