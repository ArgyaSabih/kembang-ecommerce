import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function UPDATE(request) {
    try {
        const body = await request.json();
        const { id, name, description, price, stock, categories } = body;

        // Validate input
        if (!id || !name || !description || !price || !stock || !categories) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Update product in the database
        const updatedProduct = await PrismaClient.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                categories,
            },
        });

        return NextResponse.json(updatedProduct, { status: 200 });
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}