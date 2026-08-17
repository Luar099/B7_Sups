import { and, desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { assessments, clients, orders, plans, products } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const ownerFallback = "raul.soliveiraa@gmail.com";
const adminEmail = () => String((env as unknown as Record<string, unknown>).B7_ADMIN_EMAIL || ownerFallback).toLowerCase();
const isAdmin = (email?: string | null) => Boolean(email && email.toLowerCase() === adminEmail());

async function seed() {
  const db = getDb();
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (!existing.length) {
    await db.insert(products).values([
      { name: "Creatina Monohidratada", brand: "B7 PURE", category: "Creatina", description: "Força, potência e recuperação com matéria-prima de alta pureza.", size: "300 g · sem sabor", price: 89.9, oldPrice: 129.9, stock: 36, badge: "-31%" },
      { name: "Whey Protein 80%", brand: "B7 PERFORMANCE", category: "Proteína", description: "Proteína concentrada para sua rotina de ganho e recuperação muscular.", size: "900 g · chocolate", price: 139.9, oldPrice: 169.9, stock: 28, badge: "MAIS VENDIDO" },
      { name: "Whey Protein Isolado", brand: "B7 PERFORMANCE", category: "Proteína", description: "Alta concentração proteica, baixo teor de carboidratos e rápida absorção.", size: "900 g · baunilha", price: 189.9, oldPrice: 229.9, stock: 17, badge: "DESTAQUE" },
      { name: "Pré-Treino Black", brand: "B7 ENERGY", category: "Pré-treino", description: "Energia, foco e intensidade para treinos que exigem mais.", size: "300 g · frutas vermelhas", price: 119.9, oldPrice: 149.9, stock: 22, badge: "NOVO" },
      { name: "Multivitamínico Daily", brand: "B7 HEALTH", category: "Vitaminas", description: "Vitaminas e minerais essenciais para completar sua rotina.", size: "60 cápsulas", price: 59.9, oldPrice: 74.9, stock: 41, badge: "-20%" },
      { name: "Combo Evolução", brand: "B7 PROTOCOL", category: "Combos", description: "Whey, creatina e pré-treino em um protocolo completo.", size: "3 produtos", price: 299.9, oldPrice: 369.7, stock: 12, badge: "ECONOMIZE R$ 69" },
    ]);
  }
}

async function sessionData() {
  const user = await getChatGPTUser();
  const role = isAdmin(user?.email) ? "admin" : user ? "client" : "guest";
  return { user, role } as const;
}

export async function GET() {
  try {
    await seed();
    const db = getDb();
    const session = await sessionData();
    const productRows = await db.select().from(products).orderBy(desc(products.id));
    if (!session.user) return Response.json({ session, products: productRows.filter((p) => p.active) });

    await db.insert(clients).values({ email: session.user.email, name: session.user.displayName }).onConflictDoNothing();
    if (session.role === "admin") {
      const [clientRows, orderRows, assessmentRows, planRows] = await Promise.all([
        db.select().from(clients).orderBy(desc(clients.id)),
        db.select().from(orders).orderBy(desc(orders.id)),
        db.select().from(assessments).orderBy(desc(assessments.id)),
        db.select().from(plans).orderBy(desc(plans.id)),
      ]);
      return Response.json({ session, products: productRows, clients: clientRows, orders: orderRows, assessments: assessmentRows, plans: planRows });
    }

    const email = session.user.email;
    const [clientRows, orderRows, assessmentRows, planRows] = await Promise.all([
      db.select().from(clients).where(eq(clients.email, email)).limit(1),
      db.select().from(orders).where(eq(orders.clientEmail, email)).orderBy(desc(orders.id)),
      db.select().from(assessments).where(eq(assessments.clientEmail, email)).orderBy(desc(assessments.id)),
      db.select().from(plans).where(eq(plans.clientEmail, email)).orderBy(desc(plans.updatedAt)),
    ]);
    return Response.json({ session, products: productRows.filter((p) => p.active), client: clientRows[0], orders: orderRows, assessments: assessmentRows, plans: planRows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao carregar dados" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await sessionData();
    if (!session.user) return Response.json({ error: "Entre para continuar" }, { status: 401 });
    const payload = await request.json() as Record<string, unknown>;
    const action = String(payload.action || "");
    const db = getDb();

    if (action === "checkout") {
      const items = Array.isArray(payload.items) ? payload.items : [];
      const total = Number(payload.total || 0);
      if (!items.length || total <= 0) return Response.json({ error: "Carrinho inválido" }, { status: 400 });
      const [order] = await db.insert(orders).values({ clientEmail: session.user.email, total, payment: String(payload.payment || "PIX"), itemsJson: JSON.stringify(items) }).returning();
      return Response.json({ order });
    }

    if (session.role !== "admin") return Response.json({ error: "Acesso exclusivo do administrador" }, { status: 403 });

    if (action === "saveProduct") {
      const input = payload.product as Record<string, unknown>;
      const values = { name: String(input.name), brand: String(input.brand || "B7 NUTRITION"), category: String(input.category), description: String(input.description || ""), size: String(input.size || ""), price: Number(input.price), oldPrice: Number(input.oldPrice || input.price), stock: Number(input.stock || 0), badge: String(input.badge || ""), imageUrl: String(input.imageUrl || ""), active: input.active !== false };
      const id = Number(input.id || 0);
      const [product] = id ? await db.update(products).set(values).where(eq(products.id, id)).returning() : await db.insert(products).values(values).returning();
      return Response.json({ product });
    }
    if (action === "saveClient") {
      const input = payload.client as Record<string, unknown>;
      const email = String(input.email || "").toLowerCase();
      if (!email) return Response.json({ error: "E-mail obrigatório" }, { status: 400 });
      await db.insert(clients).values({ email, name: String(input.name || email), phone: String(input.phone || ""), goal: String(input.goal || "Evolução física"), status: String(input.status || "ATIVO") }).onConflictDoUpdate({ target: clients.email, set: { name: String(input.name || email), phone: String(input.phone || ""), goal: String(input.goal || "Evolução física"), status: String(input.status || "ATIVO") } });
      return Response.json({ ok: true });
    }
    if (action === "updateOrder") {
      await db.update(orders).set({ status: String(payload.status) }).where(eq(orders.id, Number(payload.id)));
      return Response.json({ ok: true });
    }
    if (action === "saveAssessment") {
      const input = payload.assessment as Record<string, unknown>;
      const email = String(input.clientEmail || "").toLowerCase();
      const height = Number(input.height); const weight = Number(input.weight); const waist = Number(input.waist); const neck = Number(input.neck); const hip = Number(input.hip);
      const density = 1.0324 - .19077 * Math.log10(Math.max(waist - neck, 1)) + .15456 * Math.log10(height);
      const bodyFat = Math.min(55, Math.max(3, 495 / density - 450));
      const [assessment] = await db.insert(assessments).values({ clientEmail: email, weight, height, waist, neck, hip, bodyFat, notes: String(input.notes || "") }).returning();
      return Response.json({ assessment });
    }
    if (action === "savePlan") {
      const input = payload.plan as Record<string, unknown>;
      const clientEmail = String(input.clientEmail || "").toLowerCase();
      const type = String(input.type || "nutrition");
      await db.delete(plans).where(and(eq(plans.clientEmail, clientEmail), eq(plans.type, type)));
      const [plan] = await db.insert(plans).values({ clientEmail, type, title: String(input.title || "Plano personalizado"), contentJson: JSON.stringify(input.content || []) }).returning();
      return Response.json({ plan });
    }
    return Response.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao salvar" }, { status: 500 });
  }
}
