import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import { query, transaction } from "@/lib/database";

// PUT - Atualizar endereço
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userPayload = await authenticateUser(request);
    
    if (!userPayload) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const user = await query(`SELECT * FROM users WHERE id = ? AND is_active = 1`, [userPayload.userId]);

    if (!user || user.length === 0) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    const addressId = parseInt(params.id);
    const body = await request.json();
    const { name, street, number, complement, neighborhood, city, state, zip_code } = body;

    // Verificar se o endereço pertence ao usuário
    const existingAddress = await query(`SELECT * FROM addresses WHERE id = ? AND user_id = ?`, [addressId, userPayload.userId]);

    if (!existingAddress || existingAddress.length === 0) {
      return NextResponse.json({ message: "Endereço não encontrado" }, { status: 404 });
    }

    // Validações básicas
    if (!street || !number || !neighborhood || !city || !state || !zip_code) {
      return NextResponse.json(
        { message: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 }
      );
    }

    await query(`
      UPDATE addresses 
      SET name = ?, street = ?, number = ?, complement = ?, neighborhood = ?, city = ?, state = ?, zip_code = ?, updated_at = NOW()
      WHERE id = ?
    `, [name || null, street, number, complement || null, neighborhood, city, state.toUpperCase(), zip_code, addressId]);

    const updatedAddress = await query(`SELECT * FROM addresses WHERE id = ?`, [addressId]);
    return NextResponse.json(updatedAddress[0]);
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir endereço
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userPayload = await authenticateUser(request);
    
    if (!userPayload) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const user = await query(`SELECT * FROM users WHERE id = ? AND is_active = 1`, [userPayload.userId]);

    if (!user || user.length === 0) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    const addressId = parseInt(params.id);

    // Verificar se o endereço pertence ao usuário
    const existingAddress = await query(`SELECT * FROM addresses WHERE id = ? AND user_id = ?`, [addressId, userPayload.userId]);

    if (!existingAddress || existingAddress.length === 0) {
      return NextResponse.json({ message: "Endereço não encontrado" }, { status: 404 });
    }

    // Se for o endereço padrão, não permitir exclusão se for o único endereço
    if (existingAddress[0].is_default) {
      const addressCount = await query(`SELECT COUNT(*) as count FROM addresses WHERE user_id = ?`, [userPayload.userId]);

      if (addressCount[0].count === 1) {
        return NextResponse.json(
          { message: "Não é possível excluir o único endereço cadastrado" },
          { status: 400 }
        );
      }
    }

    await query(`DELETE FROM addresses WHERE id = ?`, [addressId]);

    // Se o endereço excluído era padrão, definir o próximo como padrão
    if (existingAddress[0].is_default) {
      const nextAddress = await query(`SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`, [userPayload.userId]);

      if (nextAddress && nextAddress.length > 0) {
        await query(`UPDATE addresses SET is_default = 1 WHERE id = ?`, [nextAddress[0].id]);
      }
    }

    return NextResponse.json({ message: "Endereço excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir endereço:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 