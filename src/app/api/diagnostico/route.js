import { NextResponse } from 'next/server';
import { systemPrompt } from '@/lib/systemPrompt';
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Constrói o array de conteúdos para o Gemini, garantindo a alternância estrita entre 'user' e 'model'.
 * Skill: prompt-optimizer (Reforço Dinâmico de Formato)
 */
function buildGeminiPayload(history, userMessage) {
  const contents = [];

  // Reforço base de formato JSON
  const JSON_REINFORCEMENT = "\n\n[SISTEMA]: Retorne EXCLUSIVAMENTE um objeto JSON válido seguindo as chaves (isFinal, pergunta, etc) especificadas no system_instruction. Não inclua Markdown, não invente chaves e não adicione texto fora do JSON.";

  // Reforço adicional injetado quando o histórico indica que estamos perto do diagnóstico final.
  // Isso quebra o padrão que o modelo aprendeu de retornar arrays/strings vazios nos turnos do quiz.
  const isFinalTurn = history && history.length >= 10;
  const FINAL_TURN_REINFORCEMENT = isFinalTurn
    ? `\n\n[DIAGNÓSTICO FINAL OBRIGATÓRIO]: Se você já tem informações suficientes do empreendedor, retorne agora "isFinal": true com os seguintes campos OBRIGATORIAMENTE preenchidos com conteúdo REAL baseado na conversa:\n- "servicosRecomendados": array com 2 a 4 nomes dos serviços do portfólio mais relevantes\n- "justificativas": array com objetos {servico, razao, estatistica, fonte, link} para cada serviço\n- "estimativaInvestimento": string com faixa de valores em R$/mês (ex: "R$ 1.500 a R$ 3.000/mês")\n- "disclaimerOrcamento": aviso sobre natureza estimada do orçamento\nNÃO retorne arrays vazios [] nem strings vazias \"\" nesses campos.`
    : '';

  // Mapeia o histórico do frontend para o formato do Gemini
  if (history && history.length > 0) {
    history.forEach(msg => {
      const role = msg.role === 'assistant' ? 'model' : 'user';

      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n\n${msg.content}`;
      } else {
        contents.push({
          role: role,
          parts: [{ text: msg.content }]
        });
      }
    });
  }

  // Adiciona a mensagem atual do usuário com o reforço de JSON (+ reforço de turno final se aplicável)
  if (userMessage) {
    const reinforcedMessage = userMessage + JSON_REINFORCEMENT + FINAL_TURN_REINFORCEMENT;

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n\n${reinforcedMessage}`;
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: reinforcedMessage }]
      });
    }
  }

  return contents;
}

