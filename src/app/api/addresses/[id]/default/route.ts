import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import database from "@/lib/database";

// PUT - Definir endereço como padrão
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userPayload = await authenticateUser(request);
    
    if (!userPayload) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const user = await database.query(`SELECT * FROM users WHERE id = ? AND is_active = 1`, [userPayload.userId]);

    if (!user || user.length === 0) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    const addressId = parseInt(params.id);

    // Verificar se o endereço pertence ao usuário
    const existingAddress = await database.query(`SELECT * FROM addresses WHERE id = ? AND user_id = ?`, [addressId, userPayload.userId]);

    if (!existingAddress || existingAddress.length === 0) {
      return NextResponse.json({ message: "Endereço não encontrado" }, { status: 404 });
    }

    // Se já é o padrão, remover o padrão
    if (existingAddress[0].is_default) {
      await database.query(`UPDATE addresses SET is_default = 0 WHERE id = ?`, [addressId]);
      return NextResponse.json({ message: "Endereço removido como padrão com sucesso" });
    }

    // Usar transação para garantir consistência
    await database.transaction([
      {
        sql: `UPDATE addresses SET is_default = 0 WHERE user_id = ?`,
        params: [userPayload.userId]
      },
      {
        sql: `UPDATE addresses SET is_default = 1 WHERE id = ?`,
        params: [addressId]
      }
    ]);

    return NextResponse.json({ message: "Endereço definido como padrão com sucesso" });
  } catch (error) {
    console.error("Erro ao definir endereço padrão:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 