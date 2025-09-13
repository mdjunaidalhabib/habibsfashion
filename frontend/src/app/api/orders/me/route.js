import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  await dbConnect();
  const list = await Order.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .lean();
  return new Response(JSON.stringify(list), { status: 200 });
}
