# IntegraSeg Dashboard V2 - Desenvolvimento

Quero que você desenvolva um sistema completo de Dashboard de Performance de Vendas para a IntegraSeg, totalmente funcional, profissional, simples e visual, seguindo exatamente as instruções abaixo.
IMPORTANTE: não implementar login, não implementar autenticação, não implementar sistema de senha. O acesso deve ser totalmente aberto para qualquer pessoa que tiver o link.

📌 1. Estrutura Geral do Sistema

O sistema deve conter quatro páginas:

1. Dashboard
2. Cadastro de Vendedores
3. Cadastro de Resultados (Importação de Planilha)
4. Histórico de Resultados

Todo o sistema deve ser simples, profissional e visual, com gráficos, tabelas, filtros por período, comparações entre vendedores e comparação geral da equipe.

📌 2. Cadastro de Vendedores (SEM LOGIN)

Não existe login no sistema.

Qualquer pessoa que tiver o link pode entrar e usar.

Qualquer pessoa pode criar vendedores.

Criar um botão: "Cadastrar Novo Vendedor"

Campos necessários:

Nome completo do vendedor

E-mail do vendedor (apenas como referência interna)

Cada vendedor recebe um ID único.

O sistema deve armazenar todos os vendedores em banco de dados interno.

📌 3. Cadastro de Resultados – Importação de Planilha CSV

Nesta página, o fluxo deve ser exatamente assim:

Etapa 1 – Selecionar vendedor

Campo obrigatório:

Selecionar um vendedor já cadastrado (drop-down)

Etapa 2 – Informar período

Campos obrigatórios:

Data inicial

Data final

Etapa 3 – Importar planilha CSV

O sistema deve aceitar upload de arquivo CSV, e deve:

Extrair automaticamente da planilha:

Oportunidades de vendas no período

Vendas realizadas no período

Tempo médio de conversão no período

❗ IMPORTANTE: Cada planilha importada pertence a apenas 1 vendedor.

Após extrair os dados, o sistema deve:

armazenar no banco interno

associar ao vendedor selecionado

atualizar automaticamente os gráficos do dashboard

📌 4. Dashboard – Visual, Profissional e Intuitivo

O dashboard deve mostrar, para o período filtrado:

Métricas principais

Total de Oportunidades

Total de Vendas

Taxa de Conversão (%)

Receita gerada (campo editável no cadastro de resultados)

Tempo médio de conversão

Gráficos obrigatórios

Gráfico de desempenho individual por vendedor

Gráfico de comparação entre vendedores

Gráfico geral da equipe

Evolução histórica das métricas ao longo do tempo

Filtros

Seleção de vendedor individual

Seleção de “Equipe inteira”

Período customizado (campo obrigatório)

Comparação entre períodos (opcional)

📌 5. Histórico de Resultados

Criar uma página listando:

Vendedor

Período analisado

Oportunidades

Vendas

Taxa de conversão

Tempo médio de conversão

Receita gerada

Data da importação

Com opções de:

Exportar Excel

Exportar PDF

Excluir registro

Editar registro

📌 6. Exportações obrigatórias

O sistema deve permitir exportar:

Dashboard (PDF)

Com gráficos incluídos.

Histórico (Excel e PDF)

Incluindo todos os dados consolidados.

📌 7. Banco de Dados

O sistema deve armazenar:

Lista de vendedores

Cada resultado importado

Histórico completo

Dados extraídos das planilhas CSV

Registro das datas de importação

Nada deve ser apagado automaticamente.

📌 8. Regras importantes

❗ REMOVER completamente qualquer sistema de login.
❗ Sistema deve ser 100% livre para qualquer pessoa acessar.
❗ Qualquer pessoa pode criar vendedores.
❗ Qualquer pessoa pode importar planilhas.
❗ Cada planilha importada deve sempre ser vinculada àquele vendedor selecionado.
❗ Dashboard precisa sempre refletir dados atualizados.

📌 9. Layout e Estilo

O sistema deve ser:

Simples

Minimalista

Profissional

Com boa leitura

Gráficos bem destacados

Painéis resumidos com cartões (cards)

Uso moderado de cores para destacar métricas

✅ INSTRUÇÃO FINAL

Crie agora o sistema completo descrito acima, exatamente como solicitado, sem modificar nada.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e9f182cc-f096-48a8-bb9e-a37811f1b748).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
