import { isIP } from "node:net";
import type { IncomingMessage } from "node:http";

// --- Budgets & Limits ---
export const MEASURED_MAX_DRAWING_BYTES = 1_217_065; // Measured worst-case legal karalama-defteri payload
export const MEASURED_MAX_DRAWING_NODES = 76_330;   // Measured worst-case legal AST node complexity

export const DEFAULT_MAX_PAYLOAD_BYTES = 2 * 1024 * 1024; // 2 MiB (72% headroom over measured max)
export const MAX_JSON_NODES = 120_000;                     // 57% headroom over measured max nodes
export const MAX_JSON_STRING_LENGTH = 1_000;              // 3x headroom over longest actionScope (240 chars)
export const MAX_JSON_ARRAY_LENGTH = 300;                 // 66% headroom over max 180 drawing strokes
export const MAX_JSON_OBJECT_KEYS = 32;                   // 4x headroom over max 7 message envelope keys
export const MAX_JSON_DEPTH = 8;

export const REPLAY_FENCE_CAPACITY_PER_PLAYER = 2048;      // 75s longest scope * 25 submits/sec + margin
export const MAX_TRACKED_IPS = 10_000;
export const IP_ENTRY_TTL_MS = 120_000;                   // 2 minutes of inactivity before pruning
export const IP_CLEANUP_INTERVAL_MS = 60_000;             // Prune expired IPs every 60 seconds
export const MALFORMED_MESSAGE_LIMIT = 5;

// --- Rate Limiting Thresholds ---
// Connection: 100 burst, 2/sec refill (allows 8 players on same NAT to reconnect/refresh concurrently)
export const CONNECTION_BURST = 100;
export const CONNECTION_REFILL_PER_SEC = 2;

// Room Create: 10 burst, 1 every 6s refill (10/min)
export const ROOM_CREATE_BURST = 10;
export const ROOM_CREATE_REFILL_PER_SEC = 1 / 6;

// Room Join: 40 burst, 1/sec refill (allows 8 players on same NAT to join simultaneously)
export const ROOM_JOIN_BURST = 40;
export const ROOM_JOIN_REFILL_PER_SEC = 1;

// Socket Total Messages: 250 burst, 60/sec refill (supports high-frequency inputs + pings)
export const SOCKET_MESSAGE_BURST = 250;
export const SOCKET_MESSAGE_REFILL_PER_SEC = 60;

// Game Submit: 150 burst, 35/sec refill (supports rapid clicking to 100 in asiri-yukleme / butona-bas)
export const GAME_SUBMIT_BURST = 150;
export const GAME_SUBMIT_REFILL_PER_SEC = 35;

