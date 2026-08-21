import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const invoice = await req.json();
  return NextResponse.json({ ok: true, invoice: { ...invoice, id: `INV-${Date.now()}` } });
}