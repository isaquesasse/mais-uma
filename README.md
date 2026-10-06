# Mais uma

Caderno de academia em português, feito para celular e desktop. HTML, CSS e JavaScript, sem build e sem dependências de execução. Hospedagem pelo GitHub Pages; armazenamento compartilhado em um GitHub Gist.

## Usar com um amigo

1. Abra o site e clique em **Salvo neste aparelho** no topo.
2. O código do arquivo compartilhado já está preenchido.
3. Crie um token **classic** na sua conta do GitHub com **somente a permissão `gist`**, pelo link exibido no site. Nunca coloque o token no repositório ou envie em um chat.
4. Na primeira conexão, escolha uma senha de pelo menos 10 caracteres para o caderno.
5. No outro aparelho, use o mesmo código do arquivo, a mesma senha e um token da conta proprietária do Gist. Tokens de outra conta não podem editar o arquivo. A permissão `gist` permite acessar todos os Gists da conta: compartilhe somente com alguém de confiança e revogue o token caso necessário.
6. Adicione os nomes de vocês e selecione a pessoa antes de registrar.

A opção **Manter conectado** guarda token e senha no navegador; use somente em um aparelho pessoal. Sem marcar, as credenciais duram a sessão da aba. Os perfis são separações de histórico, não contas com permissões individuais. Todos os participantes do caderno podem editar todos os perfis.

## Dados e sincronização

- Os registros ficam localmente no navegador, inclusive durante falhas de conexão. Não limpe os dados do navegador sem sincronizar ou baixar backup.
- A sincronização ocorre ao salvar, ao voltar à aba e a cada 30 segundos enquanto aberta. É preciso reabrir o site para enviar mudanças pendentes.
- Os registros são combinados por identificador; alterações usam o horário da última edição. Exclusões têm marcadores para não reaparecer. Mantenha o relógio dos aparelhos correto.
- O Gist não oferece transações: edições exatamente simultâneas podem precisar de uma nova sincronização para convergir. Os aparelhos preservam cópias locais para essa recombinação. Não é um sistema para alta concorrência.
- O conteúdo remoto usa AES-256-GCM; a chave é derivada da senha usando PBKDF2-SHA256, 250 mil iterações e salt aleatório. O GitHub recebe apenas o arquivo criptografado. Um Gist não listado não é privado, por isso há criptografia.
- A senha do caderno não tem recuperação. Guarde-a. O backup baixado é JSON **sem criptografia** e não inclui credenciais.
- Falhas de API não são exibidas como sucesso; o indicador no topo fica pendente. Use **Sincronizar agora** para tentar novamente.
- GitHub Pages e Gist estão sujeitos aos limites e termos gratuitos do GitHub.

## Desenvolvimento

Sirva esta pasta com qualquer servidor HTTP estático. Rode `npm test` (Node 22+) para testar validação, combinação de registros e criptografia. O arquivo `config.js` contém somente o identificador não secreto do Gist. Nunca adicione tokens a esse arquivo.

O GitHub Pages publica a raiz do branch `main`. Não há serviço de backend próprio nem banco de dados dedicado.
