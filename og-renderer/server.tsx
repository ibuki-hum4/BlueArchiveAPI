import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import React from "react";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

type RenderPayload = {
  title: string;
  subtitle: string;
  rarity: string;
  weapon: string;
  city: string;
  outdoor: string;
  indoor: string;
};

const WIDTH = 1200;
const HEIGHT = 630;
const PORT = Number.parseInt(process.env.PORT ?? "8787", 10);
const FOOTER_URL = process.env.OGP_FOOTER_URL ?? "bluearchive-api.skyia.jp";
const FONT_FAMILY = "BIZ UDPGothic";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function clampText(value: unknown, maxLen: number): string {
  const text = typeof value === "string" ? value.trim() : "";
  return text.slice(0, maxLen);
}

function terrainAccent(value: string): string {
  const v = value.trim().toUpperCase();
  switch (v) {
    case "S":
      return "#10B981";
    case "A":
      return "#3B82F6";
    case "B":
      return "#F59E0B";
    case "C":
      return "#F97316";
    case "D":
      return "#EF4444";
    default:
      return "#94A3B8";
  }
}

async function loadFontBuffer(fileName: string, explicitPath?: string): Promise<Buffer> {
  const localPath = join(__dirname, "fonts", fileName);
  if (existsSync(localPath)) {
    return readFile(localPath);
  }

  if (explicitPath && existsSync(explicitPath)) {
    return readFile(explicitPath);
  }

  const fallbackPaths = [
    `/usr/share/fonts/noto/${fileName}`,
    `/usr/share/fonts/truetype/noto/${fileName}`,
    `C:/Windows/Fonts/${fileName}`
  ];

  for (const p of fallbackPaths) {
    if (existsSync(p)) {
      return readFile(p);
    }
  }

  throw new Error(
    `font not found: ${fileName} (set OGP_FONT_REGULAR_PATH/OGP_FONT_BOLD_PATH or place files in og-renderer/fonts)`
  );
}

async function loadFontFromCandidates(candidates: string[], explicitPath?: string): Promise<Buffer> {
  if (explicitPath && existsSync(explicitPath)) {
    return readFile(explicitPath);
  }

  for (const candidate of candidates) {
    try {
      return await loadFontBuffer(candidate, explicitPath);
    } catch {
      // Try next candidate.
    }
  }

  throw new Error(`font not found in candidates: ${candidates.join(", ")}`);
}

const fontCachePromise = Promise.all([
  loadFontFromCandidates(
    ["BIZUDPGothic-Regular.ttf", "BIZUDPGothicR.ttf", "BIZ-UDPGothicR.ttc"],
    process.env.OGP_FONT_REGULAR_PATH
  ),
  loadFontFromCandidates(
    ["BIZUDPGothic-Bold.ttf", "BIZUDPGothicB.ttf", "BIZ-UDPGothicB.ttc"],
    process.env.OGP_FONT_BOLD_PATH
  )
]).then(([regular, bold]) => ({ regular, bold }));

function validatePayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return "request body must be an object";
  }

  const obj = payload as Record<string, unknown>;
  const fields = ["title", "subtitle", "rarity", "weapon", "city", "outdoor", "indoor"];
  for (const field of fields) {
    if (typeof obj[field] !== "string" || obj[field].trim() === "") {
      return `missing or invalid field: ${field}`;
    }
  }

  return null;
}

function toPayload(input: unknown): RenderPayload {
  const obj = input as Record<string, unknown>;
  return {
    title: clampText(obj.title, 42),
    subtitle: clampText(obj.subtitle, 72),
    rarity: clampText(obj.rarity, 8),
    weapon: clampText(obj.weapon, 10),
    city: clampText(obj.city, 2).toUpperCase(),
    outdoor: clampText(obj.outdoor, 2).toUpperCase(),
    indoor: clampText(obj.indoor, 2).toUpperCase()
  };
}

async function renderImage(payload: RenderPayload): Promise<Uint8Array> {
  const fonts = await fontCachePromise;

  const svg = await satori(
    <div
      style={{
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        display: "flex",
        backgroundColor: "#F1F5F9",
        padding: "40px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: "26px",
          backgroundColor: "#FFFFFF",
          border: "2px solid #CBD5E1",
          padding: "44px 64px",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div
            style={{
              minWidth: "96px",
              height: "48px",
              padding: "0 18px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 700,
              color: "#FFFFFF",
              backgroundColor: "#A855F7"
            }}
          >
            {payload.rarity}
          </div>

          <div
            style={{
              minWidth: "96px",
              height: "48px",
              padding: "0 18px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 400,
              color: "#475569",
              backgroundColor: "#E2E8F0"
            }}
          >
            {payload.weapon}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: "20px",
            flex: 1
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#0F172A",
              lineHeight: 1.05,
              maxWidth: "900px"
            }}
          >
            {payload.title}
          </div>

          <div
            style={{
              fontSize: "32px",
              fontWeight: 400,
              color: "#475569",
              lineHeight: 1.2,
              maxWidth: "900px"
            }}
          >
            {payload.subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end"
          }}
        >
          <div style={{ display: "flex", gap: "18px" }}>
            {[
              ["市街地", payload.city],
              ["屋外", payload.outdoor],
              ["屋内", payload.indoor]
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  width: "190px",
                  height: "88px",
                  borderRadius: "12px",
                  border: "1.5px solid #CBD5E1",
                  backgroundColor: "#F1F5F9",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 400,
                    color: "#64748B"
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    width: "52px",
                    height: "38px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "34px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    backgroundColor: terrainAccent(value)
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: 400,
              color: "#94A3B8",
              textAlign: "right",
              minWidth: "280px"
            }}
          >
            {FOOTER_URL}
          </div>
        </div>
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: FONT_FAMILY, data: fonts.regular, weight: 400, style: "normal" },
        { name: FONT_FAMILY, data: fonts.bold, weight: 700, style: "normal" }
      ]
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: WIDTH
    }
  });

  return resvg.render().asPng();
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const started = Bun.nanoseconds();
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true });
    }

    if (req.method !== "POST" || url.pathname !== "/render") {
      return Response.json({ error: "not found" }, { status: 404 });
    }

    try {
      const payloadRaw = await req.json();
      const validationErr = validatePayload(payloadRaw);
      if (validationErr) {
        return Response.json({ error: validationErr }, { status: 400 });
      }

      const payload = toPayload(payloadRaw);
      const png = await renderImage(payload);
      const pngBody = Buffer.from(png);

      const elapsedMs = (Bun.nanoseconds() - started) / 1_000_000;
      console.log(`[render] ok ${elapsedMs.toFixed(1)}ms`);

      return new Response(pngBody, {
        status: 200,
        headers: {
          "content-type": "image/png",
          "cache-control": "no-store"
        }
      });
    } catch (err) {
      console.error("[render] failed", err);
      return Response.json({ error: "render failed" }, { status: 500 });
    }
  }
});

console.log(`OGP renderer listening on :${server.port}`);