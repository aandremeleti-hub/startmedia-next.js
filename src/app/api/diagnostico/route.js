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

    // Usando fetch direto para garantir compatibilidade máxima sem depender das particularidades do novo SDK
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API do Gemini: ${errorText}`);
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
