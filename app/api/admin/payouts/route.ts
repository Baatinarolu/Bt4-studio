import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || (token as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json([
    { id: "p1", sellerId: "u1", amount: 71.2, status: "PENDING", walletAddress: "TE7p...xyz", createdAt: new Date() }
  ]);
}

export async function PATCH(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || (token as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { id, action, txHash } = await req.json();
  return NextResponse.json({ success: true, message: `Payout ${action} (tx: ${txHash || "manual"})` });
}
