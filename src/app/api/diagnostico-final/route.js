import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { nome, email, whatsapp, historico, diagnosticoFinal, ctaEscolhido, dataReuniao } = await req.json();

    if (!nome || !email || !whatsapp) {
      return NextResponse.json({ error: 'Dados de contato incompletos.' }, { status: 400 });
    }

    const tarefas = [];

    // 1. Salvar no Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('[Supabase] Tentando salvar lead:', { email, ctaEscolhido });
      const { error: dbError } = await supabase.from('leads').insert([
        {
          nome,
          email,
          whatsapp,
          respostas_raw: historico,
          diagnostico_gerado: diagnosticoFinal,
          cta_escolhido: ctaEscolhido || 'nenhum',
          data_reuniao: dataReuniao || null,
          link_meet: null
        }
      ]);
      
      if (dbError) {
        console.error('[Supabase Error]', dbError);
      } else {
        console.log('[Supabase] Lead salvo com sucesso.');
      }
    }

    // 2. Envio de e-mails
    if (process.env.RESEND_API_KEY) {
      console.log('[Resend] Preparando envio de e-mails. CTA:', ctaEscolhido);
      
      const ctaLabel = {
        reuniao: '📅 REUNIÃO AGENDADA',
        telefone: '📞 LEAD AGUARDANDO CONTATO POR TELEFONE',
        whatsapp: '🟢 LEAD ENTROU EM CONTATO VIA WHATSAPP',
        nenhum: '📋 NOVO LEAD DIAGNOSTICADO'
      }[ctaEscolhido] || '📋 NOVO LEAD DIAGNOSTICADO';

      const servicosHtml = diagnosticoFinal?.servicosRecomendados
        ?.map(s => `<li style="margin-bottom:8px;">${s}</li>`)
        .join('') || '<li>Não disponível (Contato Direto)</li>';

      const justificativasHtml = diagnosticoFinal?.justificativas
        ?.map(j => `
          <div style="background:#1a1a1a;border-left:3px solid #00FF85;padding:12px 16px;margin-bottom:12px;border-radius:6px;">
            <strong style="color:#00FF85;">${j.servico}</strong>
            <p style="color:#f0f0f0;margin:6px 0;">${j.razao}</p>
          </div>
        `).join('') || '<p style="color:#666;">Sem justificativas (Contato Direto)</p>';

      const reuniaoInfo = ctaEscolhido === 'reuniao' && dataReuniao
        ? `<div style="background:#003D20;padding:16px;border-radius:8px;margin:16px 0;text-align:center;">
            <strong style="color:#00FF85;font-size:18px;">📅 Reunião: ${dataReuniao}</strong>
           </div>`
        : '';

      // ── E-mail interno para a StartMedia (SEMPRE ENVIADO) ────────────────────
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;background:#080808;padding:32px;color:#f0f0f0;max-width:600px;margin:0 auto;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="background:#00FF85;color:#080808;padding:6px 16px;border-radius:20px;font-weight:bold;font-size:14px;">${ctaLabel}</span>
          </div>
          <h2 style="color:#00FF85;border-bottom:1px solid #2C2C2C;padding-bottom:12px;">Novo Lead — STARTMEDIA DIGITAL</h2>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;color:#aaa;">Nome</td><td style="padding:8px;color:#f0f0f0;font-weight:bold;">${nome}</td></tr>
            <tr style="background:#1a1a1a;"><td style="padding:8px;color:#aaa;">E-mail</td><td style="padding:8px;color:#f0f0f0;">${email}</td></tr>
            <tr><td style="padding:8px;color:#aaa;">WhatsApp</td><td style="padding:8px;color:#f0f0f0;">${whatsapp}</td></tr>
          </table>
          ${reuniaoInfo}
          <h3 style="color:#00FF85;margin-top:24px;">📋 Diagnóstico/Origem:</h3>
          <p style="color:#d0d0d0;line-height:1.6;background:#1a1a1a;padding:16px;border-radius:8px;">${diagnosticoFinal?.pergunta || 'Contato direto sem diagnóstico'}</p>
          <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #2C2C2C;">
            <p style="color:#666;font-size:12px;">STARTMEDIA DIGITAL — Notificação Automática</p>
          </div>
        </div>
      `;

      tarefas.push(resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: ['contato@startmediadigital.com.br'],
        subject: `${ctaLabel} — ${nome}`,
        html: emailHtml
      }).then(r => console.log('[Resend] E-mail interno enviado:', r)).catch(e => console.error('[Resend Error Interno]', e)));

      // ── E-mail de confirmação para o lead (APENAS SE NÃO FOR WHATSAPP) ────────
      if (ctaEscolhido !== 'whatsapp') {
        const emailLeadHtml = `
          <div style="font-family:Arial,sans-serif;background:#080808;padding:32px;color:#f0f0f0;max-width:600px;margin:0 auto;border-radius:12px;">
            <h1 style="color:#00FF85;text-align:center;">STARTMEDIA DIGITAL</h1>
            <h2 style="color:#f0f0f0;">Olá, ${nome}! 👋</h2>
            ${ctaEscolhido === 'reuniao'
              ? `<p>Sua reunião foi confirmada para <strong style="color:#00FF85;">${dataReuniao}</strong>.</p>`
              : `<p>Recebemos sua solicitação! Nossa equipe entrará em contato por telefone em até 24h.</p>`
            }
            <p style="color:#aaa;font-size:12px;text-align:center;margin-top:32px;">© STARTMEDIA DIGITAL</p>
          </div>
        `;

        tarefas.push(resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: [email],
          subject: '✅ Recebemos sua solicitação — STARTMEDIA DIGITAL',
          html: emailLeadHtml
        }).then(r => console.log('[Resend] E-mail lead enviado:', r)).catch(e => console.error('[Resend Error Lead]', e)));
      }
    }

    await Promise.all(tarefas);

    return NextResponse.json({ success: true, message: 'Diagnóstico finalizado com sucesso!' });

  } catch (error) {
    console.error('Erro na API Final:', error);
    return NextResponse.json({ error: 'Erro ao salvar os dados finais.' }, { status: 500 });
  }
}
