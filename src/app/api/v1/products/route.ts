import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAuth, recordAuditLog } from '@/lib/apiAuth';

// Cached categories and brands to avoid redundant DB roundtrips
let cachedCategories: { data: any[]; timestamp: number } | null = null;
let cachedBrands: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const brandSlug = searchParams.get('brand');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const condition = searchParams.get('condition'); // NEW or REFURBISHED
    const includeAll = searchParams.get('includeAll') === 'true';
    const sellerId = searchParams.get('sellerId');
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = searchParams.get('limit');
    
    // Support limit=all or numerical limit
    const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
    const take = limitParam === 'all' ? undefined : Math.min(100, Math.max(1, parseInt(limitParam || '50', 10)));
    const skip = take !== undefined ? (page - 1) * take : undefined;

    const whereClause: any = {};
    if (!includeAll) {
      whereClause.isActive = true;
      whereClause.approvalStatus = 'APPROVED';
    }
    if (sellerId) {
      whereClause.sellerId = sellerId;
    }

    if (categorySlug && categorySlug !== 'all') {
      whereClause.category = { slug: categorySlug };
    }

    if (brandSlug && brandSlug !== 'all') {
      whereClause.brand = { slug: brandSlug };
    }

    if (featured) {
      whereClause.isFeatured = true;
    }

    if (condition && condition !== 'all') {
      whereClause.condition = condition;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const now = Date.now();
    const needCategories = !cachedCategories || now - cachedCategories.timestamp > CACHE_TTL_MS;
    const needBrands = !cachedBrands || now - cachedBrands.timestamp > CACHE_TTL_MS;

    const [products, totalCount, freshCategories, freshBrands] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          shortDescription: true,
          price: true,
          discountPrice: true,
          stock: true,
          condition: true,
          warrantyPeriodMonths: true,
          images: true,
          isFeatured: true,
          isActive: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          sellerId: true,
          approvalStatus: true,
          seller: { select: { id: true, businessName: true, slug: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take,
        skip,
      }),
      prisma.product.count({ where: whereClause }),
      needCategories
        ? prisma.productCategory.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, name: true, slug: true, imageUrl: true },
          })
        : Promise.resolve(null),
      needBrands
        ? prisma.brand.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true, logoUrl: true },
          })
        : Promise.resolve(null),
    ]);

    if (freshCategories) {
      cachedCategories = { data: freshCategories, timestamp: now };
    }
    if (freshBrands) {
      cachedBrands = { data: freshBrands, timestamp: now };
    }

    const formattedProducts = products.map((p: any) => ({
      ...p,
      images: p.images ? p.images.split(',') : [],
    }));

    const response = NextResponse.json({
      success: true,
      products: formattedProducts,
      categories: cachedCategories?.data || [],
      brands: cachedBrands?.data || [],
      pagination: {
        total: totalCount,
        page,
        limit: take || totalCount,
        totalPages: take ? Math.ceil(totalCount / take) : 1,
      },
    });

    // Public caching at edge & browser
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'products:write');
    if (!auth.authorized) return auth.response!;

    const body = await req.json();
    const {
      name,
      categorySlug,
      categoryId,
      brandName,
      brandId,
      price,
      salePrice,
      sku,
      stockQuantity = 10,
      warrantyMonths = 12,
      shortDescription = '',
      description = '',
      specifications,
      condition = 'NEW',
      images,
      isFeatured = false,
      isActive = true,
      deliveryInfo,
      sellerId = null,
      approvalStatus = 'APPROVED',
    } = body;

    if (!name || price === undefined || price === null || price === '') {
      return NextResponse.json({ error: 'Product name and price are required' }, { status: 400 });
    }

    // Slug generator
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // Resolve category
    let category = null;
    if (categoryId) {
      category = await prisma.productCategory.findUnique({ where: { id: categoryId } });
    }
    if (!category && categorySlug) {
      category = await prisma.productCategory.findFirst({ where: { slug: categorySlug } });
    }
    if (!category) {
      category = await prisma.productCategory.findFirst();
    }
    if (!category) {
      category = await prisma.productCategory.create({
        data: { name: 'General', slug: 'general' },
      });
    }

    // Resolve brand
    let brand = null;
    if (brandId) {
      brand = await prisma.brand.findUnique({ where: { id: brandId } });
    }
    if (!brand && brandName) {
      brand = await prisma.brand.findFirst({ where: { name: { equals: brandName, mode: 'insensitive' } } });
    }
    if (!brand && brandName) {
      const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      brand = await prisma.brand.create({
        data: { name: brandName, slug: brandSlug || 'generic' },
      });
    }
    if (!brand) {
      brand = await prisma.brand.findFirst();
    }

    // Handle images cleanly
    let formattedImages = '/logo.png';
    if (Array.isArray(images) && images.length > 0) {
      const valid = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
      if (valid.length > 0) formattedImages = valid.join(',');
    } else if (typeof images === 'string' && images.trim().length > 0) {
      formattedImages = images.trim();
    }

    // Ensure unique SKU
    let finalSku = sku ? sku.trim().toUpperCase() : `NE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const existingSku = await prisma.product.findUnique({ where: { sku: finalSku } });
    if (existingSku) {
      finalSku = `${finalSku}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    }

    // Ensure specifications format
    let formattedSpecs = null;
    if (specifications) {
      formattedSpecs = typeof specifications === 'string' ? specifications : JSON.stringify(specifications);
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        categoryId: category.id,
        brandId: brand ? brand.id : null,
        price: Number(price),
        discountPrice: salePrice && Number(salePrice) > 0 ? Number(salePrice) : null,
        sku: finalSku,
        stock: Math.max(0, Number(stockQuantity || 0)),
        warrantyPeriodMonths: Math.max(0, Number(warrantyMonths || 0)),
        shortDescription: shortDescription || name,
        description: description || shortDescription || name,
        specifications: formattedSpecs,
        condition: condition === 'REFURBISHED' ? 'REFURBISHED' : 'NEW',
        images: formattedImages,
        isFeatured: Boolean(isFeatured),
        isActive: Boolean(isActive),
        deliveryInfo: deliveryInfo || 'Delivery within 24-48 hours in Moulvibazar. 3-5 days across Bangladesh.',
        sellerId: sellerId || null,
        approvalStatus: approvalStatus || 'APPROVED',
      },
      include: {
        category: true,
        brand: true,
      },
    });

    // Invalidate cached categories/brands
    cachedCategories = null;
    cachedBrands = null;

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'products:write');
    if (!auth.authorized) return auth.response!;

    const body = await req.json();
    const { id, categorySlug, brandName, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const currentProduct = await prisma.product.findUnique({ where: { id } });
    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (updates.name !== undefined) dataToUpdate.name = updates.name.trim();
    if (updates.price !== undefined) dataToUpdate.price = Number(updates.price);
    if (updates.discountPrice !== undefined || updates.salePrice !== undefined) {
      const discountVal = updates.discountPrice !== undefined ? updates.discountPrice : updates.salePrice;
      dataToUpdate.discountPrice = discountVal && Number(discountVal) > 0 ? Number(discountVal) : null;
    }
    if (updates.stock !== undefined || updates.stockQuantity !== undefined) {
      const stockVal = updates.stock !== undefined ? updates.stock : updates.stockQuantity;
      dataToUpdate.stock = Math.max(0, Number(stockVal));
    }
    if (updates.sku !== undefined) dataToUpdate.sku = updates.sku.trim().toUpperCase();
    if (updates.condition !== undefined) dataToUpdate.condition = updates.condition;
    if (updates.warrantyPeriodMonths !== undefined || updates.warrantyMonths !== undefined) {
      const wVal = updates.warrantyPeriodMonths !== undefined ? updates.warrantyPeriodMonths : updates.warrantyMonths;
      dataToUpdate.warrantyPeriodMonths = Math.max(0, Number(wVal));
    }
    if (updates.shortDescription !== undefined) dataToUpdate.shortDescription = updates.shortDescription;
    if (updates.description !== undefined) dataToUpdate.description = updates.description;
    
    // Images handling
    if (updates.images !== undefined) {
      if (Array.isArray(updates.images)) {
        const valid = updates.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
        dataToUpdate.images = valid.length > 0 ? valid.join(',') : '/logo.png';
      } else if (typeof updates.images === 'string') {
        dataToUpdate.images = updates.images.trim() || '/logo.png';
      }
    }

    if (updates.isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(updates.isFeatured);
    if (updates.isActive !== undefined) dataToUpdate.isActive = Boolean(updates.isActive);
    if (updates.deliveryInfo !== undefined) dataToUpdate.deliveryInfo = updates.deliveryInfo;

    // Category resolution
    if (updates.categoryId !== undefined) {
      dataToUpdate.categoryId = updates.categoryId;
    } else if (categorySlug) {
      const cat = await prisma.productCategory.findFirst({ where: { slug: categorySlug } });
      if (cat) dataToUpdate.categoryId = cat.id;
    }

    // Brand resolution
    if (updates.brandId !== undefined) {
      dataToUpdate.brandId = updates.brandId;
    } else if (brandName) {
      let b = await prisma.brand.findFirst({ where: { name: { equals: brandName, mode: 'insensitive' } } });
      if (!b) {
        b = await prisma.brand.create({
          data: { name: brandName, slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        });
      }
      dataToUpdate.brandId = b.id;
    }

    if (updates.sellerId !== undefined) dataToUpdate.sellerId = updates.sellerId || null;
    if (updates.approvalStatus !== undefined) dataToUpdate.approvalStatus = updates.approvalStatus;
    if (updates.specifications !== undefined) {
      dataToUpdate.specifications = typeof updates.specifications === 'string'
        ? updates.specifications
        : JSON.stringify(updates.specifications);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: true,
        brand: true,
        seller: true,
      },
    });

    // Record audit log
    try {
      await recordAuditLog({
        userId: auth.session?.id,
        userRole: auth.session?.role,
        action: 'UPDATE_PRODUCT',
        entity: 'Product',
        entityId: id,
        previousData: { price: currentProduct.price, stock: currentProduct.stock, isActive: currentProduct.isActive, approvalStatus: currentProduct.approvalStatus },
        newData: dataToUpdate,
      });
    } catch (auditErr) {
      console.warn('Audit log write error:', auditErr);
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'products:write');
    if (!auth.authorized) return auth.response!;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: { take: 1 },
        emiAccounts: { take: 1 },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const hasOrderHistory = product.orderItems.length > 0 || product.emiAccounts.length > 0;

    // Safety rule: never permanently delete products with order history
    if (hasOrderHistory || !permanent) {
      const archived = await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      await prisma.auditLog.create({
        data: {
          action: 'ARCHIVE_PRODUCT',
          entity: 'Product',
          entityId: id,
          newData: JSON.stringify({
            status: 'ARCHIVED',
            reason: hasOrderHistory
              ? 'Archived due to historical sales/financial records protection'
              : 'Archived by administrator',
          }),
        },
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message: hasOrderHistory
          ? 'Product has historical sales records. It has been safely archived instead of permanently deleted.'
          : 'Product archived successfully.',
      });
    }

    // Permanent delete if no financial history and explicitly requested
    await prisma.product.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_PRODUCT_PERMANENT',
        entity: 'Product',
        entityId: id,
        previousData: JSON.stringify({ name: product.name, sku: product.sku }),
      },
    });

    return NextResponse.json({ success: true, permanent: true, message: 'Product permanently removed.' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}


