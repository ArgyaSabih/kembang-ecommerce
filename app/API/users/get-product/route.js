import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        //get all products from the database
        const products = await PrismaClient.product.findMany({
            include: {
                categories: true, // Include categories if needed
            },
        });

        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}