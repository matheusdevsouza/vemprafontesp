import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import { authenticateUser, isAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // VERIFICAÇÃO CRÍTICA DE SEGURANÇA - APENAS ADMINS AUTENTICADOS
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 401 }
      );
    }
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID do produto inválido' },
        { status: 400 }
      );
    }

    const product = await database.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    if (!product || product.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product: product[0] });

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // VERIFICAÇÃO CRÍTICA DE SEGURANÇA - APENAS ADMINS AUTENTICADOS
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 401 }
      );
    }
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID do produto inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Atualizar produto no banco de dados
    const updateQuery = `
      UPDATE products SET 
        name = ?, 
        slug = ?, 
        description = ?, 
        price = ?, 
        stock_quantity = ?, 
        is_active = ?, 
        brand_id = ?, 
        model_id = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    const slug = body.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

    await database.query(updateQuery, [
      body.name,
      slug,
      body.description,
      body.price ? parseFloat(body.price) : null,
      body.stock_quantity !== undefined ? parseInt(body.stock_quantity) : null,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : null,
      body.brand_id ? parseInt(body.brand_id) : null,
      body.model_id ? parseInt(body.model_id) : null,
      productId
    ]);

    // Buscar o produto atualizado
    const updatedProduct = await database.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    return NextResponse.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      product: updatedProduct[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // VERIFICAÇÃO CRÍTICA DE SEGURANÇA - APENAS ADMINS AUTENTICADOS
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores autorizados.' },
        { status: 401 }
      );
    }
    
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: 'ID do produto inválido' },
        { status: 400 }
      );
    }

    // Verificar se o produto existe
    const existingProduct = await database.query(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );

    if (!existingProduct || existingProduct.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Remover imagens associadas primeiro (se existirem)
    await database.query(
      'DELETE FROM product_images WHERE product_id = ?',
      [productId]
    );

    // Remover variantes do produto (se existirem)
    await database.query(
      'DELETE FROM product_variants WHERE product_id = ?',
      [productId]
    );

    // Remover reviews do produto (se existirem)
    await database.query(
      'DELETE FROM product_reviews WHERE product_id = ?',
      [productId]
    );

    // Remover itens de pedidos que referenciam este produto (se existirem)
    // Nota: Isso pode afetar pedidos existentes, considere usar soft delete
    await database.query(
      'DELETE FROM order_items WHERE product_id = ?',
      [productId]
    );

    // Finalmente, remover o produto
    await database.query(
      'DELETE FROM products WHERE id = ?',
      [productId]
    );

    return NextResponse.json({
      success: true,
      message: 'Produto excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
