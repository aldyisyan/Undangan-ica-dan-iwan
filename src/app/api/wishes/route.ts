import { db } from "@/db";
import { wishes } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allWishes = await db.select().from(wishes).orderBy(desc(wishes.createdAt));
    return NextResponse.json(allWishes);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, attend, count, message } = body;
    const [newWish] = await db.insert(wishes).values({
      name,
      attend,
      count,
      message,
    }).returning();
    return NextResponse.json(newWish);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
