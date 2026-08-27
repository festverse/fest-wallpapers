import { NextRequest, NextResponse } from "next/server";
import { getCmsContent, saveCmsContent, getR2 } from "@/lib/cms";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  const blob = file as File;
  if (blob.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "file too large" }, { status: 413 });
  }
  const id = crypto.randomUUID();
  const safeName = blob.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  let url = "";
  const r2 = await getR2();
  if (r2) {
    const key = "media/" + id + "-" + safeName;
    await r2.put(key, await blob.arrayBuffer(), {
      httpMetadata: { contentType: blob.type || "application/octet-stream" }
    });
    url = "/api/cms/media/file?key=" + encodeURIComponent(key);
  } else {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    url = "data:" + (blob.type || "image/png") + ";base64," + btoa(binary);
  }
  const content = await getCmsContent();
  const media = Array.isArray(content.media) ? content.media : [];
  const entry = { id, name: safeName, url, type: blob.type || "", size: blob.size, createdAt: Date.now() };
  const updated = { ...content, media: [entry, ...media] };
  await saveCmsContent(updated);
  return NextResponse.json(entry);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }
  const content = await getCmsContent();
  const media = Array.isArray(content.media) ? content.media : [];
  const target = media.find((m: any) => m.id === id);
  if (target && typeof target.url === "string" && target.url.startsWith("/api/cms/media/file")) {
    const r2 = await getR2();
    if (r2) {
      try {
        const key = new URL(target.url, "https://x.local").searchParams.get("key");
        if (key) {
          await r2.delete(key);
        }
      } catch (error) {
        await saveCmsContent(content);
      }
    }
  }
  const updated = { ...content, media: media.filter((m: any) => m.id !== id) };
  await saveCmsContent(updated);
  return NextResponse.json({ ok: true });
}
