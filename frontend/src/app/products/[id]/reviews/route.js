import db from "@/models/index.js";
import { auth } from "@/auth"; // your NextAuth export { auth, handlers, ... }
const { Review, User, Product, Purchase } = db;

// Helper: resolve/create local User from Keycloak token
async function getOrCreateUserFromSession(session) {
  if (!session?.user?.sub) return null;
  const keycloakId = session.user.sub;
  const username = session.user.name || session.user.email;
  const email = session.user.email ?? null;
  const name = session.user.name ?? null;

  let user = await User.findOne({ where: { keycloakId } });
  if (!user) {
    user = await User.create({ keycloakId, username, email, name });
  } else {
    let changed = false;
    if (username && user.username !== username) { user.username = username; changed = true; }
    if (email && user.email !== email) { user.email = email; changed = true; }
    if (name && user.name !== name) { user.name = name; changed = true; }
    if (changed) await user.save();
  }
  return user;
}

// Optional: ensure the user purchased this product
async function userPurchasedProduct(userId, productId) {
  if (!Purchase) return true; // if you don't track purchases, allow (or change to false to enforce)
  const count = await Purchase.count({ where: { user_id: userId, product_id: productId, status: "paid" } });
  return count > 0;
}

export async function GET(_req, { params }) {
  const productId = Number(params.id);
  if (!productId) {
    return new Response(JSON.stringify({ error: "Invalid product id" }), { status: 400 });
  }
  const reviews = await Review.findAll({
    where: { product_id: productId },
    order: [["id", "DESC"]],
    include: [{ model: User, as: "user", attributes: ["id", "username", "name"] }],
  });
  return Response.json(reviews);
}

export async function POST(req, { params }) {
  const session = await auth();
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const productId = Number(params.id);
  if (!productId) return new Response(JSON.stringify({ error: "Invalid product id" }), { status: 400 });

  // ensure product exists (optional but nice)
  const product = await db.Product.findByPk(productId);
  if (!product) return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });

  const body = await req.json().catch(() => ({}));
  const rating = Number(body.rating);
  const comment = body.comment ?? "";

  if (!(rating >= 1 && rating <= 5)) {
    return new Response(JSON.stringify({ error: "rating must be 1..5" }), { status: 422 });
  }

  const user = await getOrCreateUserFromSession(session);
  if (!user) return new Response(JSON.stringify({ error: "User not resolved" }), { status: 401 });

  // enforce purchase
  const purchased = await userPurchasedProduct(user.id, productId);
  if (!purchased) {
    return new Response(JSON.stringify({ error: "You can review only products you purchased" }), { status: 403 });
  }

  // one review per user → upsert
  const existing = await Review.findOne({ where: { user_id: user.id, product_id: productId } });
  if (existing) {
    existing.rating = rating;
    existing.comment = comment;
    await existing.save();
    return Response.json(existing);
  } else {
    const created = await Review.create({ user_id: user.id, product_id: productId, rating, comment });
    return new Response(JSON.stringify(created), { status: 201 });
  }
}
