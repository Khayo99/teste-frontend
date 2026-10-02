import { HttpResponse, http, type RequestHandler } from "msw";
import { catalogNfts } from "@/features/catalog/data/catalog-fixtures";
import { getNftDetailFixture } from "@/features/nft-detail/data/nft-detail-fixtures";

type User = { id: string; name: string; email: string; passwordHash: string };
type StoredUser = Omit<User, "passwordHash"> & { passwordHash: string };

const USERS_STORAGE_KEY = "kurio.mock.users";
const DEMO_USER: User = {
  id: "user-demo",
  name: "Demo Kurio",
  email: "demo@kurio.test",
  passwordHash: hashPassword("kurio-demo"),
};
const sessions = new Map<string, { userId: string; expiresAt: string }>();
const favorites = new Map<string, Set<string>>();

function hashPassword(password: string) {
  let hash = 2166136261;
  for (let index = 0; index < password.length; index += 1)
    hash = Math.imul(hash ^ password.charCodeAt(index), 16777619);
  return `mock-hash-${(hash >>> 0).toString(16)}`;
}

function readUsers(): User[] {
  try {
    const stored = JSON.parse(
      localStorage.getItem(USERS_STORAGE_KEY) ?? "null",
    ) as StoredUser[] | null;
    return stored?.length ? stored : [DEMO_USER];
  } catch {
    return [DEMO_USER];
  }
}

function writeUsers(users: User[]) {
  const safeUsers: StoredUser[] = users.map(
    ({ id, name, email, passwordHash }) => ({ id, name, email, passwordHash }),
  );
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(safeUsers));
}

function publicUser(user: User) {
  return { id: user.id, name: user.name, email: user.email };
}
function sessionResponse(token: string, user: User) {
  return {
    session: {
      token,
      user: publicUser(user),
      expiresAt: sessions.get(token)?.expiresAt,
    },
  };
}
function bearer(request: Request) {
  return request.headers.get("Authorization")?.replace("Bearer ", "");
}

export const handlers: RequestHandler[] = [
  http.get("/api/nfts", () => HttpResponse.json({ items: catalogNfts })),
  http.get("/api/nfts/:id", ({ request, params }) => {
    const nft = getNftDetailFixture(String(params.id));
    if (!nft)
      return HttpResponse.json(
        { message: "NFT não encontrado." },
        { status: 404 },
      );
    const token = bearer(request);
    const session = token ? sessions.get(token) : undefined;
    const isFavorite = session
      ? (favorites.get(session.userId)?.has(nft.id) ?? false)
      : undefined;
    return HttpResponse.json({ nft: { ...nft, isFavorite } });
  }),
  http.post("/api/favorites/:nftId", ({ request, params }) => {
    const token = bearer(request);
    const session = token ? sessions.get(token) : undefined;
    if (!session)
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      );
    const nftId = String(params.nftId);
    const userFavorites = favorites.get(session.userId) ?? new Set<string>();
    userFavorites.add(nftId);
    favorites.set(session.userId, userFavorites);
    return HttpResponse.json({ isFavorite: true });
  }),
  http.delete("/api/favorites/:nftId", ({ request, params }) => {
    const token = bearer(request);
    const session = token ? sessions.get(token) : undefined;
    if (!session)
      return HttpResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      );
    favorites.get(session.userId)?.delete(String(params.nftId));
    return HttpResponse.json({ isFavorite: false });
  }),
  http.post("/api/auth/register", async ({ request }) => {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };
    const users = readUsers();
    const email = body.email?.trim().toLowerCase() ?? "";
    if (!body.name || !email || !body.password)
      return HttpResponse.json(
        {
          message: "Revise os campos informados.",
          fieldErrors: { form: "Revise os campos informados." },
        },
        { status: 400 },
      );
    if (users.some((user) => user.email === email))
      return HttpResponse.json(
        {
          message: "Este e-mail já está cadastrado.",
          fieldErrors: { email: "Este e-mail já está cadastrado." },
        },
        { status: 409 },
      );
    const user: User = {
      id: `user-${crypto.randomUUID()}`,
      name: body.name.trim(),
      email,
      passwordHash: hashPassword(body.password),
    };
    users.push(user);
    writeUsers(users);
    const token = `mock-token-${user.id}`;
    sessions.set(token, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    return HttpResponse.json(sessionResponse(token, user), { status: 201 });
  }),
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const user = readUsers().find(
      (candidate) =>
        candidate.email === body.email?.trim().toLowerCase() &&
        candidate.passwordHash === hashPassword(body.password ?? ""),
    );
    if (!user)
      return HttpResponse.json(
        { message: "E-mail ou senha inválidos." },
        { status: 401 },
      );
    const token = `mock-token-${user.id}`;
    sessions.set(token, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    return HttpResponse.json(sessionResponse(token, user));
  }),
  http.get("/api/auth/session", ({ request }) => {
    const token = bearer(request);
    const userId = token?.replace("mock-token-", "");
    const user = userId
      ? readUsers().find((candidate) => candidate.id === userId)
      : undefined;
    const active = token ? sessions.get(token) : undefined;
    if (
      !token ||
      !user ||
      (active && new Date(active.expiresAt) <= new Date()) ||
      new URL(request.url).searchParams.get("expired") === "1"
    )
      return HttpResponse.json(
        { message: "Sessão expirada." },
        { status: 401 },
      );
    if (!active)
      sessions.set(token, {
        userId: user.id,
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      });
    return HttpResponse.json(sessionResponse(token, user));
  }),
  http.post("/api/auth/logout", ({ request }) => {
    const token = bearer(request);
    if (token) sessions.delete(token);
    return new HttpResponse(null, { status: 204 });
  }),
];
