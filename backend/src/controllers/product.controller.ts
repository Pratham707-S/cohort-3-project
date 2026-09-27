import { Request, Response } from 'express';
import { Product } from '../models/product.model';
import { AuthenticatedRequest } from '../types';

// 1. Create Product (POST /api/products - Authenticated)
export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      imageUrl: imageUrl || undefined,
      createdBy: req.user!._id,
    });

    const savedProduct = await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating product' });
  }
};

// 2. Get All Products (GET /api/products - Public)
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = { $regex: `^${category}$`, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching products' });
  }
};

// 3. Get Single Product by ID (GET /api/products/:id - Public)
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('createdBy', 'name email');
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json({ product });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching product' });
  }
};

// 4. Update Product (PUT /api/products/:id - Authenticated)
export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, imageUrl } = req.body;

    // Check if product exists first
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);
    if (imageUrl !== undefined) product.imageUrl = imageUrl;

    const updatedProduct = await product.save();

    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating product' });
  }
};

// 5. Delete Product (DELETE /api/products/:id - Authenticated)
export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if product exists first
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: 'Product deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting product' });
  }
};