export async function POST(req) {
  try {
    const { history, userMessage } = await req.json();

    // ── SKILL: clean-code (Bypass da Primeira Mensagem) ──
    // Se não há histórico, significa que o chat acabou de iniciar.
    // Retornamos a resposta estática instantaneamente para poupar tokens e evitar alucinações.
    if (!history || history.length === 0) {
      return NextResponse.json({
        isFinal: false,
        encerradoPorOfensa: false,
        perguntaNumero: 1,
        pergunta: "Olá! Sou o agente de diagnóstico digital da STARTMEDIA. Vou fazer algumas perguntas rápidas para entender a situação atual do seu negócio e identificar exatamente onde você pode crescer mais. São no máximo 8 perguntas — e ao final, você recebe um diagnóstico completo com os serviços que mais fazem sentido para o seu caso, além de uma estimativa de investimento.\n\nCuriosidade: este agente que você está usando agora é um exemplo real do que a STARTMEDIA pode criar e integrar de forma personalizada para a sua empresa. 😉\n\nQual é o nicho ou segmento do seu negócio e qual é o seu principal objetivo com a sua presença digital hoje? (Ex: aumentar vendas, atrair mais clientes, automatizar o atendimento, aparecer no Google...)",
        tipo: "texto",
        opcoes: [],
        dadoPesquisa: null
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key do Gemini não configurada.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Passo 2 & Opção A: Construção do Payload com Reforço de JSON
    const contents = buildGeminiPayload(history, userMessage);

    // ── SKILL: nodejs-best-practices (Structured Outputs) ──
    // Definimos o Schema obrigatório para evitar a criação de chaves como "mensagem_de_abertura"
    const responseSchema = {
      type: "OBJECT",
      properties: {
        isFinal: { type: "BOOLEAN" },
        encerradoPorOfensa: { type: "BOOLEAN" },
        perguntaNumero: { type: "INTEGER" },
        pergunta: { type: "STRING" },
        tipo: { type: "STRING" },
        opcoes: { type: "ARRAY", items: { type: "STRING" } },
        dadoPesquisa: {
          type: "OBJECT",
          properties: {
            estatistica: { type: "STRING" },
            fonte: { type: "STRING" },
            link: { type: "STRING", nullable: true },
            contexto: { type: "STRING" }
          },
          nullable: true
        },
        servicosRecomendados: { type: "ARRAY", items: { type: "STRING" } },
        justificativas: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              servico: { type: "STRING" },
              razao: { type: "STRING" },
              estatistica: { type: "STRING" },
              fonte: { type: "STRING" },
              link: { type: "STRING", nullable: true }
            }
          }
        },
        estimativaInvestimento: { type: "STRING" },
        disclaimerOrcamento: { type: "STRING" }
      },
      required: ["isFinal", "encerradoPorOfensa", "pergunta", "tipo", "servicosRecomendados", "justificativas", "estimativaInvestimento", "disclaimerOrcamento"]
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        systemInstruction: systemPrompt,
        contents: contents,
        generationConfig: {
          temperature: 0.6,
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      });

      const rawText = response.text;

      let jsonResponse;
      try {
        // Tenta parse direto primeiro
        jsonResponse = JSON.parse(rawText);
      } catch (e) {
        // Fallback: Limpeza agressiva de Markdown e texto extra
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            jsonResponse = JSON.parse(jsonMatch[0]);
          } catch (innerError) {
            throw new Error('Falha crítica ao parsear o JSON extraído da resposta.');
          }
        } else {
          throw new Error('A IA não retornou um formato JSON reconhecível na resposta.');
        }
      }

      // ── Guarda de segurança para o diagnóstico final ──────────────────────────────
      // Se isFinal:true mas os campos de resultado chegaram vazios, fazemos uma
      // segunda chamada focada EXCLUSIVAMENTE em gerar os dados do diagnóstico.
      // Isso garante que nenhum campo chegue vazio ao frontend.
      if (
        jsonResponse.isFinal &&
        (!jsonResponse.servicosRecomendados?.some(s => s?.trim?.().length > 0) ||
         !jsonResponse.estimativaInvestimento?.trim?.().length)
      ) {
        console.warn('[Diagnóstico Final] Campos de resultado vazios — acionando retry focado...');

        const retryContents = [
          ...contents,
          {
            role: 'model',
            parts: [{ text: JSON.stringify({ isFinal: true, pergunta: jsonResponse.pergunta || 'Diagnóstico gerado.' }) }]
          },
          {
            role: 'user',
            parts: [{
              text: `Com base em tudo que foi discutido, gere agora o JSON final completo com: 
- "isFinal": true
- "pergunta": diagnóstico detalhado de 3 parágrafos sobre o negócio do empreendedor
- "servicosRecomendados": array com 2 a 4 serviços do portfólio (ex: ["Criação de Site", "Gestão de Tráfego"])
- "justificativas": array com objetos {servico, razao, estatistica, fonte, link}
- "estimativaInvestimento": faixa em R$/mês baseada nos serviços recomendados
- "disclaimerOrcamento": nota sobre a natureza estimada do orçamento
OBRIGATÓRIO: todos os campos devem ter conteúdo real. Não retorne arrays [] nem strings "" vazias.`
            }]
          }
        ];

        const retryResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          systemInstruction: systemPrompt,
          contents: retryContents,
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
            responseSchema: responseSchema
          }
        });

        try {
          jsonResponse = JSON.parse(retryResponse.text);
        } catch (retryParseError) {
          console.error('[Retry Parse Error]', retryParseError.message);
          // Mantém o jsonResponse original se o retry também falhar
        }
      }

      return NextResponse.json(jsonResponse);

    } catch (apiError) {
      // Log estruturado para facilitar o debug (nodejs-best-practices)
      console.error(`[Gemini API Error]`, {
        message: apiError.message,
        name: apiError.name,
        stack: apiError.stack
      });

      let status = 500;
      let userFriendlyMessage = 'Erro ao processar o diagnóstico. Tente novamente.';

      // Mapeamento de erros comuns da API
      if (apiError.message?.includes('429')) {
        status = 429;
        userFriendlyMessage = 'O serviço está temporariamente sobrecarregado. Tente novamente em alguns segundos.';
      } else if (apiError.message?.includes('401') || apiError.message?.includes('API_KEY_INVALID')) {
        status = 401;
        userFriendlyMessage = 'Erro de autenticação com o provedor de IA. Verifique as configurações.';
      } else if (apiError.message?.includes('SAFETY')) {
        status = 400;
        userFriendlyMessage = 'O conteúdo foi bloqueado pelos filtros de segurança da IA. Tente reformular.';
      } else if (apiError.message?.includes('404')) {
        status = 404;
        userFriendlyMessage = 'Modelo de IA não encontrado ou descontinuado.';
      }

      return NextResponse.json(
        { error: userFriendlyMessage },
        { status }
      );
    }

  } catch (error) {
    console.error('API Handler Critical Error:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o diagnóstico.' }, { status: 500 });
  }
}
