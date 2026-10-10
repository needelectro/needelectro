import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const brandSlug = searchParams.get('brand');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const condition = searchParams.get('condition'); // NEW or REFURBISHED

    const whereClause: any = {
      isActive: true,
    };

    if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }

    if (brandSlug) {
      whereClause.brand = { slug: brandSlug };
    }

    if (featured) {
      whereClause.isFeatured = true;
    }

    if (condition) {
      whereClause.condition = condition;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    const [products, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.productCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.brand.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    const formattedProducts = products.map((p: any) => ({
      ...p,
      images: p.images ? p.images.split(',') : [],
      specifications: p.specifications ? JSON.parse(p.specifications) : {},
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      categories,
      brands,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      categorySlug,
      brandName,
      price,
      salePrice,
      sku,
      stockQuantity = 0,
      warrantyMonths = 0,
      shortDescription = '',
      condition = 'NEW',
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    // Slug generator
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

    // Find or create category
    let category = await prisma.productCategory.findFirst({
      where: categorySlug ? { slug: categorySlug } : undefined,
    });
    if (!category) {
      category = await prisma.productCategory.findFirst();
    }
    if (!category) {
      category = await prisma.productCategory.create({
        data: { name: 'General', slug: 'general' },
      });
    }

    // Find or create brand
    let brand = await prisma.brand.findFirst({
      where: brandName ? { name: brandName } : undefined,
    });
    if (!brand) {
      brand = await prisma.brand.findFirst();
    }
    if (!brand) {
      brand = await prisma.brand.create({
        data: { name: brandName || 'Generic', slug: (brandName || 'generic').toLowerCase() },
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId: category.id,
        brandId: brand.id,
        price: Number(price),
        discountPrice: salePrice ? Number(salePrice) : null,
        sku: sku || `NE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        stock: Number(stockQuantity || 10),
        warrantyPeriodMonths: Number(warrantyMonths || 12),
        shortDescription,
        description: shortDescription,
        condition,
        images: '/logo.png',
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const currentProduct = await prisma.product.findUnique({ where: { id } });
    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (updates.name !== undefined) dataToUpdate.name = updates.name;
    if (updates.price !== undefined) dataToUpdate.price = Number(updates.price);
    if (updates.discountPrice !== undefined) {
      dataToUpdate.discountPrice = updates.discountPrice ? Number(updates.discountPrice) : null;
    }
    if (updates.stock !== undefined) dataToUpdate.stock = Number(updates.stock);
    if (updates.sku !== undefined) dataToUpdate.sku = updates.sku;
    if (updates.condition !== undefined) dataToUpdate.condition = updates.condition;
    if (updates.warrantyPeriodMonths !== undefined) {
      dataToUpdate.warrantyPeriodMonths = Number(updates.warrantyPeriodMonths);
    }
    if (updates.shortDescription !== undefined) dataToUpdate.shortDescription = updates.shortDescription;
    if (updates.description !== undefined) dataToUpdate.description = updates.description;
    if (updates.images !== undefined) dataToUpdate.images = Array.isArray(updates.images) ? updates.images.join(',') : updates.images;
    if (updates.isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(updates.isFeatured);
    if (updates.isActive !== undefined) dataToUpdate.isActive = Boolean(updates.isActive);
    if (updates.categoryId !== undefined) dataToUpdate.categoryId = updates.categoryId;
    if (updates.brandId !== undefined) dataToUpdate.brandId = updates.brandId;
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
      },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_PRODUCT',
          entity: 'Product',
          entityId: id,
          previousData: JSON.stringify({ price: currentProduct.price, stock: currentProduct.stock, isActive: currentProduct.isActive }),
          newData: JSON.stringify(dataToUpdate),
        },
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