// --- Security Logger ---
export function logSecurity(event: string, details: Record<string, unknown>): void {
  const pairs = Object.entries(details)
    .map(([key, value]) => `${key}=${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join(" ");
  console.warn(`[glix-security] ${event}: ${pairs}`);
}

// --- Client IP Resolution (Reverse-Proxy Aware with Trusted Hops) ---
export interface ProxyConfig {
  trustedProxyHops: number;
}

export function parseTrustedProxyHops(envValue: string | undefined): number {
  if (!envValue) return 0;
  const parsed = Number(envValue.trim());
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

export function resolveClientIp(request: IncomingMessage, trustedProxyHops: number): string {
  const directRemote = request.socket.remoteAddress || "127.0.0.1";

  if (trustedProxyHops <= 0) {
    return directRemote;
  }

  const xff = request.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim().length > 0) {
    const hops = xff.split(",").map((part) => part.trim()).filter(Boolean);
    if (hops.length >= trustedProxyHops) {
      const candidate = hops[hops.length - trustedProxyHops]!;
      if (isIP(candidate)) {
        return candidate;
      }
    }
  }

  // If exactly 1 trusted proxy hop and X-Real-IP is present and valid, accept it
  if (trustedProxyHops === 1) {
    const realIp = request.headers["x-real-ip"];
    if (typeof realIp === "string" && isIP(realIp.trim())) {
      return realIp.trim();
    }
  }

  return directRemote;
}

// --- Origin Policy ---
export function normalizeOrigin(rawOrigin: string): string {
  return rawOrigin.trim().toLowerCase().replace(/\/+$/, "");
}

export interface OriginPolicyConfig {
  allowedOrigins: ReadonlySet<string>;
  allowNoOrigin: boolean;
  isProduction: boolean;
}

export function createOriginPolicy(env: NodeJS.ProcessEnv): OriginPolicyConfig {
  const isProduction = env.NODE_ENV === "production";

  // Parse allowed origins from ALLOWED_ORIGINS, GLIX_ALLOWED_ORIGINS, or GLIX_PUBLIC_ORIGIN
  const rawOrigins = env.ALLOWED_ORIGINS || env.GLIX_ALLOWED_ORIGINS || env.GLIX_PUBLIC_ORIGIN || "";
  const originList = rawOrigins
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
  const allowedOrigins = new Set<string>(originList);

  // allowNoOrigin: defaults to false in production, true in dev/test
  let allowNoOrigin = !isProduction;
  if (env.ALLOW_NO_ORIGIN !== undefined) {
    const val = env.ALLOW_NO_ORIGIN.trim().toLowerCase();
    allowNoOrigin = val === "true" || val === "1";
  }

  return {
    allowedOrigins,
    allowNoOrigin,
    isProduction
  };
}

export function validateOrigin(
  originHeader: string | undefined,
  policy: OriginPolicyConfig
): { allowed: boolean; reason?: string } {
  if (!originHeader || originHeader.trim() === "") {
    if (policy.allowNoOrigin) {
      return { allowed: true };
    }
    return { allowed: false, reason: "missing_origin" };
  }

  const normalized = normalizeOrigin(originHeader);

  if (policy.allowedOrigins.size > 0) {
    if (policy.allowedOrigins.has(normalized)) {
      return { allowed: true };
    }
    return { allowed: false, reason: "origin_not_allowed" };
  }

  // When no origins explicitly configured:
  if (!policy.isProduction) {
    // In development: permit localhost and loopback origins
    try {
      const parsed = new URL(normalized);
      const hostname = parsed.hostname;
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]" ||
        hostname === "::1"
      ) {
        return { allowed: true };
      }
    } catch {
      return { allowed: false, reason: "malformed_origin" };
    }
    return { allowed: false, reason: "origin_not_allowed" };
  }

  // In production with no configured origins: fail closed
  return { allowed: false, reason: "no_origins_configured" };
}

// --- JSON Complexity & Structure Budget ---
export interface ComplexityBudgetOptions {
  maxDepth?: number;
  maxNodes?: number;
  maxStringLength?: number;
  maxArrayLength?: number;
  maxObjectKeys?: number;
}

export function validateJsonComplexity(
  value: unknown,
  options: ComplexityBudgetOptions = {}
): boolean {
  const maxDepth = options.maxDepth ?? MAX_JSON_DEPTH;
  const maxNodes = options.maxNodes ?? MAX_JSON_NODES;
  const maxStringLength = options.maxStringLength ?? MAX_JSON_STRING_LENGTH;
  const maxArrayLength = options.maxArrayLength ?? MAX_JSON_ARRAY_LENGTH;
  const maxObjectKeys = options.maxObjectKeys ?? MAX_JSON_OBJECT_KEYS;

  let totalNodes = 0;

  function walk(current: unknown, depth: number): boolean {
    totalNodes += 1;
    if (totalNodes > maxNodes) {
      return false;
    }

    if (depth > maxDepth) {
      return false;
    }

    if (current === null) {
      return true;
    }

    if (typeof current === "string") {
      return current.length <= maxStringLength;
    }

    if (typeof current === "number") {
      return Number.isFinite(current);
    }

    if (typeof current === "boolean") {
      return true;
    }

    if (Array.isArray(current)) {
      if (current.length > maxArrayLength) {
        return false;
      }
      for (let i = 0; i < current.length; i += 1) {
        if (!walk(current[i], depth + 1)) {
          return false;
        }
      }
      return true;
    }

    if (typeof current === "object") {
      const keys = Object.keys(current as Record<string, unknown>);
      if (keys.length > maxObjectKeys) {
        return false;
      }
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i]!;
        if (key.length > maxStringLength) {
          return false;
        }
        if (!walk((current as Record<string, unknown>)[key], depth + 1)) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  return walk(value, 0);
}

// --- Token Bucket ---
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    readonly capacity: number,
    readonly refillRatePerSec: number,
    now = Date.now()
  ) {
    this.capacity = capacity;
    this.refillRatePerSec = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefill = now;
  }

  tryConsume(count = 1, now = Date.now()): boolean {
    const elapsed = Math.max(0, (now - this.lastRefill) / 1000);
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRatePerSec);
    this.lastRefill = now;

    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }
}

// --- Bounded IP Rate Limiter ---
interface IpRecord {
  connectionBucket: TokenBucket;
  roomCreateBucket: TokenBucket;
  roomJoinBucket: TokenBucket;
  lastSeen: number;
}

export class BoundedIpRateLimiter {
  private readonly entries = new Map<string, IpRecord>();
  private readonly cleanupTimer: NodeJS.Timeout;

  constructor(
    readonly maxTrackedIps = MAX_TRACKED_IPS,
    readonly ttlMs = IP_ENTRY_TTL_MS,
    cleanupIntervalMs = IP_CLEANUP_INTERVAL_MS
  ) {
    this.cleanupTimer = setInterval(() => this.pruneExpired(), cleanupIntervalMs);
    this.cleanupTimer.unref();
  }

  private getOrCreate(ip: string, now: number): IpRecord {
    let record = this.entries.get(ip);

    if (record) {
      // Re-insert to refresh LRU order
      this.entries.delete(ip);
      record.lastSeen = now;
      this.entries.set(ip, record);
      return record;
    }

    // Hard bound: evict oldest entry if at capacity
    if (this.entries.size >= this.maxTrackedIps) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey !== undefined) {
        this.entries.delete(oldestKey);
      }
    }

    record = {
      connectionBucket: new TokenBucket(CONNECTION_BURST, CONNECTION_REFILL_PER_SEC, now),
      roomCreateBucket: new TokenBucket(ROOM_CREATE_BURST, ROOM_CREATE_REFILL_PER_SEC, now),
      roomJoinBucket: new TokenBucket(ROOM_JOIN_BURST, ROOM_JOIN_REFILL_PER_SEC, now),
      lastSeen: now
    };

    this.entries.set(ip, record);
    return record;
  }

  checkConnection(ip: string, now = Date.now()): boolean {
    const record = this.getOrCreate(ip, now);
    return record.connectionBucket.tryConsume(1, now);
  }

  checkRoomCreate(ip: string, now = Date.now()): boolean {
    const record = this.getOrCreate(ip, now);
    return record.roomCreateBucket.tryConsume(1, now);
  }

  checkRoomJoin(ip: string, now = Date.now()): boolean {
    const record = this.getOrCreate(ip, now);
    return record.roomJoinBucket.tryConsume(1, now);
  }

  get size(): number {
    return this.entries.size;
  }

  pruneExpired(now = Date.now()): void {
    for (const [ip, record] of this.entries.entries()) {
      if (now - record.lastSeen > this.ttlMs) {
        this.entries.delete(ip);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupTimer);
    this.entries.clear();
  }
}

// --- Per-Socket Limiter ---
export class SocketRateLimiter {
  readonly messageBucket: TokenBucket;
  readonly submitBucket: TokenBucket;
  private malformedCount = 0;
  private lastMalformedReset: number;

  constructor(now = Date.now()) {
    this.messageBucket = new TokenBucket(SOCKET_MESSAGE_BURST, SOCKET_MESSAGE_REFILL_PER_SEC, now);
    this.submitBucket = new TokenBucket(GAME_SUBMIT_BURST, GAME_SUBMIT_REFILL_PER_SEC, now);
    this.lastMalformedReset = now;
  }

  checkMessage(now = Date.now()): boolean {
    return this.messageBucket.tryConsume(1, now);
  }

  checkSubmit(now = Date.now()): boolean {
    return this.submitBucket.tryConsume(1, now);
  }

  recordMalformed(now = Date.now()): boolean {
    // Reset window every 60s
    if (now - this.lastMalformedReset > 60_000) {
      this.malformedCount = 0;
      this.lastMalformedReset = now;
    }
    this.malformedCount += 1;
    return this.malformedCount > MALFORMED_MESSAGE_LIMIT;
  }
}

// --- Bounded Action Replay Fence ---
export class PlayerActionFence {
  private readonly queue: string[] = [];
  private readonly set = new Set<string>();

  constructor(readonly capacity = REPLAY_FENCE_CAPACITY_PER_PLAYER) {}

  has(actionId: string): boolean {
    return this.set.has(actionId);
  }

  record(actionId: string): void {
    if (this.set.has(actionId)) {
      return;
    }
    if (this.queue.length >= this.capacity) {
      const evicted = this.queue.shift();
      if (evicted !== undefined) {
        this.set.delete(evicted);
      }
    }
    this.queue.push(actionId);
    this.set.add(actionId);
  }

  get size(): number {
    return this.set.size;
  }

  clear(): void {
    this.queue.length = 0;
    this.set.clear();
  }
}

export class MatchReplayFence {
  private readonly playerFences = new Map<string, PlayerActionFence>();

  constructor(readonly perPlayerCapacity = REPLAY_FENCE_CAPACITY_PER_PLAYER) {}

  private getFence(playerId: string): PlayerActionFence {
    let fence = this.playerFences.get(playerId);
    if (!fence) {
      fence = new PlayerActionFence(this.perPlayerCapacity);
      this.playerFences.set(playerId, fence);
    }
    return fence;
  }

  has(playerId: string, actionId: string): boolean {
    const fence = this.playerFences.get(playerId);
    return fence ? fence.has(actionId) : false;
  }

  record(playerId: string, actionId: string): void {
    this.getFence(playerId).record(actionId);
  }

  getPlayerFenceSize(playerId: string): number {
    return this.playerFences.get(playerId)?.size ?? 0;
  }

  removePlayer(playerId: string): void {
    this.playerFences.delete(playerId);
  }

  clear(): void {
    for (const fence of this.playerFences.values()) {
      fence.clear();
    }
    this.playerFences.clear();
  }
}
