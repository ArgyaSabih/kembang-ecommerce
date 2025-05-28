import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, productId, quantity } = body;

        // Validate input
        if (!userId || !productId || !quantity) {
            return NextResponse.json({
                error: "User ID, Product ID, and Quantity are required"
            }, { status: 400 });
        }

        const parsedUserId = parseInt(userId);
        const parsedProductId = parseInt(productId);
        const parsedQuantity = parseInt(quantity);

        // Validate parsed values
        if (isNaN(parsedUserId) || isNaN(parsedProductId) || isNaN(parsedQuantity)) {
            return NextResponse.json({
                error: "Invalid input: All IDs and quantity must be valid numbers"
            }, { status: 400 });
        }

        if (parsedQuantity <= 0) {
            return NextResponse.json({
                error: "Quantity must be greater than 0"
            }, { status: 400 });
        }

        // Start a transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
            // Check if product exists and has sufficient stock
            const product = await tx.product.findUnique({
                where: { id: parsedProductId },
            });

            if (!product) {
                throw new Error("Product not found");
            }

            if (product.stock < parsedQuantity) {
                throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${parsedQuantity}`);
            }

            // Check if user exists (optional, tergantung struktur database kamu)
            const user = await tx.user.findUnique({
                where: { id: parsedUserId },
            });

            if (!user) {
                throw new Error("User not found");
            }

            // Create order item
            const newOrderItem = await tx.orderItem.create({
                data: {
                    userId: parsedUserId,
                    productId: parsedProductId,
                    quantity: parsedQuantity,
                    price: product.price * parsedQuantity, // Simpan harga saat order dibuat
                    totalPrice: product.price * parsedQuantity,
                },
                include: {
                    product: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                }
            });

            // Update product stock
            const updatedProduct = await tx.product.update({
                where: { id: parsedProductId },
                data: {
                    stock: product.stock - parsedQuantity,
                    updatedAt: new Date(),
                },
            });

            return {
                orderItem: newOrderItem,
                updatedProduct: updatedProduct,
            };
        });

        return NextResponse.json({
            message: "Order item created successfully",
            data: result.orderItem,
            productStock: result.updatedProduct.stock,
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating order item:", error);

        // Handle specific errors
        if (error.message === "Product not found") {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        if (error.message === "User not found") {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (error.message.includes("Insufficient stock")) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({
            error: "Failed to create order item",
            details: error.message
        }, { status: 500 });

    } finally {
        await prisma.$disconnect();
    }
}