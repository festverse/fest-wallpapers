export async function loadCms(): Promise<any> {
  const res = await fetch("/api/cms/content", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("failed to load content");
  }
  return res.json();
}

export async function saveCms(content: any): Promise<boolean> {
  const res = await fetch("/api/cms/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content)
  });
  return res.ok;
}
