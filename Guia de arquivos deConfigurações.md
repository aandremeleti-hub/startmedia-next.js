🗺️ Guia Didático de Configurações e Regras de IA
Imagine que você está gerenciando uma empresa de desenvolvimento de software. Cada arquivo representa um nível diferente de "manual de instruções":

1. C:\Users\Andre\.gemini\GEMINI.md
🏠 A sua "Assinatura de Estilo" (Global do Usuário)
Onde fica: Fora do seu projeto, na pasta do seu usuário do Windows (.gemini).
Quem lê: A Inteligência Artificial (Antigravity/Gemini), sempre que iniciar qualquer conversa com você, em qualquer projeto do seu computador.
Para que serve: Definir o seu padrão pessoal de código. Ele dita os limites gerais de design que você gosta (sua assinatura).
O que colocar aqui: Regras visuais e de código gerais que você quer que a IA siga em todos os seus sites (Ex: "Não use Tailwind CSS", "Não copie caminhos SVG gigantes no meio do código", "Use CSS puro nos componentes").
2. startmedia_nextjs\CLAUDE.md
🚪 O "Guia do Porteiro" (Entrada do Projeto)
Onde fica: Na raiz do projeto da StartMedia.
Quem lê: Qualquer agente de IA assim que ele "entra" na pasta do seu projeto.
Para que serve: Ser um índice inicial rápido. Ele diz para o agente como rodar os comandos básicos do projeto (como iniciar o servidor, rodar testes) ou diz para onde ir.
O que colocar aqui: No seu caso, ele contém apenas @AGENTS.md. Isso é como uma placa na porta dizendo: "Seja bem-vindo, por favor, leia o arquivo AGENTS.md para saber as regras da nossa casa."
3. startmedia_nextjs\AGENTS.md
📜 A "Constituição do Projeto" (Regras específicas da StartMedia)
Onde fica: Na raiz do projeto da StartMedia.
Quem lê: Todos os agentes de IA que forem trabalhar especificamente neste site da StartMedia.
Para que serve: Estabelecer regras operacionais rígidas para este repositório. São as leis que a IA não pode violar ao mexer no código deste site.
O que colocar aqui: Regras de fluxo de trabalho específicas do projeto (Ex: "Qualquer alteração em banco de dados ou integração exige obrigatoriamente a sugestão da skill blueprint").
4. plans/configuration_registry.md
📊 O "Manual Técnico do Carro" (Registro Técnico / Blueprint)
Onde fica: Dentro da pasta plans/ do seu projeto.
Quem lê: Você e o Agente de IA como consulta técnica.
Para que serve: Não dita regras de comportamento, mas sim fatos técnicos. Ele registra como as peças do sistema estão conectadas (as engrenagens, o banco de dados, as APIs, os links e as variáveis).
O que colocar aqui: A "ficha técnica" das integrações (Ex: quais as tabelas e colunas ativas no Supabase, qual a chave do Gemini que está em uso no .env.local, se o domínio do Resend está verificado, o passo a passo de como configurar o DNS na Hostinger).
💡 Resumo Rápido de "Onde colocar cada informação"
Para você nunca mais ter dúvida:

"Quero que a IA nunca use Tailwind em nenhum site que eu criar." 👉 Edite o C:\Users\Andre\.gemini\GEMINI.md (Global).
"Neste projeto da StartMedia, a IA sempre deve me avisar antes de alterar o Supabase." 👉 Edite o startmedia_nextjs\AGENTS.md (Constituição do site).
"Esqueci qual é o nome da coluna de data de reunião que criamos no Supabase ou como configurar o DNS na Hostinger." 👉 Abra e consulte o plans/configuration_registry.md (Manual Técnico).
