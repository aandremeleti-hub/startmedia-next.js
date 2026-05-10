import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { nome, email, whatsapp, historico, diagnosticoFinal } = await req.json();

    if (!nome || !email || !whatsapp) {
      return NextResponse.json({ error: 'Dados de contato incompletos.' }, { status: 400 });
    }

    // Prepara as tarefas para execução em paralelo (Promise.all)
    const tarefas = [];

    // 1. Salvar no Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const saveToDatabase = supabase.from('leads').insert([
        {
          nome,
          email,
          whatsapp,
          respostas_raw: historico,
          diagnostico_gerado: diagnosticoFinal
        }
      ]);
      tarefas.push(saveToDatabase);
    }

    // 2. Enviar E-mail via Resend
    if (process.env.RESEND_API_KEY) {
      const emailHtml = `
        <h2>Novo Lead de Diagnóstico - STARTMEDIA</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <br/>
        <h3>Diagnóstico Gerado (Resumo):</h3>
        <p>${diagnosticoFinal?.pergunta || 'Não disponível'}</p>
        <h4>Serviços Recomendados:</h4>
        <ul>
          ${diagnosticoFinal?.servicosRecomendados?.map(s => `<li>${s}</li>`).join('') || 'Nenhum'}
        </ul>
        <p><strong>Investimento Estimado:</strong> ${diagnosticoFinal?.estimativaInvestimento || 'N/A'}</p>
      `;

      const sendEmail = resend.emails.send({
        from: 'Acme <onboarding@resend.dev>', // Usando o email de teste do Resend. Para produção, precisa de um domínio verificado.
        to: ['aandremeleti@gmail.com'],
        subject: `Novo Lead STARTMEDIA - ${nome}`,
        html: emailHtml
      });
      tarefas.push(sendEmail);
    }

    // Executa tudo ao mesmo tempo
    await Promise.all(tarefas);

    return NextResponse.json({ success: true, message: 'Diagnóstico finalizado com sucesso!' });

  } catch (error) {
    console.error('Erro na API Final:', error);
    return NextResponse.json({ error: 'Erro ao salvar os dados finais.' }, { status: 500 });
  }
}
