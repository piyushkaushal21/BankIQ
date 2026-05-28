import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const apiUrl = () => (process.env.DIFY_API_URL || "https://api.dify.ai/v1").replace(/\/$/, "");
const keyFor = (mode: "ca" | "kyc") =>
  mode === "kyc" ? process.env.DIFY_KYC_API_KEY! : process.env.DIFY_API_KEY!;

export const sendChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      query: z.string().min(1).max(400),
      conversationId: z.string().optional().default(""),
      tabMode: z.enum(["ca", "kyc"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const res = await fetch(`${apiUrl()}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keyFor(data.tabMode)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query: data.query,
        response_mode: "blocking",
        conversation_id: data.conversationId || "",
        user: context.userId,
      }),
    });
    if (res.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Dify chat failed: ${res.status} ${text}`);
    }
    const json = (await res.json()) as {
      answer: string;
      conversation_id: string;
      metadata?: {
        retriever_resources?: Array<{
          document_name?: string;
          page?: number;
          page_number?: number;
          content?: string;
          score?: number;
        }>;
      };
    };
    const citations = (json.metadata?.retriever_resources ?? []).map((r) => ({
      filename: r.document_name ?? "Source",
      page: r.page_number ?? r.page ?? null,
      snippet: r.content ?? "",
    }));
    return {
      answer: json.answer,
      conversationId: json.conversation_id,
      citations,
    };
  });
