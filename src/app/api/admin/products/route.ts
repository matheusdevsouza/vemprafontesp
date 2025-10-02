import { NextRequest, NextResponse } from 'next/server'
import database from '@/lib/database'
import { authenticateUser, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e permissão de admin
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const brand = searchParams.get('brand') || 'all';
    const category = searchParams.get('category') || 'all';
    const model = searchParams.get('model') || 'all';
    const status = searchParams.get('status') || 'all';
    const newProducts = searchParams.get('newProducts') || 'false';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Query simples e direta com imagens e modelos
    let query = `
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name,
        m.name as model_name,
        pi.image_url as primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN models m ON p.model_id = m.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    `;

    // Adicionar WHERE se necessário
    const conditions = [];
    if (search) {
      conditions.push(`(p.name LIKE '%${search}%' OR p.description LIKE '%${search}%')`);
    }
    if (brand !== 'all') {
      conditions.push(`p.brand_id = ${parseInt(brand)}`);
    }
    if (category !== 'all') {
      conditions.push(`p.category_id = ${parseInt(category)}`);
    }
    if (model !== 'all') {
      conditions.push(`p.model_id = ${parseInt(model)}`);
    }
    if (status !== 'all') {
      conditions.push(`p.is_active = ${status === 'active' ? 1 : 0}`);
    }
    if (newProducts === 'true') {
      // Produtos dos últimos 7 dias
      conditions.push(`p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Adicionar ORDER BY
    if (sortBy === 'name') query += ` ORDER BY p.name ${sortOrder}`;
    else if (sortBy === 'price') query += ` ORDER BY p.price ${sortOrder}`;
    else if (sortBy === 'stock') query += ` ORDER BY p.stock_quantity ${sortOrder}`;
    else if (sortBy === 'brand') query += ` ORDER BY b.name ${sortOrder}`;
    else if (sortBy === 'category') query += ` ORDER BY c.name ${sortOrder}`;
    else if (sortBy === 'model') query += ` ORDER BY m.name ${sortOrder}`;
    else if (sortBy === 'status') query += ` ORDER BY p.is_active ${sortOrder}`;
    else query += ` ORDER BY p.created_at ${sortOrder}`;

    // Adicionar LIMIT e OFFSET
    query += ` LIMIT ${limit} OFFSET ${skip}`;

    console.log('🔍 [DEBUG] Query final:', query);

    const products = await database.query(query);

    // Query de contagem
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN models m ON p.model_id = m.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    `;

    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const countResult = await database.query(countQuery);
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      data: {
        products: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e permissão de admin
    const user = await authenticateUser(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json()
    
    // Validar campos obrigatórios
    if (!body.name || !body.price || !body.brand_id) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios: nome, preço e marca'
      }, { status: 400 });
    }

    // Gerar slug único
    let baseSlug = body.slug || body.name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;

    // Verificar se slug já existe
    while (true) {
      const existingProduct = await database.query(
        'SELECT id FROM products WHERE slug = ?',
        [slug]
      );
      
      if (existingProduct.length === 0) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Verificar se SKU já existe
    if (body.sku) {
      const existingSku = await database.query(
        'SELECT id FROM products WHERE sku = ?',
        [body.sku]
      );
      
      if (existingSku.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'SKU já existe'
        }, { status: 400 });
      }
    }

    // Normalizar/parsear campos numéricos e opcionais
    const price = typeof body.price === 'string' ? parseFloat(body.price) : body.price
    const original_price = body.original_price === null || body.original_price === undefined
      ? null
      : (typeof body.original_price === 'string' ? parseFloat(body.original_price) : body.original_price)
    const stock_quantity = body.stock_quantity !== undefined
      ? (typeof body.stock_quantity === 'string' ? parseInt(body.stock_quantity) : body.stock_quantity)
      : 0
    const min_stock_level = body.min_stock_level !== undefined
      ? (typeof body.min_stock_level === 'string' ? parseInt(body.min_stock_level) : body.min_stock_level)
      : 5
    const brand_id = typeof body.brand_id === 'string' ? parseInt(body.brand_id) : body.brand_id
    // category_id é opcional na entrada; se ausente, resolvemos um padrão existente
    let category_id = typeof body.category_id === 'string' ? parseInt(body.category_id) : body.category_id
    if (!category_id || Number.isNaN(category_id)) {
      // Tentar obter a primeira categoria ativa existente
      const rows = await database.query(
        'SELECT id FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC LIMIT 1'
      )
      if (Array.isArray(rows) && rows.length > 0 && rows[0]?.id) {
        category_id = rows[0].id
      } else {
        // Criar categoria padrão se não existir nenhuma
        const insertCat = await database.query(
          `INSERT INTO categories (name, slug, description, is_active, sort_order, created_at) VALUES (?, ?, ?, 1, 999, NOW())`,
          ['Uncategorized', 'uncategorized', null]
        )
        category_id = insertCat.insertId
      }
    }
    const model_id = body.model_id ? (typeof body.model_id === 'string' ? parseInt(body.model_id) : body.model_id) : null

    // Inserir produto (colunas compatíveis com database/vemprafonte_sp_fixed.sql)
    const insertQuery = `
      INSERT INTO products (
        name, slug, description, short_description, sku,
        price, original_price, stock_quantity, min_stock_level,
        brand_id, category_id, model_id,
        is_active, is_featured, is_new, is_bestseller,
        created_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        NOW()
      )
    `;

    const productData = [
      body.name,
      slug,
      body.description || '',
      body.short_description || null,
      body.sku || null,
      price,
      original_price,
      stock_quantity,
      min_stock_level,
      brand_id,
      category_id,
      model_id,
      body.is_active !== false ? 1 : 0,
      body.is_featured ? 1 : 0,
      body.is_new ? 1 : 0,
      body.is_bestseller ? 1 : 0
    ];

    const result = await database.query(insertQuery, productData);
    const productId = result.insertId;

    return NextResponse.json({
      success: true,
      message: 'Produto criado com sucesso',
      data: { id: productId, slug },
      // Campo adicional para compatibilidade com o frontend atual
      product: { id: productId, slug }
    });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}