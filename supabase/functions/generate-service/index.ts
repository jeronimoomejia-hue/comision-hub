import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, pdfContent } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const combinedInput = [
      text ? `Texto proporcionado:\n${text}` : "",
      pdfContent ? `Contenido del documento:\n${pdfContent}` : "",
    ].filter(Boolean).join("\n\n");

    if (!combinedInput.trim()) {
      return new Response(JSON.stringify({ error: "No se proporcionó texto ni contenido de documento" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Eres un experto en creación de productos para un marketplace de servicios B2B. 
A partir del texto o documento que te proporcionen, genera la ficha completa del producto en formato JSON.

Responde ÚNICAMENTE con JSON válido, sin texto adicional, con esta estructura exacta:
{
  "name": "Nombre del producto",
  "shortDescription": "Frase corta descriptiva",
  "description": "Descripción completa del producto",
  "category": "Una de: seguros, legal, marketing, ventas, rrhh, contabilidad, tecnología, salud",
  "type": "suscripción o puntual",
  "priceCOP": 150000,
  "vendorCommissionPct": 20,
  "pitchOneLine": "Frase de venta en una línea",
  "pitchThreeLines": "Guión de venta corto de 3 líneas",
  "targetAudience": "Público objetivo",
  "idealClient": "Perfil del cliente ideal",
  "problemSolved": "Problema que resuelve",
  "promisedResult": "Resultado prometido",
  "features": ["Beneficio 1", "Beneficio 2", "Beneficio 3"],
  "objections": [
    {"objection": "Objeción común 1", "response": "Respuesta sugerida 1"},
    {"objection": "Objeción común 2", "response": "Respuesta sugerida 2"}
  ],
  "trainingChapters": [
    {"title": "Introducción al producto", "type": "reading", "duration": "5 min"},
    {"title": "Cómo venderlo", "type": "video", "duration": "10 min"},
    {"title": "Evaluación final", "type": "quiz", "duration": "5 min"}
  ],
  "quizQuestions": [
    {"question": "Pregunta 1", "options": ["Opción A", "Opción B", "Opción C"], "correctIndex": 0},
    {"question": "Pregunta 2", "options": ["Opción A", "Opción B", "Opción C"], "correctIndex": 1}
  ]
}

Infiere precios en COP colombianos. Si no puedes determinar un campo, usa un valor razonable por defecto.
Todo debe estar en español colombiano.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Genera la ficha del producto basándote en esto:\n\n${combinedInput}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados. Agrega fondos en tu workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error al generar el producto" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];
    
    try {
      const parsed = JSON.parse(jsonStr.trim());
      return new Response(JSON.stringify({ service: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(JSON.stringify({ error: "La IA no generó un formato válido. Intenta de nuevo." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("generate-service error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
