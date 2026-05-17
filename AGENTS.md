<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🚨 REGRA CRÍTICA DO PROJETO: Uso Obrigatório da Skill Blueprint

Qualquer agente de IA que iniciar uma tarefa neste repositório **DEVE** analisar a solicitação do usuário antes de realizar qualquer alteração no código.

Se a tarefa envolver qualquer um dos cenários abaixo:
1. **Novas Integrações ou Configurações:** Integrações externas (como Supabase, Gemini, Resend, servidores SMTP, Hostinger, gateways de pagamento, etc.);
2. **Mudanças de Arquitetura:** Alteração na estrutura de tabelas/colunas do banco de dados (Supabase), ou na lógica estrutural de rotas de API do Next.js;
3. **Grandes Funcionalidades:** Tarefas complexas que alterem mais de 3 arquivos ou que precisem de múltiplas interações/sessões de conversa para serem concluídas;

### ⚠️ Ação Obrigatória:
**O agente DEVE, antes de escrever qualquer código ou rodar comandos de modificação, propor e sugerir formalmente a utilização da skill `blueprint` para criar ou atualizar o arquivo de documentação em `plans/` correspondente.** O agente só poderá iniciar o código após a aprovação expressa do plano pelo usuário.
