import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, description, price, stock, categories } = body;

        // Validate input
        if (!name || !description || !price || !stock || !categories) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Create product in the database
        const newProduct = await Prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: stock ? parseInt(stock) : 0, // Default stock to 0 if not provided
                categories,
            },
        });

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}