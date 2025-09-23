import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  UploadedFile,
  UseInterceptors,
  Headers,
  NotFoundException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly prisma: PrismaService,
  ) {}

  // Test route
  @Get('test')
  async testRoute() {
    return { message: 'Test route works!' };
  }

  // Get inventory products for a distributor
  @Get('distributor-inventory')
  async getInventoryProducts(
    @Headers('x-user-id') userId: string,
    @Query('page') page: string = '0',
    @Query('limit') limit: string = '20'
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    return this.productsService.getInventoryProducts(userId, pageNum, limitNum);
  }

  // Get inventory count for a distributor (replaces stats service)
  @Get('inventory-count')
  async getInventoryCount(@Headers('x-user-id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const inventoryCounts = await this.productsService.getInventoryCounts(userId);
    
    // Return in the same format the frontend expects
    return {
      activeProducts: inventoryCounts.total,
      totalProducts: inventoryCounts.total,
      myProducts: inventoryCounts.total,
      identifiedProducts: inventoryCounts.identified,
      unidentifiedProducts: inventoryCounts.unidentified,
    };
  }

  // Search products
  @Get()
  findAll(@Query('search') searchQuery: string) {
    if (!searchQuery) {
      return []; // Return empty array if search is empty
    }
    return this.productsService.findAll(searchQuery);
  }

  // Search products with available inventory (distributors) or get inventory
  @Get('available')
  async findAvailableProducts(
    @Query('search') searchQuery: string, 
    @Query('page') page: string = '0',
    @Query('limit') limit: string = '20',
    @Headers('x-user-id') userId?: string
  ) {
    // If no search query but userId is provided, return inventory
    if (!searchQuery && userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found.`);
      }

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      
      return this.productsService.getInventoryProducts(userId, pageNum, limitNum);
    }
    
    if (!searchQuery) {
      return []; // Return empty array if search is empty
    }
    return this.productsService.findAvailableProducts(searchQuery);
  }


  // Upload inventory CSV for distributor mapping
  @Post('upload-inventory')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, 'inventory-' + uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, callback) => {
      const allowedMimes = ['text/csv'];
      if (!allowedMimes.includes(file.mimetype)) {
        return callback(new Error('Only CSV files are allowed'), false);
      }
      callback(null, true);
    },
  }))
  async uploadInventory(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-user-id') userId: string,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    try {
      // Convert file to buffer for processing
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(file.path);
      
      const result = await this.productsService.uploadInventory(fileBuffer, userId);
      
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      
      return result;
    } catch (error) {
      // Clean up uploaded file on error
      const fs = require('fs');
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  // Get NotFound entries for a distributor
  @Get('not-found')
  async getNotFoundEntries(@Headers('x-user-id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return this.productsService.getNotFoundEntries(userId);
  }

  // Clear NotFound entries for a distributor
  @Delete('not-found')
  async clearNotFoundEntries(@Headers('x-user-id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return this.productsService.clearNotFoundEntries(userId);
  }

  // Clear all inventory for a distributor
  @Delete('clear-inventory')
  async clearInventory(
    @Headers('x-user-id') userId: string,
    @Query('deleteActiveBids') deleteActiveBids?: string
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const shouldDeleteBids = deleteActiveBids === 'true';
    return this.productsService.clearInventory(userId, shouldDeleteBids);
  }

  // Clear individual products for a distributor
  @Delete('clear-individual-products')
  async clearIndividualProducts(
    @Headers('x-user-id') userId: string,
    @Body() body: { productIds: number[] }
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return this.productsService.clearIndividualProducts(userId, body.productIds);
  }

  // Batch update product information
  @Post('batch-update')
  async batchUpdateProducts(
    @Headers('x-user-id') userId: string,
    @Body() body: { updates: Array<{
      productId: number;
      mrp?: number;
      batch?: string;
      expiry?: string;
    }> }
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return this.productsService.batchUpdateProducts(body.updates);
  }
}