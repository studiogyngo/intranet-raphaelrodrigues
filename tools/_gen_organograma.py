# -*- coding: utf-8 -*-
from pathlib import Path

root = Path(__file__).resolve().parents[1]
src = (root / "avaliacao-desempenho.html").read_bytes()
base = src.decode("utf-8-sig")


PERSON_MODAL = """
<div class="notice-modal" id="person-modal" role="dialog" aria-modal="true" aria-labelledby="person-modal-title" hidden>
    <div class="notice-modal__backdrop" data-close-person></div>
    <div class="notice-modal__dialog person-modal__dialog">
      <button type="button" class="person-modal__close" data-close-person aria-label="Fechar">&times;</button>
      <span class="badge badge--blue" id="person-modal-badge"></span>
      <h2 class="notice-modal__title" id="person-modal-title"></h2>
      <div class="person-modal__intro">
        <img class="person-modal__photo" id="person-modal-photo" src="" alt="">
        <div>
          <p class="person-modal__job" id="person-modal-job"></p>
          <p class="person-modal__meta" id="person-modal-meta"></p>
        </div>
      </div>
      <ul class="person-modal__facts">
        <li><strong>Telefone:</strong> <span id="person-modal-phone"></span></li>
        <li><strong>Ramal:</strong> <span id="person-modal-ramal"></span></li>
        <li class="person-modal__full"><strong>E-mail:</strong> <a id="person-modal-email"></a></li>
        <li><strong>Unidade:</strong> <span id="person-modal-unit"></span></li>
        <li><strong>Admissão:</strong> <span id="person-modal-admitted"></span></li>
        <li><strong>Aniversário:</strong> <span id="person-modal-birthday"></span></li>
        <li><strong>Status:</strong> <span class="status-badge" id="person-modal-status"></span></li>
      </ul>
    </div>
  </div>
"""


def make_page(filename, description, title, main, extra_before_script=""):
    text = base
    text = text.replace(
        '<meta name="description" content="Avaliação de Desempenho. Área do Gestor — INTRANET.">',
        f'<meta name="description" content="{description}">',
    )
    text = text.replace("<title>Avaliação de Desempenho — INTRANET</title>", f"<title>{title} — INTRANET</title>")
    start = text.index("<main")
    end = text.index("</main>") + len("</main>")
    text = text[:start] + main + text[end:]
    if extra_before_script:
        text = text.replace(
            '<script src="script.js" defer></script>',
            extra_before_script + "\n  <script src=\"script.js\" defer></script>",
        )
    (root / filename).write_bytes(b"\xef\xbb\xbf" + text.encode("utf-8"))
    print("wrote", filename)


def card(pid, photo, name, role, dept, unit, email, has_team=False, root=False):
    toggle = ""
    if has_team:
        toggle = '<span class="org-card__toggle" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>'
    extra = ""
    if root:
        extra += " org-card--root"
    if pid == "bruno":
        extra += " org-card--you"
    you_tag = '<span class="org-card__you">Você</span>' if pid == "bruno" else ""
    return f'''<article class="org-card{extra}" data-org-id="{pid}" data-name="{name.lower()}" data-role="{role.lower()}" data-dept="{dept}" data-unit="{unit}" data-email="{email}" data-status="Ativo" tabindex="0" aria-label="Ver dados de {name}">
                <img class="org-card__photo" src="assets/images/{photo}" alt="Foto de {name}" width="80" height="80">
                <strong class="org-card__name">{name}</strong>
                <span class="org-card__role">{role}</span>
                <span class="org-card__dept">{dept}</span>
                {you_tag}
                {toggle}
              </article>'''


main_list = """<main id="conteudo-principal" class="directory-page">
    <div class="container">
      <nav class="directory-breadcrumb" aria-label="Você está em">
        <a href="index.html">Início</a>
        <span aria-hidden="true"> / </span>
        <span>Organograma</span>
      </nav>

      <span class="badge badge--blue directory-kicker">Organograma</span>
      <h1 class="directory-title">Organograma</h1>
      <p class="directory-lead">Consulte a estrutura da empresa. Escolha o organograma para ver a equipe e as lideranças.</p>

      <div class="course-grid course-grid--single">
        <article class="course-card org-call-card">
          <div class="course-card__top">
            <span class="course-card__icon" aria-hidden="true"><i class="fa-solid fa-sitemap"></i></span>
            <span class="course-card__kicker">Recursos Humanos</span>
          </div>
          <h2 class="course-card__title">Organograma do RH</h2>
          <p class="course-card__text">Estrutura interativa com as lideranças e todos os colaboradores cadastrados na intranet, com foto, cargo e área.</p>
          <div class="org-call-card__faces" aria-hidden="true">
            <img src="assets/images/author-2.jpg" alt="">
            <img src="assets/images/author-7.jpg" alt="">
            <img src="assets/images/author-4.jpg" alt="">
            <img src="assets/images/author-1.jpg" alt="">
            <img src="assets/images/author-12.jpg" alt="">
            <img src="assets/images/author-6.jpg" alt="">
            <img src="assets/images/author-5.jpg" alt="">
            <img src="assets/images/author-10.jpg" alt="">
          </div>
          <ul class="course-card__tags">
            <li>12 colaboradores</li>
            <li>Visual interativo</li>
            <li>Sede e unidades</li>
          </ul>
          <a href="organograma-rh.html" class="btn btn--yellow course-card__cta" target="_blank" rel="noopener noreferrer">Abrir organograma <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
        </article>
      </div>
    </div>
  </main>"""

