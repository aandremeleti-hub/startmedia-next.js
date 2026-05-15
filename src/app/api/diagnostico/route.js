import { NextResponse } from 'next/server';
import { systemPrompt } from '@/lib/systemPrompt';

export async function POST(req) {
  try {
    const { history, userMessage } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key do Gemini não configurada.' }, { status: 500 });
    }

    // Preparar o histórico para a API do Gemini
    // O Gemini usa 'user' e 'model' como roles.
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: 'Entendido. Estou pronto para iniciar o diagnóstico e retornarei apenas JSON válido.' }]
      }
    ];

    if (history && history.length > 0) {
      history.forEach(msg => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
    }

    if (userMessage) {
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });
    }

    // Usando fetch direto para garantir compatibilidade máxima
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: contents,
      generationConfig: {
        temperature: 0.6,
        responseMimeType: "application/json"
      }
    };

    // Retry com backoff para lidar com rate limiting (429)
    const MAX_RETRIES = 3;
    let response;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) break;

      // Se for rate limit, espera e tenta novamente
      if (response.status === 429 && attempt < MAX_RETRIES - 1) {
        const waitMs = (attempt + 1) * 2000; // 2s, 4s, 6s
        console.warn(`Rate limit (429). Tentativa ${attempt + 1}/${MAX_RETRIES}. Aguardando ${waitMs}ms...`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      const errorText = await response.text();
      console.error(`Gemini API error (${response.status}):`, errorText);
      return NextResponse.json(
        {
          error: response.status === 429
            ? 'O serviço está temporariamente sobrecarregado. Tente novamente em alguns segundos.'
            : 'Erro ao processar o diagnóstico. Tente novamente.'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(rawText);
    } catch (e) {
      // Tentar limpar backticks caso o modelo retorne com ```json ... ```
      const cleanedText = rawText.replace(/```json\n?|\n?```/g, '').trim();
      jsonResponse = JSON.parse(cleanedText);
    }

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error('Erro na API de Diagnóstico:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o diagnóstico.' }, { status: 500 });
  }
}
