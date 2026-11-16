# Estudos interativos

> WIP em codex/quality-refresh: validação final incompleta. Leia [HANDOFF](docs/ai-context/HANDOFF.md) antes de executar ou publicar.

Dois projetos de estudo no navegador: um jogo da memória em JavaScript e um catálogo Angular com dados locais de personagens.

## Executar

Requer Node.js 24.15 ou superior e pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
pnpm --dir monsters typecheck
pnpm build
pnpm preview
```

Abra a URL local exibida. O jogo fica em `/memory/` e o catálogo em `/catalogue/`. `PORT` altera a porta do preview; o servidor escuta somente em localhost. O build publica exclusivamente `dist/site/`, com inventário e hashes em `dist/site-manifest.json`.

## Funcionalidades

- Memória com dez pares, embaralhamento Fisher–Yates, contagem de jogadas e tempo ativo, pausa e reinício. A partida pausa ao perder foco; cartas ficam ocultas durante a pausa.
- Nome opcional guardado somente na sessão do navegador. O modo visitante funciona quando esse armazenamento está bloqueado.
- Catálogo com busca por nome, filtro de perfil, ordenação por nome ou soma dos atributos, estado vazio e limpeza dos filtros.
- Teclado e toque, mensagens de estado, foco visível, fontes locais e layout responsivo. Sem conta, backend, telemetria ou chamadas externas.

Os atributos e perfis do catálogo são exemplos de estudo, não estatísticas oficiais. Nomes de personagens pertencem a seus respectivos titulares. O runtime usa monogramas e símbolos próprios em vez das antigas imagens externas.

## Validação e design

`pnpm test` cobre as regras do jogo e a validação/filtros do catálogo. Após o build, `pnpm test:e2e` testa os fluxos reais com Playwright, duas interfaces em oito larguras e quatro capturas. Instale o navegador com `pnpm exec playwright install chromium`. Opcionalmente, `BROWSER_EXECUTABLE` aponta para um navegador compatível.

Design editável no [Figma](https://www.figma.com/design/Huk9z4K8ORoDykKz85r7Ad?node-id=118-1033): componentes, estados e telas desktop/mobile aplicados às duas interfaces. Evidências de execução são geradas em `reports/qa/`; a CI executa os mesmos gates.

## Segurança e distribuição

Uma chave TLS antiga deixou de ser rastreada; a cópia local é ignorada. Não reutilize essa chave: ela permanece no histórico anterior e deve ser substituída em qualquer ambiente em que tenha sido usada. O build rejeita chaves, mapas de código, links de imagens antigos e arquivos fora da lista permitida. Imagens antigas permanecem como histórico local do projeto e não entram no site exportado.

O workflow valida pull requests e as branches de trabalho/padrão. A publicação Pages exige execução manual na branch `master`, com todos os gates aprovados e Pages configurado para GitHub Actions.

Código e novos símbolos: MIT, conforme [LICENSE](LICENSE). Fontes locais incluem suas licenças OFL. Não há vínculo com os titulares dos personagens.
