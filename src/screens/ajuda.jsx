import { useState } from 'react';
import sidebarCss from '../../ProjetoSuperMarket/sidebar.css?inline';
import Sidebar from '../Sidebar.jsx';
import helpCss from './ajuda.css?inline';

const questions = [
  {
    category: 'Produtos',
    question: 'Como cadastrar um produto?',
    answer: 'Acesse Produtos > Adicionar Produto no menu lateral, preencha as informações do item e salve o cadastro.'
  },
  {
    category: 'Estoque',
    question: 'Onde consulto o estoque dos produtos?',
    answer: 'Abra Produtos > Controle de Estoque para pesquisar itens e consultar as quantidades registradas.'
  },
  {
    category: 'Vendas',
    question: 'Como iniciar uma venda no caixa?',
    answer: 'Acesse Vendas > PDV (Caixa), adicione os produtos da compra e siga as etapas de finalização da venda.'
  },
  {
    category: 'Acesso',
    question: 'Esqueci minha senha. Como recuperar o acesso?',
    answer: 'Peça ao administrador do sistema para redefinir seu acesso. Por segurança, a recuperação não é feita por esta página.'
  },
  {
    category: 'Acesso',
    question: 'Por que não vejo algumas opções no menu?',
    answer: 'As opções disponíveis dependem do perfil definido pelo administrador. Entre em contato com ele se precisar de outro acesso.'
  },
  {
    category: 'Colaboradores',
    question: 'Como criar o acesso de um colaborador?',
    answer: 'Na página Colaboradores, preencha nome, e-mail, cargo e senha inicial. Compartilhe a senha diretamente com a pessoa; ela deverá criar uma senha pessoal no primeiro acesso.'
  },
  {
    category: 'Colaboradores',
    question: 'Qual cargo devo escolher para cada colaborador?',
    answer: 'Escolha o cargo conforme as tarefas: Operador de Caixa para PDV e etiquetas, Cadastro de Produtos para produtos e etiquetas, Caixa e Produtos para ambas as funções, ou Administrador para gerenciar o sistema.'
  },
  {
    category: 'Colaboradores',
    question: 'O que acontece ao desativar um colaborador?',
    answer: 'O acesso à conta é desativado. Se precisar restaurá-lo depois, use Reativar na lista de usuários cadastrados.'
  }
];

export default function AjudaScreen() {
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
  const filteredQuestions = questions.filter(({ question, answer, category }) =>
    `${question} ${answer} ${category}`.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setMessage('');
  };

  return (
    <>
      <style>{sidebarCss}</style>
      <style>{helpCss}</style>
      <div className="legacy-screen help-screen">
        <div className="app-container">
          <Sidebar />
          <div className="sidebar-overlay" id="sidebarOverlay" data-legacy-action="toggleMobileSidebar()"></div>
          <main className="main-content help-main" id="mainContent">
            <header className="help-header">
              <div className="help-header-left">
                <button className="menu-toggle" type="button" data-legacy-action="toggleSidebar()" aria-label="Abrir menu">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                  </svg>
                </button>
                <h1>Ajuda</h1>
              </div>
            </header>

            <div className="help-content">
              <section className="help-welcome" aria-labelledby="helpTitle">
                <span className="help-eyebrow">CENTRAL DE AJUDA</span>
                <h2 id="helpTitle">Como podemos ajudar?</h2>
                <p>Encontre respostas rápidas para as dúvidas mais comuns sobre o sistema.</p>
                <label className="help-search">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 9.5 5a4.5 4.5 0 0 1 0 9z" /></svg>
                  <span className="visually-hidden">Pesquisar dúvidas</span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Pesquise por assunto ou palavra-chave..."
                  />
                </label>
              </section>

              <div className="help-columns">
                <section className="help-faq" aria-labelledby="faqTitle">
                  <div className="help-section-heading">
                    <div>
                      <h2 id="faqTitle">Perguntas frequentes</h2>
                      <p>Orientações para usar os principais recursos.</p>
                    </div>
                    <span className="help-count">{filteredQuestions.length} tópicos</span>
                  </div>
                  <div className="help-question-list">
                    {filteredQuestions.length ? filteredQuestions.map(({ category, question, answer }) => (
                      <details className="help-question" key={question}>
                        <summary>
                          <span><small>{category}</small>{question}</span>
                          <span className="help-question-mark" aria-hidden="true">+</span>
                        </summary>
                        <p>{answer}</p>
                      </details>
                    )) : (
                      <p className="help-empty">Nenhuma dúvida encontrada. Tente outra palavra-chave.</p>
                    )}
                  </div>
                </section>

                <aside className="help-contact" aria-labelledby="contactTitle">
                  <div className="help-contact-icon" aria-hidden="true">?</div>
                  <h2 id="contactTitle">Ainda precisa de ajuda?</h2>
                  <p>Descreva sua dúvida para ver como seria o envio de uma solicitação de suporte.</p>
                  <form onSubmit={handleSubmit}>
                    <label htmlFor="helpSubject">Assunto</label>
                    <select id="helpSubject" required onChange={() => setSubmitted(false)} defaultValue="">
                      <option value="" disabled>Selecione um assunto</option>
                      <option>Produtos e estoque</option>
                      <option>Vendas e caixa</option>
                      <option>Acesso ao sistema</option>
                      <option>Colaboradores</option>
                      <option>Outro assunto</option>
                    </select>
                    <label htmlFor="helpMessage">Sua dúvida</label>
                    <textarea
                      id="helpMessage"
                      rows="4"
                      required
                      value={message}
                      onChange={(event) => {
                        setMessage(event.target.value);
                        setSubmitted(false);
                      }}
                      placeholder="Conte brevemente o que aconteceu..."
                    />
                    <button type="submit">Simular envio</button>
                    {submitted && (
                      <p className="help-confirmation" role="status">
                        Simulação concluída. Nenhuma mensagem foi enviada; esta tela é apenas demonstrativa.
                      </p>
                    )}
                  </form>
                  <p className="help-demo-note">Demonstração: o formulário não envia dados nem abre um chamado real.</p>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
