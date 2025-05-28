import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function getGET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("id");

        // Validate input
        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        // Fetch product from the database
        const product = await PrismaClient.product.findUnique({
            where: { id: parseInt(productId) },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}