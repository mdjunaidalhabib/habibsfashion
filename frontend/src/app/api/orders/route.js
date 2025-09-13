import { getServerSession } from "next-auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await req.json();
  const { items, total } = body || {};
  if (!Array.isArray(items) || !items.length) {
    return new Response(JSON.stringify({ error: "No items" }), { status: 400 });
  }

  await dbConnect();

  const newOrder = await Order.create({
    user: session.user.id,
    items,
    total,
  });

  return new Response(JSON.stringify(newOrder), { status: 201 });
}
