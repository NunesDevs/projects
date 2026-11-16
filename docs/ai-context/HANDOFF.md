# Checkpoint de transferência — 2026-11-15

**WIP na branch codex/quality-refresh. Não integrar master nem publicar sem concluir os gates.** O proprietário pediu continuar em outro PC com mais RAM.

## Preservado

Figma aplicado ao jogo da memória e catálogo Angular. Motor puro, filtros reais, fontes/OFL e10símbolos próprios estão no Git. Configuração Angular22, exportação por lista permitida e Playwright preparados. A chave TLS antiga foi retirada do índice e permanece local/ignorada; não é necessária para executar o projeto e não deve ser reutilizada.

Figma: arquivo Huk9z4K8ORoDykKz85r7Ad, página3:5. Memória desktop118:1033, mobile118:1212, entrada118:1392; catálogo desktop119:1299 e mobile119:1580. Componentes111:918/967 e116:1062/1068/1070. Ledger completo fica no backup privado do workspace em controle/figma/projects-state.json.

## Evidência real e pendências

Onze testes puros passaram antes da integração de UI/configuração. YAML da CI foi analisado localmente. **Nenhuma instalação Angular22, tipagem, build ou execução Playwright final ocorreu.** Sem capturas novas e sem deploy. Não há pnpm-lock.yaml novo: o primeiro install deve gerar e revisar o lock; a CI frozen falhará enquanto ele faltar.

## Retomar

1. Clonar normalmente e selecionar codex/quality-refresh. Preservar master. Ler AGENTS e esta memória.
2. Node>=24.15 e pnpm11.25: executar pnpm install --ignore-scripts; revisar versões/integridades e versionar pnpm-lock.yaml.
3. pnpm test; pnpm --dir monsters typecheck; pnpm build.
4. pnpm exec playwright install chromium; pnpm test:e2e. Exige3fluxos/16layouts/oito larguras/quatro imagens e zero erros/chamadas externas.
5. Inspecionar imagens reais, registrar SHA e hashes, revisar diff. Somente depois coordenar FF-only/Pages com política do workspace.

Candidato Pages: https://nunesdevs.github.io/projects/ ; artefato SOMENTE dist/site. Workflow manual na master, ainda não habilitado/publicado nesta rodada. Nenhum arquivo ignorado é necessário para reconstruir a aplicação; caches/ambientes são recriáveis.
