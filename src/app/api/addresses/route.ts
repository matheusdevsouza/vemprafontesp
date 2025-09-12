import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import { query, transaction } from "@/lib/database";

// GET - Listar endereços do usuário
export async function GET(request: NextRequest) {
  try {
    const userPayload = await authenticateUser(request);
    
    if (!userPayload) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const addresses = await query(`
      SELECT * FROM addresses 
      WHERE user_id = ? 
      ORDER BY is_default DESC, created_at DESC
    `, [userPayload.userId]);

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Erro ao buscar endereços:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo endereço
export async function POST(request: NextRequest) {
  try {
    const userPayload = await authenticateUser(request);
    
    if (!userPayload) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const user = await query(`SELECT * FROM users WHERE id = ? AND is_active = 1`, [userPayload.userId]);

    if (!user || user.length === 0) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { name, street, number, complement, neighborhood, city, state, zip_code } = body;

    // Validações básicas
    if (!street || !number || !neighborhood || !city || !state || !zip_code) {
      return NextResponse.json(
        { message: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 }
      );
    }

    // Se for o primeiro endereço, definir como padrão
    const existingAddresses = await query(`SELECT COUNT(*) as count FROM addresses WHERE user_id = ?`, [userPayload.userId]);
    const isDefault = existingAddresses[0].count === 0;

    const address = await query(`
      INSERT INTO addresses (user_id, name, street, number, complement, neighborhood, city, state, zip_code, is_default, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [userPayload.userId, name || null, street, number, complement || null, neighborhood, city, state.toUpperCase(), zip_code, isDefault]);

    const newAddress = await query(`SELECT * FROM addresses WHERE id = LAST_INSERT_ID()`);
    return NextResponse.json(newAddress[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar endereço:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 