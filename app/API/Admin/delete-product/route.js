import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("id");

        // Validate input
        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        // Delete product from the database
        const deletedProduct = await PrismaClient.product.delete({
            where: { id: parseInt(productId) },
        });

        return NextResponse.json(deletedProduct, { status: 200 });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}