import { db } from "@/db";
import { guests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allGuests = await db.select().from(guests);
    return NextResponse.json(allGuests);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, phone, showAkad, showResepsi, hasOverride } = body;
    
    if (id) {
        // Update existing guest
        await db.update(guests).set({
            name,
            phone,
            showAkad,
            showResepsi,
            hasOverride
        }).where(eq(guests.id, id));
        return NextResponse.json({ success: true });
    } else {
        // Create new guest
        const [newGuest] = await db.insert(guests).values({
            name,
            phone,
            showAkad: showAkad ?? true,
            showResepsi: showResepsi ?? true,
            hasOverride: hasOverride ?? false
        }).returning();
        return NextResponse.json(newGuest);
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (id) {
            await db.delete(guests).where(eq(guests.id, id));
        } else {
            // Delete all
            await db.delete(guests);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, sentAt } = body;
        if (id) {
            await db.update(guests).set({
                sentAt: sentAt ? new Date(sentAt) : null
            }).where(eq(guests.id, id));
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