tree_html = f"""<ul class="org-tree" id="org-tree">
            <li>
              {card("marina", "author-2.jpg", "Marina Costa", "Coordenadora de Pessoas", "Recursos Humanos", "Sede Goiânia", "marina.costa@empresa.com", True, True)}
              <ul>
                <li>
                  {card("fernanda", "author-7.jpg", "Fernanda Lima", "Analista de RH", "Recursos Humanos", "Sede Goiânia", "fernanda.lima@empresa.com")}
                </li>
                <li>
                  {card("camila", "author-4.jpg", "Camila Freitas", "Especialista de Comunicação Interna", "Comunicação", "Sede Goiânia", "camila.freitas@empresa.com")}
                </li>
                <li>
                  {card("diego", "author-1.jpg", "Diego Almeida", "Supervisor de Logística", "Operações", "Sede Goiânia", "diego.almeida@empresa.com", True)}
                  <ul>
                    <li>
                      {card("rafael", "author-3.jpg", "Rafael Nunes", "Coordenador dos Jogos Internos", "Operações", "Sede Goiânia", "rafael.nunes@empresa.com")}
                    </li>
                    <li>
                      {card("patricia", "author-11.jpg", "Patrícia Souza", "Assistente Administrativo", "Operações", "Unidade Aparecida", "patricia.souza@empresa.com")}
                    </li>
                  </ul>
                </li>
                <li>
                  {card("marcelo", "author-12.jpg", "Marcelo Dias", "Contador", "Financeiro", "Sede Goiânia", "marcelo.dias@empresa.com", True)}
                  <ul>
                    <li>
                      {card("bruno", "author-6.jpg", "Bruno Oliveira", "Assistente Financeiro", "Financeiro", "Unidade Anápolis", "bruno.oliveira@empresa.com")}
                    </li>
                  </ul>
                </li>
                <li>
                  {card("ana", "author-5.jpg", "Ana Paula Mendes", "Analista Jurídica", "Jurídico", "Sede Goiânia", "ana.mendes@empresa.com", True)}
                  <ul>
                    <li>
                      {card("lucas", "author-8.jpg", "Lucas Ferreira", "Advogado", "Jurídico", "Sede Goiânia", "lucas.ferreira@empresa.com")}
                    </li>
                  </ul>
                </li>
                <li>
                  {card("juliana", "author-9.jpg", "Juliana Castro", "Analista de Compliance", "Compliance", "Sede Goiânia", "juliana.castro@empresa.com")}
                </li>
                <li>
                  {card("thiago", "author-10.jpg", "Thiago Ramos", "Coordenador de TI", "Tecnologia", "Sede Goiânia", "thiago.ramos@empresa.com")}
                </li>
              </ul>
            </li>
          </ul>"""

fullscreen_rh = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Organograma do RH. Estrutura interativa da equipe — INTRANET.">
  <meta name="keywords" content="intranet, portal interno, colaboradores, documentos, RH">
  <meta name="author" content="INTRANET">
  <meta name="theme-color" content="#f7f7f8">
  <title>Organograma do RH — INTRANET</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Sans+Condensed:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="assets/fontawesome/css/all.min.css">
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/svg+xml" href="assets/icons/favicon.svg">
</head>
<body class="org-fullscreen">
  <div class="org-fullscreen-page">
    <header class="org-fullscreen-head">
      <span class="badge badge--blue directory-kicker">Organograma</span>
      <h1 class="directory-title">Organograma do RH</h1>
      <p class="directory-lead">Clique em um colaborador para ver a ficha.</p>
      <p class="org-toolbar__hint"><i class="fa-solid fa-hand-pointer" aria-hidden="true"></i> Clique na foto ou no nome para abrir os dados.</p>
    </header>

    <div class="org-chart-wrap">
      {tree_html}
    </div>
  </div>
{PERSON_MODAL}
  <script src="script.js" defer></script>
</body>
</html>
"""

make_page(
    "organograma.html",
    "Organograma. Estrutura da empresa — INTRANET.",
    "Organograma",
    main_list,
)
(root / "organograma-rh.html").write_bytes(bytes([0xEF, 0xBB, 0xBF]) + fullscreen_rh.encode("utf-8"))
print("wrote organograma-rh.html")

old = 'href="#organograma"'
new = 'href="organograma.html"'
for path in sorted(root.glob("*.html")):
    raw = path.read_bytes()
    bom = raw.startswith(bytes([0xEF, 0xBB, 0xBF]))
    text = raw.decode("utf-8-sig")
    if old not in text:
        continue
    text = text.replace(old, new)
    out = text.encode("utf-8")
    if bom:
        out = bytes([0xEF, 0xBB, 0xBF]) + out
    path.write_bytes(out)
    print("menu", path.name)
