import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPendingProducts, approveProduct, rejectProduct } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import * as mock from "@/lib/db";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: token } } = await supabase.auth.getUser();
  if (!token) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { data: profile } = await supabase.from('users').select('role').eq('id', token.id).single();
  if (!profile || profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const products = await getPendingProducts();
  return NextResponse.json(products);
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: token } } = await supabase.auth.getUser();
  if (!token || (token as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { id, action, reason } = await req.json();
  if (action === "approve") {
    await approveProduct(id);
    return NextResponse.json({ success: true });
  }
  if (action === "reject") {
    if (prisma) {
      await prisma.product.update({
        where: { id },
        data: {
          status: "REJECTED",
          ...(reason && { rejectionReason: reason }),
        },
      });
    } else {
      const prod = (mock as any).products?.find((p: any) => p.id === id);
      if (prod) {
        prod.status = "REJECTED";
        if (reason) prod.rejectionReason = reason;
      }
    }
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
