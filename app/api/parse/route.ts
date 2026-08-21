import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text = "" } = await req.json();
  const phone = text.match(/(?:\+?\d[\d\s-]{7,})/)?.[0]?.trim() || "";
  const amount = text.match(/(?:\$|SGD\s*)([\d,]+(?:\.\d+)?)/i)?.[1];
  const customer = text
    .replace(/create\s+(an\s+)?invoice\s+(for\s+)?/i,"")
    .split(/,|\s+for\s+/i)[0]
    .trim();

  return NextResponse.json({
    customer: customer || "Customer",
    phone,
    items: [{
      description: text.match(/for\s+(.+?)(?:\s+\$|,\s*\$|$)/i)?.[1]?.trim() || "Service",
      qty: 1,
      price: amount ? Number(amount.replace(/,/g,"")) : 0
    }]
  });
}