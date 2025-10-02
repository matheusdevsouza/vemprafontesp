import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, isAuthenticated } from "@/lib/auth";
import database from "@/lib/database";
import { encryptForDatabase } from "@/lib/transparent-encryption";

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

    const user = await database.getUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Usuário não encontrado" }, { status: 404 });
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }
    if (display_name !== undefined) {
      updateFields.push("display_name = ?");
      updateValues.push(display_name);
    }
    if (phone !== undefined) {
      updateFields.push("phone = ?");
      updateValues.push(phone);
    }
    if (cpf !== undefined) {
      updateFields.push("cpf = ?");
      updateValues.push(cpf);
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
      updateValues.push(address);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, message: "Nenhum campo para atualizar" }, { status: 400 });
    }

    updateFields.push("updated_at = NOW()");
    updateValues.push(userId);

    // Preparar dados para criptografia transparente
    const updateData: any = {};
    const originalValues = [...updateValues];
    
    if (name !== undefined) updateData.name = name;
    if (display_name !== undefined) updateData.display_name = display_name;
    if (phone !== undefined) updateData.phone = phone;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (address !== undefined) updateData.address = address;
    
    // Aplicar criptografia transparente
    const encryptedData = encryptForDatabase('users', updateData);
    
    // Atualizar valores com dados criptografados
    let valueIndex = 0;
    if (name !== undefined) updateValues[valueIndex++] = encryptedData.name || name;
    if (display_name !== undefined) updateValues[valueIndex++] = encryptedData.display_name || display_name;
    if (phone !== undefined) updateValues[valueIndex++] = encryptedData.phone || phone;
    if (cpf !== undefined) updateValues[valueIndex++] = encryptedData.cpf || cpf;
    if (birth_date !== undefined) updateValues[valueIndex++] = originalValues[valueIndex];
    if (gender !== undefined) updateValues[valueIndex++] = originalValues[valueIndex];
    if (address !== undefined) updateValues[valueIndex++] = encryptedData.address || address;

    const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
    console.log("SQL Query:", sql);
    console.log("Values:", updateValues);

    const pool = database.getPool();
    const [result] = await pool.execute(sql, updateValues);
    console.log("Update result:", result);

    const updatedUser = await database.getUserById(userId);
    console.log("Updated user:", updatedUser);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 });
  }
}
