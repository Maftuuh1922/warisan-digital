import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, BatikEntity, PengrajinDetailsEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { User, Batik, PengrajinDetails, MLAnalysisResult, MLPrediction } from "@shared/types";
import { REAL_BATIK_DATASET } from "@shared/batik-real-dataset";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- AUTH ROUTES ---
  app.post('/api/auth/login', async (c) => {
    const { email } = await c.req.json<{ email: string }>();
    if (!email) return bad(c, 'Email is required');
    const userEntity = await UserEntity.findByEmail(c.env, email);
    if (!userEntity) {
      return notFound(c, 'User not found');
    }
    // Note: Password check would happen here in a real app
    return ok(c, await userEntity.getState());
  });
  app.post('/api/auth/register', async (c) => {
    const body = await c.req.json();
    const { name, email, storeName, address, phoneNumber, qualificationDocumentUrl } = body;
    if (!name || !email || !storeName || !address || !phoneNumber) {
      return bad(c, 'Missing required fields for registration.');
    }
    const existingUser = await UserEntity.findByEmail(c.env, email);
    if (existingUser) {
      return bad(c, 'Email is already in use.');
    }
    const userId = crypto.randomUUID();
    const newUser: User = {
      id: userId,
      name,
      email,
      role: 'artisan',
      status: 'pending',
    };
    const newDetails: PengrajinDetails = {
      id: userId, // Match PengrajinDetails ID with User ID
      userId,
      storeName,
      address,
      phoneNumber,
      qualificationDocumentUrl: qualificationDocumentUrl || '', // Accept optional URL
    };
    await UserEntity.create(c.env, newUser);
    await PengrajinDetailsEntity.create(c.env, newDetails);
    return ok(c, newUser);
  });
  // --- ARTISAN (ADMIN) ROUTES ---
  app.get('/api/artisans', async (c) => {
    const { items: users } = await UserEntity.list(c.env);
    const artisans = users.filter(u => u.role === 'artisan');
    const artisansWithDetails = await Promise.all(artisans.map(async (artisan) => {
      const detailsEntity = await PengrajinDetailsEntity.findById(c.env, artisan.id);
      const details = detailsEntity ? await detailsEntity.getState() : undefined;
      return { ...artisan, details };
    }));
    return ok(c, { items: artisansWithDetails });
  });
  app.get('/api/artisans/:id', async (c) => {
    const userId = c.req.param('id');
    const userEntity = await UserEntity.findById(c.env, userId);
    if (!userEntity) return notFound(c, 'User not found');
    const user = await userEntity.getState();
    const detailsEntity = await PengrajinDetailsEntity.findById(c.env, user.id);
    const details = detailsEntity ? await detailsEntity.getState() : undefined;
    return ok(c, { ...user, details });
  });
  app.put('/api/artisans/:id/status', async (c) => {
    const userId = c.req.param('id');
    const { status } = await c.req.json<{ status: 'verified' | 'rejected' }>();
    if (!status) return bad(c, 'Status is required');
    const userEntity = await UserEntity.findById(c.env, userId);
    if (!userEntity) return notFound(c, 'User not found');
    await userEntity.patch({ status });
    return ok(c, await userEntity.getState());
  });
  // --- BATIK ROUTES (PUBLIC & ARTISAN) ---
  app.get('/api/batiks', async (c) => {
    await BatikEntity.ensureSeed(c.env);
    const { items } = await BatikEntity.list(c.env);
    return ok(c, { items });
  });
  app.get('/api/batiks/:id', async (c) => {
    const id = c.req.param('id');
    const batik = new BatikEntity(c.env, id);
    if (!(await batik.exists())) return notFound(c, 'Batik not found');
    return ok(c, await batik.getState());
  });
  app.get('/api/batiks/artisan/:artisanId', async (c) => {
    const artisanId = c.req.param('artisanId');
    const { items } = await BatikEntity.list(c.env);
    const artisanBatiks = items.filter(b => b.artisanId === artisanId);
    return ok(c, { items: artisanBatiks });
  });
  // --- PROTECTED ARTISAN BATIK CRUD ---
  app.post('/api/batiks', async (c) => {
    const body = await c.req.json();
    const authHeader = c.req.header('X-User-Email');
    if (!authHeader) return bad(c, 'Auth header missing');
    const userEntity = await UserEntity.findByEmail(c.env, authHeader);
    if (!userEntity) return bad(c, 'User not found');
    const user = await userEntity.getState();
    const newBatik: Batik = {
      id: crypto.randomUUID(),
      name: body.name,
      motif: body.motif,
      origin: body.origin,
      history: body.history,
      imageUrl: body.imageUrl,
      artisanId: user.id,
      artisanName: user.name,
    };
    return ok(c, await BatikEntity.create(c.env, newBatik));
  });
  app.put('/api/batiks/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const batik = new BatikEntity(c.env, id);
    if (!(await batik.exists())) return notFound(c, 'Batik not found');
    await batik.patch(body);
    return ok(c, await batik.getState());
  });
  app.delete('/api/batiks/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await BatikEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // --- ML SIMULATION ROUTE ---
  app.post('/api/classify-batik', async (c) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Shuffle the dataset to get random results
    const shuffled = [...REAL_BATIK_DATASET].sort(() => 0.5 - Math.random());
    const top3 = shuffled.slice(0, 3);
    if (top3.length < 3) {
      return bad(c, 'Not enough data in dataset to simulate.');
    }
    const topPrediction: MLPrediction = {
      motif: top3[0].nama_batik,
      confidence: Math.random() * (0.98 - 0.85) + 0.85, // 85% - 98%
      class_id: Math.floor(Math.random() * 100),
    };
    const otherPredictions: MLPrediction[] = [
      {
        motif: top3[1].nama_batik,
        confidence: Math.random() * (topPrediction.confidence - 0.1 - 0.6) + 0.6, // 60% - (top - 10%)
        class_id: Math.floor(Math.random() * 100),
      },
      {
        motif: top3[2].nama_batik,
        confidence: Math.random() * (topPrediction.confidence - 0.2 - 0.5) + 0.5, // 50% - (top - 20%)
        class_id: Math.floor(Math.random() * 100),
      },
    ];
    const result: MLAnalysisResult = {
      top_prediction: topPrediction,
      other_predictions: otherPredictions,
      pattern_type: Math.random() > 0.5 ? 'Geometric' : 'Non-Geometric',
      philosophy: {
        description: top3[0].makna_batik,
        historical_context: `Batik ${top3[0].nama_batik} berasal dari daerah ${top3[0].daerah_batik} dan merupakan bagian penting dari warisan budaya lokal.`,
      },
      authenticity: {
        label: 'Likely Authentic',
        confidence: Math.random() * (0.99 - 0.90) + 0.90, // 90% - 99%
        features_analyzed: ["Color Palette Consistency", "Wax 'Crackle' Effect", "Motif Symmetry Analysis", "Fabric Weave Pattern"],
      },
    };
    return ok(c, result);
  });
}