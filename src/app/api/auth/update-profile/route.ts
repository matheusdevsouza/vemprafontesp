import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, isAuthenticated } from "@/lib/auth";
import { getUserById, getPool } from "@/lib/database";
import { encrypt, encryptPersonalData } from "@/lib/encryption";

export async function PATCH(request: NextRequest) {
  try {
    const payload = await authenticateUser(request);
    if (!isAuthenticated(payload) || !payload) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 });
    }

    const userId = payload.userId;
    const data = await request.json();
    const { name, display_name, phone, cpf, birth_date, gender, address } = data ?? {};

    console.log("=== UPDATE PROFILE DEBUG ===");
    console.log("User ID:", userId);
    console.log("Data received:", data);

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Usuário não encontrado" }, { status: 404 });
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(encrypt(name));
    }
    if (display_name !== undefined) {
      updateFields.push("display_name = ?");
      updateValues.push(encrypt(display_name));
    }
    if (phone !== undefined) {
      updateFields.push("phone = ?");
      updateValues.push(encrypt(phone));
    }
    if (cpf !== undefined) {
      updateFields.push("cpf = ?");
      updateValues.push(encrypt(cpf));
    }
    if (birth_date !== undefined) {
      updateFields.push("birth_date = ?");
      updateValues.push(birth_date);
    }
    if (gender !== undefined) {
      updateFields.push("gender = ?");
      updateValues.push(gender);
    }
    if (address !== undefined) {
      updateFields.push("address = ?");
      updateValues.push(encrypt(address));
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, message: "Nenhum campo para atualizar" }, { status: 400 });
    }

    updateFields.push("updated_at = NOW()");
    updateValues.push(userId);

    const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
    console.log("SQL Query:", sql);
    console.log("Values:", updateValues);

    const pool = getPool();
    const result = await pool.query(sql, updateValues);
    console.log("Update result:", result);

    const updatedUser = await getUserById(userId);
    console.log("Updated user:", updatedUser);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 });
  }
}
