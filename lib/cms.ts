import defaultContent from "@/data/cms-default.json";

const CMS_KEY = "cms:content:v1";

interface GlobalStore {
  __cmsStore?: Record<string, unknown>;
}

function getMemoryStore(): Record<string, unknown> {
  const g = globalThis as GlobalStore;
  if (!g.__cmsStore) {
    g.__cmsStore = {};
  }
  return g.__cmsStore;
}

async function getKv(): Promise<any> {
  try {
    const mod = await import("@cloudflare/next-on-pages");
    if (mod && typeof mod.getRequestContext === "function") {
      const context = mod.getRequestContext();
      if (context && context.env && (context.env as any).CMS_KV) {
        return (context.env as any).CMS_KV;
      }
    }
  } catch (error) {
    return null;
  }
  return null;
}

export async function getCmsContent(): Promise<any> {
  const kv = await getKv();
  if (kv) {
    const stored = await kv.get(CMS_KEY, "json");
    if (stored) {
      return { ...defaultContent, ...stored };
    }
    return defaultContent;
  }
  const memory = getMemoryStore();
  if (memory[CMS_KEY]) {
    return { ...defaultContent, ...(memory[CMS_KEY] as object) };
  }
  return defaultContent;
}

export async function saveCmsContent(content: any): Promise<void> {
  if (!content || typeof content !== "object") {
    return;
  }
  const kv = await getKv();
  if (kv) {
    await kv.put(CMS_KEY, JSON.stringify(content));
    return;
  }
  const memory = getMemoryStore();
  memory[CMS_KEY] = content;
}

export async function getR2(): Promise<any> {
  try {
    const mod = await import("@cloudflare/next-on-pages");
    if (mod && typeof mod.getRequestContext === "function") {
      const context = mod.getRequestContext();
      if (context && context.env && (context.env as any).MEDIA_R2) {
        return (context.env as any).MEDIA_R2;
      }
    }
  } catch (error) {
    return null;
  }
  return null;
}
