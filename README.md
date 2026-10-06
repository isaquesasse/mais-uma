# Mais uma

Caderno de academia em português: cargas, séries, repetições, peso corporal e históricos separados por pessoa. Interface leve para celular e desktop, sem build e sem dependências JavaScript externas.

## Usar com um amigo

Abra o **link completo de acesso** entregue ao proprietário. A conexão é automática: sem conta, token ou senha para preencher. Adicione os nomes de vocês e selecione a pessoa antes de registrar. No botão de sincronização no topo, use **Copiar link para meu amigo**.

O link funciona como uma chave: quem tiver acesso a ele poderá ver e editar todos os perfis. Guarde-o e compartilhe apenas com quem deve participar. O endereço público sem essa chave funciona localmente, mas não libera o caderno compartilhado.

## Armazenamento

O frontend está no GitHub Pages. O JSON criptografado fica em armazenamento de objetos Cloudflare R2 provisionado pelo Sites. Não há banco de dados dedicado ou token de GitHub no aplicativo.

- AES-256-GCM protege os registros antes do envio; a chave deriva de um segredo aleatório de 256 bits presente no fragmento do link. O fragmento não é enviado no endereço HTTP ao GitHub Pages.
- A API verifica a chave de acesso pelo seu hash e só serve um caderno. O segredo não está no código ou neste repositório.
- Os dados e o acesso ficam guardados no navegador. Use aparelhos de confiança. Não limpe os dados locais sem sincronizar ou baixar backup.
- A sincronização ocorre ao salvar, ao retornar à aba e a cada 30 segundos enquanto aberta. Durante falhas, os registros ficam locais e a interface indica pendência.
- Escritas usam ETag e condição de versão para detectar atualizações simultâneas. Em conflito, os clientes leem a nova versão, combinam por ID e tentam novamente.
- Em edições do mesmo registro, prevalece o horário mais recente. Mantenha os relógios dos aparelhos corretos. Exclusões usam marcadores para não reaparecer durante uma sincronização.
- O backup baixado é JSON **sem criptografia**, não inclui a chave de acesso e pode ser restaurado sem duplicar IDs.
- Perfis separam os históricos, mas não são contas privadas: os participantes compartilham acesso a todos os registros.

## Desenvolvimento

Sirva esta pasta com um servidor HTTP estático. Rode `npm test` com Node 22+ para validar a combinação de dados e a criptografia. O GitHub Pages publica a raiz do branch `main`.

`config.js` contém apenas a URL pública da API. `server/index.js` é uma cópia do Worker usado pelo serviço de armazenamento; sua implantação ocorre separadamente via Sites, com binding R2 `BUCKET` e variável protegida `NOTEBOOK_HASH`.

Nunca adicione o link de acesso ou credenciais ao repositório. O Gist inicialmente preparado foi substituído para permitir uso sem configuração manual.
