# projects

Repositório de estudos com um catálogo Angular de personagens e um jogo da memória em JavaScript.

## Funcionalidades verificadas

- Lista de personagens em Angular.
- Dados locais em JSON.
- Jogo da memória com login local de jogador e cronômetro.

## Operação e arquitetura verificadas

monsters contém aplicação Angular 14; Jogo da memória contém páginas estáticas independentes. Não é um único aplicativo ou backend.

Arquivos principais: `monsters/package.json`, `monsters/src/app/monsters-list/monsters-list.component.ts`, `Jogo da memória/js/game.js`.

### Requisitos e execução

Para monsters: Node.js compatível com Angular 14; para o jogo: navegador.

```text
cd monsters
npm ci --ignore-scripts
npm start
npm run build
```

Abra Jogo da memória/index.html por servidor estático.

### Testes e estado

Não foi identificada uma suíte automatizada específica para os fluxos descritos; valide a execução e os casos de borda antes de publicar.

Estado: projeto de estudo/experimental. Deploy ativo não foi confirmado nesta revisão.

### Limitações conhecidas

- Há uma chave TLS de desenvolvimento versionada em monsters/ssl/app.server.key; verificar uso e rotacionar se foi reutilizada.
- Assets de personagens de terceiros exigem revisão antes de reutilização pública.
- Não foram executados testes Angular/Karma.

### Licença e manutenção

Nenhum arquivo de licença foi identificado nesta revisão; não foi adicionada uma nova licença. Atualize comandos e limitações quando houver mudança de comportamento.
