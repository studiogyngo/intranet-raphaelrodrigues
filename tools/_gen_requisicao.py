# -*- coding: utf-8 -*-
from pathlib import Path

root = Path(__file__).resolve().parents[1]
base = (root / "avaliacao-desempenho.html").read_bytes().decode("utf-8-sig")

main = r"""<main id="conteudo-principal" class="directory-page req-page">
    <section class="req-hero" aria-labelledby="req-hero-title">
      <div class="container">
        <h1 class="req-hero__title" id="req-hero-title">Requisição de Materiais e Orçamentos</h1>
        <p class="req-hero__text">Solicite materiais, produtos e orçamentos de forma prática e organizada através da Intranet, garantindo mais agilidade e controle nos processos internos.</p>
      </div>
    </section>

    <div class="container">
      <nav class="directory-breadcrumb" aria-label="Você está em">
        <a href="index.html">Início</a>
        <span aria-hidden="true"> / </span>
        <span>Requisição de Materiais e Orçamentos</span>
      </nav>

      <form class="req-form" id="req-form" novalidate>
        <div class="profile-fields-card">
          <h2 class="profile-fields-card__title">Dados da solicitação</h2>
          <div class="profile-grid">
            <label class="directory-field">
              <span>Nome do solicitante <em class="req-star">*</em></span>
              <input type="text" name="nome" value="Bruno Oliveira" required autocomplete="name" readonly tabindex="-1">
            </label>
            <label class="directory-field">
              <span>E-mail <em class="req-star">*</em></span>
              <input type="email" name="email" value="bruno.oliveira@empresa.com" required autocomplete="email" readonly tabindex="-1">
            </label>
            <label class="directory-field">
              <span>Telefone <em class="req-star">*</em></span>
              <input type="tel" name="telefone" value="(62) 3224-7585" required autocomplete="tel" readonly tabindex="-1">
            </label>
            <label class="directory-field">
              <span>Departamento <em class="req-star">*</em></span>
              <input type="text" name="departamento" value="Financeiro" required readonly tabindex="-1">
            </label>
            <label class="directory-field profile-grid__full">
              <span>Tipo de solicitação <em class="req-star">*</em></span>
              <select name="tipo" required>
                <option value="">Selecione...</option>
                <option value="material-escritorio">Material de escritório</option>
                <option value="material-limpeza">Material de limpeza</option>
                <option value="informatica">Equipamento de informática</option>
                <option value="mobiliario">Mobiliário</option>
                <option value="orcamento-servico">Orçamento de serviço</option>
                <option value="orcamento-produto">Orçamento de produto</option>
                <option value="outros">Outros</option>
              </select>
            </label>
            <label class="directory-field">
              <span>Prioridade <em class="req-star">*</em></span>
              <select name="prioridade" required>
                <option value="">Selecione...</option>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </label>
            <label class="directory-field">
              <span>Data desejada / necessidade</span>
              <input type="date" name="data_desejada">
            </label>
            <label class="directory-field profile-grid__full">
              <span>Gestor / Aprovador</span>
              <input type="text" name="gestor" value="Marcelo Dias" autocomplete="off">
            </label>
            <label class="directory-field profile-grid__full">
              <span>Motivo / Justificativa <em class="req-star">*</em></span>
              <textarea name="motivo" rows="4" required placeholder="Descreva o motivo da solicitação"></textarea>
            </label>
            <fieldset class="directory-field profile-grid__full req-radios">
              <legend>Contato preferencial</legend>
              <div class="req-radios__list">
                <label class="req-radios__opt"><input type="radio" name="contato" value="email" checked> E-mail</label>
                <label class="req-radios__opt"><input type="radio" name="contato" value="telefone"> Telefone</label>
                <label class="req-radios__opt"><input type="radio" name="contato" value="whatsapp"> WhatsApp</label>
              </div>
            </fieldset>
            <label class="directory-field profile-grid__full">
              <span>Observações adicionais</span>
              <textarea name="observacoes" rows="4" placeholder="Informações complementares"></textarea>
            </label>
            <div class="directory-field profile-grid__full">
              <span>Anexar os documentos necessários:</span>
              <div class="req-drop" id="req-drop">
                <input type="file" id="req-files" name="anexos" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden>
                <p class="req-drop__lead"><i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i> Arraste e solte arquivos aqui ou <button type="button" class="req-drop__browse" id="req-browse">Procurar arquivos</button></p>
                <p class="req-drop__hint">Arquivos permitidos: pdf, jpg, jpeg, png, doc, docx, xls, xlsx (até 5 arquivo(s) neste envio, 2 MB por arquivo).</p>
                <ul class="req-drop__list" id="req-file-list" hidden></ul>
              </div>
            </div>
          </div>

          <label class="req-check">
            <input type="checkbox" name="declaracao" value="1" required>
            <span><em class="req-star">*</em> Declaro que as informações são verdadeiras.</span>
          </label>

          <div class="profile-form__actions">
            <button type="submit" class="btn btn--yellow">Enviar solicitação</button>
          </div>
          <p class="profile-form__feedback" id="req-feedback" hidden></p>
        </div>
      </form>
    </div>
  </main>"""

text = base
text = text.replace(
    '<meta name="description" content="Avaliação de Desempenho. Área do Gestor — INTRANET.">',
    '<meta name="description" content="Requisição de Materiais e Orçamentos — INTRANET.">',
)
text = text.replace(
    "<title>Avaliação de Desempenho — INTRANET</title>",
    "<title>Requisição de Materiais e Orçamentos — INTRANET</title>",
)
start = text.index("<main")
end = text.index("</main>") + len("</main>")
text = text[:start] + main + text[end:]
(root / "requisicao-materiais.html").write_bytes(bytes([0xEF, 0xBB, 0xBF]) + text.encode("utf-8"))
print("wrote requisicao-materiais.html")
