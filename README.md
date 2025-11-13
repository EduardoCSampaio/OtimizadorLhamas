<div align="center">
  <br />
  <h1>🏦</h1>
  <br />
  <h1 align="center">Bank Proposal Automation</h1>
  <p align="center">
    Uma plataforma interna de alta performance para automação e gerenciamento do ciclo de vida de propostas bancárias.
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge" alt="Status" />
    <img src="https://img.shields.io/badge/Versão-1.0.0-blue?style=for-the-badge" alt="Versão" />
    <img src="https://img.shields.io/badge/Framework-Next.js-black?style=for-the-badge&logo=next.js" alt="Framework" />
    <img src="https://img.shields.io/badge/Backend-Firebase-orange?style=for-the-badge&logo=firebase" alt="Backend" />
  </p>
</div>

---

## 📄 Visão Geral

O **Bank Proposal Automation** é uma solução de software sob medida, desenvolvida para otimizar o fluxo de trabalho operacional de submissão e acompanhamento de propostas financeiras. A plataforma centraliza informações críticas, automatiza tarefas repetitivas e fornece visibilidade em tempo real sobre a produtividade da equipe, atuando como o núcleo operacional para equipes de crédito.

O sistema foi projetado para atacar gargalos processuais, reduzir erros manuais e fornecer aos gestores as ferramentas necessárias para tomar decisões baseadas em dados.

---

## ✨ Funcionalidades Principais

O sistema é composto por um conjunto de módulos integrados que garantem um controle completo sobre o processo operacional.

| Módulo                  | Descrição                                                                                                                              | Ícone         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| **Dashboard Analítico**   | Oferece uma visão macro da operação com estatísticas de produtividade, gráficos de conclusão semanal e um feed de atividades em tempo real. | `📊`          |
| **Checklist Diário**      | O coração do sistema. Uma interface de trabalho (Workbank) onde os operadores gerenciam o status de submissão para cada banco.      | `✅`          |
| **Gestão de Entidades** | Telas administrativas para o usuário "master" gerenciar o cadastro de Bancos e Promotoras, definindo suas categorias e associações.     | `🏦` `🏢` |
| **Base de Conhecimento**  | Um repositório centralizado para manuais de instrução e regras de negócio para cada instituição financeira, garantindo conformidade. | `📚`          |
| **Gerador de Documentos** | Ferramenta para exportar relatórios e folhas de rosto em PDF com formatação profissional, incluindo regras CLT por banco e comparativos. | `📄`          |
| **Gerenciamento de Acessos** | Cofre de credenciais seguro e individual para cada usuário, facilitando o acesso rápido e seguro aos portais de bancos e promotoras. | `🔑`          |
| **Perfis e Permissões**   | Sistema de usuários com duas camadas (`master` e `user`), garantindo que funcionalidades administrativas sejam restritas.          | `👥`          |
| **Personalização de UI**  | Permite que cada usuário escolha seu tema preferido (Claro, Escuro ou Padrão do Sistema) para uma experiência de uso mais confortável. | `🎨`          |

---

## 🚀 Arquitetura e Stack Tecnológica

A plataforma foi construída utilizando uma stack moderna e escalável, priorizando performance, segurança e uma excelente experiência de desenvolvimento e de usuário.

*   **Frontend:**
    *   **Framework:** [Next.js](https://nextjs.org/) (App Router)
    *   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
    *   **UI Components:** [ShadCN/UI](https://ui.shadcn.com/)
    *   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend & Infraestrutura:**
    *   **Base de Dados:** [Cloud Firestore](https://firebase.google.com/docs/firestore)
    *   **Autenticação:** [Firebase Authentication](https://firebase.google.com/docs/auth)
    *   **Hospedagem:** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)
*   **Inteligência Artificial (Opcional):**
    *   **Orquestração de IA:** [Google Genkit](https://firebase.google.com/docs/genkit)
    *   **Modelos:** [Google Gemini](https://deepmind.google/technologies/gemini/)

---

## 🛠️ Primeiros Passos

Este é um projeto Next.js padrão. Para iniciar o ambiente de desenvolvimento local, siga os passos abaixo:

1.  **Instalar Dependências:**
    ```bash
    npm install
    ```
2.  **Executar o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:9002`.

---
<div align="center">
  <p>Desenvolvido para máxima eficiência operacional.</p>
</div>
