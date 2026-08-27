/**
 * INTRANET — Portal interno
 * JavaScript modular — interações e utilitários
 */

(function () {
  'use strict';

  const NOTICE_STORAGE_KEY = 'intranet_aviso_ts';
  const NOTICE_TTL_MS = 24 * 60 * 60 * 1000;

  /* ============================================
     Módulo: Data e hora (Top Bar)
     ============================================ */
  const DateTimeModule = {
    diasSemana: [
      'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
      'quinta-feira', 'sexta-feira', 'sábado'
    ],
    meses: [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ],

    formatar(data) {
      const dia = data.getDate();
      const mes = this.meses[data.getMonth()];
      const ano = data.getFullYear();
      const semana = this.diasSemana[data.getDay()];
      return `${dia} de ${mes} de ${ano}, ${semana}`;
    },

    init() {
      const el = document.querySelector('#current-date .top-bar__text');
      if (!el) return;
      el.textContent = this.formatar(new Date());
    }
  };

  /* ============================================
     Módulo: Menu sticky e sombra
     ============================================ */
  const StickyNavModule = {
    nav: null,
    threshold: 120,

    init() {
      this.nav = document.getElementById('main-nav');
      if (!this.nav) return;

      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
      this.onScroll();
    },

    onScroll() {
      const stuck = window.scrollY > this.threshold;
      this.nav.classList.toggle('is-stuck', stuck);
    }
  };

  /* ============================================
     Módulo: Menu mobile (hambúrguer)
     ============================================ */
  const MobileMenuModule = {
    toggle: null,
    nav: null,
    overlay: null,
    isOpen: false,

    init() {
      this.toggle = document.getElementById('menu-toggle');
      this.nav = document.getElementById('main-nav');
      if (!this.toggle || !this.nav) return;

      this.createOverlay();
      this.toggle.addEventListener('click', () => this.toggleMenu());
      this.overlay.addEventListener('click', () => this.close());
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && this.isOpen) this.close();
      });
    },

    createOverlay() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'nav-overlay';
      this.overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.overlay);
    },

    toggleMenu() {
      this.isOpen ? this.close() : this.open();
    },

    open() {
      this.isOpen = true;
      this.nav.classList.add('is-open');
      this.toggle.classList.add('is-active');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.overlay.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    },

    close() {
      this.isOpen = false;
      this.nav.classList.remove('is-open');
      this.toggle.classList.remove('is-active');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.overlay.classList.remove('is-visible');
      document.body.style.overflow = '';
      this.closeDropdowns();
    },

    closeDropdowns() {
      document.querySelectorAll('.main-nav__item--has-dropdown.is-open, .main-nav__item--profile.is-open, .main-nav__item--has-sub.is-open').forEach((item) => {
        item.classList.remove('is-open');
        item.querySelector(':scope > .main-nav__link, :scope > .main-nav__dropdown-link')?.setAttribute('aria-expanded', 'false');
      });
    }
  };

  /* ============================================
     Módulo: Busca
     ============================================ */
  const SearchModule = {
    init() {
      const form = document.querySelector('.search-form');
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('.search-form__input');
        const termo = input?.value.trim();
        if (termo) {
          console.info('[INTRANET] Busca:', termo);
        }
      });
    }
  };

  /* ============================================
     Módulo: Links de navegação ativos
     ============================================ */
  const NavActiveModule = {
    isMobile() {
      return window.innerWidth <= 768;
    },

    closeNavDropdowns(except) {
      document.querySelectorAll('.main-nav__item--has-dropdown.is-open, .main-nav__item--profile.is-open, .main-nav__item--has-sub.is-open').forEach((item) => {
        if (item === except) return;
        item.classList.remove('is-open');
        item.querySelector(':scope > .main-nav__link, :scope > .main-nav__dropdown-link')?.setAttribute('aria-expanded', 'false');
      });
    },

    setActive(link) {
      document.querySelectorAll('.main-nav__link').forEach((l) => l.classList.remove('main-nav__link--active'));
      document.querySelectorAll('.main-nav__dropdown-link').forEach((l) => l.classList.remove('is-active'));

      if (link.classList.contains('main-nav__dropdown-link')) {
        link.classList.add('is-active');
        link.closest('.main-nav__item--has-dropdown')?.querySelector(':scope > .main-nav__link')?.classList.add('main-nav__link--active');
        return;
      }

      link.classList.add('main-nav__link--active');
    },

    init() {
      const topLinks = document.querySelectorAll('.main-nav__list > li > .main-nav__link');
      const dropdownLinks = document.querySelectorAll('.main-nav__dropdown-link');
      const profileItem = document.querySelector('.main-nav__item--profile');
      const profileToggle = document.getElementById('profile-toggle');

      topLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          if (link === profileToggle) {
            e.preventDefault();
            if (this.isMobile() && profileItem) {
              const open = profileItem.classList.toggle('is-open');
              profileToggle.setAttribute('aria-expanded', String(open));
              if (open) this.closeNavDropdowns(profileItem);
            }
            return;
          }

          const dropdownItem = link.closest('.main-nav__item--has-dropdown');
          if (dropdownItem) {
            e.preventDefault();
            if (this.isMobile()) {
              const open = dropdownItem.classList.toggle('is-open');
              link.setAttribute('aria-expanded', String(open));
              if (open) this.closeNavDropdowns(dropdownItem);
            }
            return;
          }

          if (link.getAttribute('href') === '#') {
            e.preventDefault();
          }
          this.setActive(link);
          this.closeNavDropdowns();

          if (this.isMobile()) {
            MobileMenuModule.close();
          }
        });
      });

      dropdownLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          if (link.hasAttribute('data-submenu-toggle')) {
            e.preventDefault();
            if (this.isMobile()) {
              const item = link.closest('.main-nav__item--has-sub');
              const open = item.classList.toggle('is-open');
              link.setAttribute('aria-expanded', String(open));
            }
            return;
          }

          this.setActive(link);
          this.closeNavDropdowns();
          if (this.isMobile()) {
            MobileMenuModule.close();
          }
        });
      });

      document.getElementById('intranet-logout')?.addEventListener('click', (e) => {
        e.preventDefault();
      });
    }
  };

  /* ============================================
     Módulo: Aviso importante (24h)
     ============================================ */
  const NoticeModalModule = {
    modal: null,

    shouldShow() {
      try {
        const ts = Number(localStorage.getItem(NOTICE_STORAGE_KEY) || 0);
        if (!ts) return true;
        return Date.now() - ts >= NOTICE_TTL_MS;
      } catch (err) {
        return true;
      }
    },

    open() {
      if (!this.modal) return;
      this.modal.hidden = false;
      document.body.style.overflow = 'hidden';
    },

    close() {
      if (!this.modal) return;
      this.modal.hidden = true;
      document.body.style.overflow = '';
      try {
        localStorage.setItem(NOTICE_STORAGE_KEY, String(Date.now()));
      } catch (err) {
        /* storage indisponível */
      }
    },

    init() {
      this.modal = document.getElementById('notice-modal');
      if (!this.modal) return;

      this.modal.querySelectorAll('[data-close-notice]').forEach((el) => {
        el.addEventListener('click', () => this.close());
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !this.modal.hidden) this.close();
      });

      if (this.shouldShow()) {
        this.open();
      }
    }
  };

  /* ============================================
     Módulo: Fale com a Diretoria
     ============================================ */
  const BoardModalModule = {
    modal: null,

    open() {
      if (!this.modal) return;
      this.modal.hidden = false;
      document.body.style.overflow = 'hidden';
    },

    close() {
      if (!this.modal) return;
      this.modal.hidden = true;
      if (document.getElementById('notice-modal')?.hidden !== false) {
        document.body.style.overflow = '';
      }
    },

    init() {
      this.modal = document.getElementById('board-modal');
      const trigger = document.getElementById('open-board-modal');
      const form = document.getElementById('board-form');
      const feedback = document.getElementById('board-feedback');
      if (!this.modal || !trigger) return;

      trigger.addEventListener('click', () => this.open());
      this.modal.querySelectorAll('[data-close-board]').forEach((el) => {
        el.addEventListener('click', () => this.close());
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !this.modal.hidden) this.close();
      });

      form?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (feedback) feedback.hidden = false;
        form.reset();
        window.setTimeout(() => this.close(), 1400);
      });
    }
  };

  /* ============================================
     Módulo: Galeria
     ============================================ */
  const GalleryModule = {
    init() {
      const lightbox = document.getElementById('gallery-lightbox');
      const image = document.getElementById('gallery-lightbox-image');
      const title = document.getElementById('gallery-lightbox-title');
      const closeBtn = document.getElementById('gallery-close');
      if (!lightbox || !image) return;

      const close = () => {
        lightbox.hidden = true;
        image.src = '';
        document.body.style.overflow = '';
      };

      document.querySelectorAll('.gallery-card').forEach((card) => {
        card.addEventListener('click', () => {
          image.src = card.dataset.gallerySrc || '';
          image.alt = card.dataset.galleryTitle || '';
          if (title) title.textContent = card.dataset.galleryTitle || '';
          lightbox.hidden = false;
          document.body.style.overflow = 'hidden';
        });
      });

      closeBtn?.addEventListener('click', close);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) close();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.hidden) close();
      });
    }
  };

  /* ============================================
     Módulo: Currículo
     ============================================ */
  const CurriculumModule = {
    bindForm(form, feedback) {
      if (!form) return;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (feedback) feedback.hidden = false;
        form.reset();
        const fileName = form.querySelector('#cv-file-name');
        if (fileName) fileName.textContent = 'PDF ou DOC';
      });
    },

    init() {
      this.bindForm(
        document.getElementById('curriculum-form'),
        document.getElementById('curriculum-feedback')
      );
      this.bindForm(
        document.getElementById('board-page-form'),
        document.getElementById('board-page-feedback')
      );

      const fileInput = document.getElementById('cv-file');
      const fileName = document.getElementById('cv-file-name');
      fileInput?.addEventListener('change', () => {
        if (!fileName) return;
        fileName.textContent = fileInput.files?.[0]?.name || 'PDF ou DOC';
      });
    }
  };

  /* ============================================
     Módulo: Clima e cotações
     ============================================ */
  const MarketWidgetsModule = {
    weatherCodes: {
      0: ['Céu limpo', 'fa-sun'],
      1: ['Principalmente limpo', 'fa-sun'],
      2: ['Parcialmente nublado', 'fa-cloud-sun'],
      3: ['Nublado', 'fa-cloud'],
      45: ['Neblina', 'fa-smog'],
      48: ['Neblina', 'fa-smog'],
      51: ['Garoa', 'fa-cloud-rain'],
      53: ['Garoa', 'fa-cloud-rain'],
      55: ['Garoa forte', 'fa-cloud-rain'],
      61: ['Chuva fraca', 'fa-cloud-showers-heavy'],
      63: ['Chuva', 'fa-cloud-showers-heavy'],
      65: ['Chuva forte', 'fa-cloud-showers-heavy'],
      80: ['Pancadas', 'fa-cloud-showers-heavy'],
      81: ['Pancadas', 'fa-cloud-showers-heavy'],
      82: ['Pancadas fortes', 'fa-cloud-showers-heavy'],
      95: ['Tempestade', 'fa-cloud-bolt'],
      96: ['Tempestade', 'fa-cloud-bolt'],
      99: ['Tempestade', 'fa-cloud-bolt']
    },

    money(value, digits) {
      return Number(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
      });
    },

    fillQuote(prefix, item, digits) {
      const valueEl = document.getElementById(`quote-${prefix}`);
      const changeEl = document.getElementById(`quote-${prefix}-change`);
      if (!valueEl || !item) return;

      valueEl.textContent = this.money(item.bid, digits);
      const change = Number(item.pctChange);
      const sign = change > 0 ? '+' : '';
      changeEl.textContent = `${sign}${change.toFixed(2).replace('.', ',')}%`;
      changeEl.classList.toggle('is-up', change > 0);
      changeEl.classList.toggle('is-down', change < 0);
    },

    weatherInfo(code) {
      return this.weatherCodes[code] || ['Condição variável', 'fa-cloud-sun'];
    },

    async loadWeather() {
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=-16.6869&longitude=-49.2648&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo&forecast_days=7';
      const res = await fetch(url);
      if (!res.ok) throw new Error('clima');
      const data = await res.json();
      const current = data.current || {};
      const [label, icon] = this.weatherInfo(current.weather_code);
      const temp = Math.round(current.temperature_2m);
      const maxToday = Math.round(data.daily?.temperature_2m_max?.[0] ?? temp);
      const minToday = Math.round(data.daily?.temperature_2m_min?.[0] ?? temp);

      const tempEl = document.getElementById('weather-temp');
      const descEl = document.getElementById('weather-desc');
      const humidityEl = document.getElementById('weather-humidity');
      const windEl = document.getElementById('weather-wind');
      const rangeEl = document.getElementById('weather-range');
      const iconEl = document.getElementById('weather-icon');
      const topTemp = document.getElementById('top-weather-temp');
      const daysEl = document.getElementById('weather-days');

      if (tempEl) tempEl.textContent = String(temp);
      if (descEl) descEl.textContent = label;
      if (humidityEl) humidityEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
      if (windEl) windEl.textContent = `${Number(current.wind_speed_10m).toFixed(2)} km/h`;
      if (rangeEl) rangeEl.textContent = `${maxToday}º - ${minToday}º`;
      if (iconEl) iconEl.className = `fa-solid ${icon}`;
      if (topTemp) topTemp.textContent = `${temp}°C`;

      if (daysEl && data.daily) {
        const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
        daysEl.innerHTML = data.daily.time.map((iso, i) => {
          const date = new Date(`${iso}T12:00:00`);
          const max = Math.round(data.daily.temperature_2m_max[i]);
          const [, dayIcon] = this.weatherInfo(data.daily.weather_code[i]);
          return `<li><i class="fa-solid ${dayIcon}" aria-hidden="true"></i><strong>${max} °C</strong><span>${weekdays[date.getDay()]}</span></li>`;
        }).join('');
      }
    },

    async loadQuotes() {
      const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL,GBP-BRL');
      if (!res.ok) throw new Error('cotacoes');
      const data = await res.json();
      this.fillQuote('usd', data.USDBRL, 2);
      this.fillQuote('eur', data.EURBRL, 2);
      this.fillQuote('btc', data.BTCBRL, 0);
      this.fillQuote('gbp', data.GBPBRL, 2);
    },

    init() {
      this.loadWeather().catch(() => {
        const descEl = document.getElementById('weather-desc');
        if (descEl) descEl.textContent = 'Clima indisponível no momento';
      });
      this.loadQuotes().catch(() => {});
    }
  };

  /* ============================================
     Módulo: Lazy reveal no scroll (leve)
     ============================================ */
  const ScrollRevealModule = {
    init() {
      if (!('IntersectionObserver' in window)) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      document.querySelectorAll('.cta-whatsapp__inner, .site-footer, .curriculum-card, .split-layout--widgets').forEach((el) => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.6s ease';
        observer.observe(el);
      });
    }
  };

  /* ============================================
     Módulo: Diretório de colaboradores
     ============================================ */
  const DirectoryModule = {
    contacts: {
      'marina.costa@empresa.com': { phone: '(62) 3224-7580', ramal: '1800', manager: 'Paulo Henrique Dias', admitted: '07/01/2018', birthday: '12/03/1988' },
      'diego.almeida@empresa.com': { phone: '(62) 3224-7581', ramal: '2400', manager: 'Marina Costa', admitted: '15/03/2019', birthday: '04/11/1985' },
      'camila.freitas@empresa.com': { phone: '(62) 3224-7582', ramal: '1900', manager: 'Marina Costa', admitted: '22/06/2021', birthday: '19/05/1991' },
      'rafael.nunes@empresa.com': { phone: '(62) 3224-7583', ramal: '2410', manager: 'Diego Almeida', admitted: '03/02/2020', birthday: '08/09/1990' },
      'ana.mendes@empresa.com': { phone: '(62) 3224-7584', ramal: '2200', manager: 'Paulo Henrique Dias', admitted: '07/01/2020', birthday: '24/08/1992' },
      'bruno.oliveira@empresa.com': { phone: '(62) 3224-7585', ramal: '2300', manager: 'Marcelo Dias', admitted: '11/08/2022', birthday: '30/01/1994' },
      'fernanda.lima@empresa.com': { phone: '(62) 3224-7586', ramal: '1810', manager: 'Marina Costa', admitted: '18/04/2021', birthday: '14/07/1993' },
      'lucas.ferreira@empresa.com': { phone: '(62) 3224-7587', ramal: '2210', manager: 'Ana Paula Mendes', admitted: '09/09/2019', birthday: '21/12/1987' },
      'juliana.castro@empresa.com': { phone: '(62) 3224-7588', ramal: '2500', manager: 'Paulo Henrique Dias', admitted: '02/05/2023', birthday: '05/04/1995' },
      'thiago.ramos@empresa.com': { phone: '(62) 3224-7589', ramal: '2100', manager: 'Paulo Henrique Dias', admitted: '27/10/2017', birthday: '16/02/1986' },
      'patricia.souza@empresa.com': { phone: '(62) 3224-7590', ramal: '2420', manager: 'Diego Almeida', admitted: '13/11/2018', birthday: '28/06/1989' },
      'marcelo.dias@empresa.com': { phone: '(62) 3224-7591', ramal: '2310', manager: 'Paulo Henrique Dias', admitted: '06/03/2016', birthday: '02/10/1983' }
    },

    setText(id, value) {
      const el = document.getElementById(id);
      if (el) el.textContent = value || '—';
    },

    openPerson(card) {
      const modal = this.modal;
      if (!modal || !card) return;

      const name = card.querySelector('.directory-card__name')?.textContent.trim() || '';
      const role = card.querySelector('.directory-card__role')?.textContent.trim() || card.dataset.role || '';
      const photo = card.querySelector('.directory-card__photo');
      const email = card.dataset.email || '';
      const dept = card.dataset.dept || '';
      const unit = card.dataset.unit || '';
      const status = card.dataset.status || '';
      const contact = this.contacts[email] || {};

      this.setText('person-modal-badge', dept || 'Colaborador');
      this.setText('person-modal-title', name);
      this.setText('person-modal-job', role);
      this.setText('person-modal-meta', [dept, unit].filter(Boolean).join(' · '));
      this.setText('person-modal-unit', unit);
      this.setText('person-modal-phone', contact.phone);
      this.setText('person-modal-ramal', contact.ramal);
      this.setText('person-modal-admitted', contact.admitted);
      this.setText('person-modal-birthday', contact.birthday);

      const emailEl = document.getElementById('person-modal-email');
      if (emailEl) {
        emailEl.textContent = email || '—';
        emailEl.href = email ? `mailto:${email}` : '#';
      }

      const statusEl = document.getElementById('person-modal-status');
      if (statusEl) {
        statusEl.textContent = status || '—';
        statusEl.className = 'status-badge';
        if (status === 'Ativo') statusEl.classList.add('status-badge--ok');
        else if (status === 'Afastado') statusEl.classList.add('status-badge--err');
        else if (status) statusEl.classList.add('status-badge--warn');
      }

      const photoEl = document.getElementById('person-modal-photo');
      if (photoEl) {
        photoEl.src = photo?.src || '';
        photoEl.alt = photo?.alt || name;
      }

      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      modal.querySelector('.person-modal__close')?.focus();
    },

    closePerson() {
      if (!this.modal) return;
      this.modal.hidden = true;
      document.body.style.overflow = '';
    },

    init() {
      const results = document.getElementById('directory-results');
      const empty = document.getElementById('directory-empty');
      const form = document.getElementById('directory-filters');
      if (!results || !form) return;

      const cards = Array.from(results.querySelectorAll('.directory-card'));
      const search = document.getElementById('directory-search');
      const dept = document.getElementById('directory-dept');
      const unit = document.getElementById('directory-unit');
      const role = document.getElementById('directory-role');
      const status = document.getElementById('directory-status');
      const viewBtns = form.querySelectorAll('.directory-view__btn');

      this.modal = document.getElementById('person-modal');
      this.modal?.querySelectorAll('[data-close-person]').forEach((el) => {
        el.addEventListener('click', () => this.closePerson());
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal && !this.modal.hidden) {
          this.closePerson();
        }
      });

      const applyFilters = () => {
        const term = (search?.value || '').trim().toLowerCase();
        const deptVal = dept?.value || '';
        const unitVal = unit?.value || '';
        const roleVal = role?.value || '';
        const statusVal = status?.value || '';
        let visible = 0;

        cards.forEach((card) => {
          const haystack = [
            card.dataset.name,
            card.dataset.role,
            card.dataset.email
          ].join(' ');
          const matchTerm = !term || haystack.includes(term);
          const matchDept = !deptVal || card.dataset.dept === deptVal;
          const matchUnit = !unitVal || card.dataset.unit === unitVal;
          const matchRole = !roleVal || card.dataset.role === roleVal.toLowerCase();
          const matchStatus = !statusVal || card.dataset.status === statusVal;
          const show = matchTerm && matchDept && matchUnit && matchRole && matchStatus;
          card.classList.toggle('is-hidden', !show);
          if (show) visible += 1;
        });

        if (empty) empty.hidden = visible > 0;
      };

      [search, dept, unit, role, status].forEach((el) => {
        el?.addEventListener('input', applyFilters);
        el?.addEventListener('change', applyFilters);
      });

      viewBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          viewBtns.forEach((other) => {
            other.classList.toggle('is-active', other === btn);
            other.setAttribute('aria-pressed', String(other === btn));
          });
          results.classList.toggle('is-list', btn.dataset.view === 'list');
        });
      });

      cards.forEach((card) => {
        const name = card.querySelector('.directory-card__name')?.textContent.trim() || 'colaborador';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-haspopup', 'dialog');
        card.setAttribute('aria-label', `Ver dados de ${name}`);
        card.addEventListener('click', () => this.openPerson(card));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.openPerson(card);
          }
        });
      });

      form.addEventListener('submit', (e) => e.preventDefault());
    }
  };

  /* ============================================
     Módulo: Perfil do usuário
     ============================================ */
  const ProfileModule = {
    maskPhone(value) {
      const digits = String(value).replace(/\D/g, '').slice(0, 11);
      if (digits.length <= 10) {
        return digits
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d)/, '$1-$2');
      }
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    },

    showFeedback(el, message, ok) {
      if (!el) return;
      el.hidden = false;
      el.textContent = message;
      el.classList.toggle('is-ok', ok);
      el.classList.toggle('is-error', !ok);
    },

    init() {
      const form = document.getElementById('profile-form');
      if (!form) return;

      const phone = document.getElementById('profile-phone');
      const ramal = document.getElementById('profile-ramal');
      const photo = document.getElementById('profile-photo');
      const preview = document.getElementById('profile-photo-preview');
      const nameInput = document.getElementById('profile-name');
      const roleInput = document.getElementById('profile-role');
      const displayName = document.querySelector('.profile-photo-card__name');
      const displayRole = document.querySelector('.profile-photo-card__role');
      const current = document.getElementById('profile-password-current');
      const next = document.getElementById('profile-password-new');
      const confirm = document.getElementById('profile-password-confirm');
      const feedback = document.getElementById('profile-feedback');

      phone?.addEventListener('input', () => {
        phone.value = this.maskPhone(phone.value);
      });

      ramal?.addEventListener('input', () => {
        ramal.value = ramal.value.replace(/\D/g, '').slice(0, 6);
      });

      nameInput?.addEventListener('input', () => {
        if (displayName) displayName.textContent = nameInput.value || 'Colaborador';
      });

      roleInput?.addEventListener('input', () => {
        if (displayRole) displayRole.textContent = roleInput.value || '';
      });

      photo?.addEventListener('change', () => {
        const file = photo.files && photo.files[0];
        if (!file || !preview) return;
        if (file.size > 2 * 1024 * 1024) {
          this.showFeedback(feedback, 'A foto deve ter no máximo 2 MB.', false);
          photo.value = '';
          return;
        }
        const url = URL.createObjectURL(file);
        preview.src = url;
        preview.alt = 'Nova foto de perfil';
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPass = next?.value || '';
        const confirmPass = confirm?.value || '';
        const currentPass = current?.value || '';

        if (newPass || confirmPass || currentPass) {
          if (!currentPass) {
            this.showFeedback(feedback, 'Informe a senha atual para alterar a senha.', false);
            current?.focus();
            return;
          }
          if (newPass.length < 8) {
            this.showFeedback(feedback, 'A nova senha deve ter no mínimo 8 caracteres.', false);
            next?.focus();
            return;
          }
          if (newPass !== confirmPass) {
            this.showFeedback(feedback, 'A confirmação não confere com a nova senha.', false);
            confirm?.focus();
            return;
          }
        }

        this.showFeedback(feedback, 'Dados do perfil atualizados com sucesso.', true);
        if (current) current.value = '';
        if (next) next.value = '';
        if (confirm) confirm.value = '';
      });
    }
  };

  /* ============================================
     Módulo: Avaliação de experiência (gestor)
     ============================================ */
  const EvaluationModule = {
    todayValue() {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${today.getFullYear()}-${month}-${day}`;
    },

    showFeedback(el, message, ok) {
      if (!el) return;
      el.hidden = false;
      el.textContent = message;
      el.classList.toggle('is-ok', ok);
      el.classList.toggle('is-error', !ok);
    },

    clearErrors(form) {
      form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    },

    markInvalid(el) {
      if (el) el.classList.add('is-invalid');
      return el;
    },

    validateForm(form) {
      this.clearErrors(form);
      let firstInvalid = null;

      const questionNames = [...new Set(
        [...form.querySelectorAll('.eval-scale input[type="radio"]')].map((input) => input.name)
      )];

      questionNames.forEach((name) => {
        if (!form.querySelector(`input[name="${name}"]:checked`)) {
          const item = form.querySelector(`input[name="${name}"]`)?.closest('.eval-item');
          firstInvalid = firstInvalid || this.markInvalid(item);
        }
      });

      form.querySelectorAll('textarea[required]').forEach((input) => {
        if (!input.value.trim()) {
          firstInvalid = firstInvalid || this.markInvalid(input.closest('.directory-field'));
        }
      });

      const recommend = form.querySelector('.eval-recommend');
      if (recommend && !form.querySelector('input[name="recomendacao"]:checked')) {
        firstInvalid = firstInvalid || this.markInvalid(recommend);
      }

      return firstInvalid;
    },

    init() {
      const form = document.querySelector('.eval-form');
      if (!form) return;

      const dateInput = document.getElementById('eval-date');
      if (dateInput) dateInput.value = this.todayValue();

      const feedback = form.querySelector('.profile-form__feedback');

      form.addEventListener('change', (e) => {
        const item = e.target.closest('.eval-item, .directory-field, .eval-recommend');
        item?.classList.remove('is-invalid');
      });

      form.addEventListener('input', (e) => {
        if (e.target.tagName === 'TEXTAREA') {
          e.target.closest('.directory-field')?.classList.remove('is-invalid');
        }
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const firstInvalid = this.validateForm(form);
        if (firstInvalid) {
          this.showFeedback(feedback, 'Preencha todas as respostas obrigatórias.', false);
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        this.showFeedback(feedback, 'Avaliação enviada com sucesso. O RH receberá o parecer do gestor.', true);
        form.reset();
        this.clearErrors(form);
        if (dateInput) dateInput.value = this.todayValue();
        feedback?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  };

  /* ============================================
     Módulo: Vídeo Aqui eu Cresço
     ============================================ */
  const GrowthVideoModule = {
    init() {
      const modal = document.getElementById('growth-video-modal');
      const trigger = document.getElementById('open-growth-video');
      const video = document.getElementById('growth-video');
      if (!modal || !trigger || !video) return;

      const close = () => {
        modal.hidden = true;
        video.pause();
        document.body.style.overflow = '';
      };

      trigger.addEventListener('click', () => {
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        video.currentTime = 0;
        const play = video.play();
        if (play && typeof play.catch === 'function') play.catch(() => {});
      });

      modal.querySelectorAll('[data-close-growth-video]').forEach((el) => {
        el.addEventListener('click', close);
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) close();
      });
    }
  };

  /* ============================================
     Módulo: Copiar dados de acesso do curso
     ============================================ */
  const CourseAccessModule = {
    copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }

      return new Promise((resolve, reject) => {
        const field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.left = '-9999px';
        document.body.appendChild(field);
        field.select();
        try {
          document.execCommand('copy');
          resolve();
        } catch (err) {
          reject(err);
        } finally {
          field.remove();
        }
      });
    },

    init() {
      document.querySelectorAll('[data-copy-target]').forEach((button) => {
        button.addEventListener('click', () => {
          const target = document.getElementById(button.getAttribute('data-copy-target'));
          const text = target?.textContent.trim();
          if (!text) return;

          this.copyText(text).then(() => {
            const label = button.querySelector('span');
            const icon = button.querySelector('i');
            const previousLabel = label?.textContent;
            button.classList.add('is-copied');
            if (label) label.textContent = 'Copiado';
            if (icon) icon.className = 'fa-solid fa-check';
            window.setTimeout(() => {
              button.classList.remove('is-copied');
              if (label) label.textContent = previousLabel || 'Copiar';
              if (icon) icon.className = 'fa-regular fa-copy';
            }, 1600);
          }).catch(() => {});
        });
      });
    }
  };

  /* ============================================
     Módulo: Visualizador de PDF (mobile / iOS)
     ============================================ */
  const PdfViewerModule = {
    libSrc: 'assets/pdfjs/pdf.min.js',
    workerSrc: 'assets/pdfjs/pdf.worker.min.js',
    libPromise: null,

    needsJsViewer() {
      const ua = navigator.userAgent || '';
      const iOS = /iPhone|iPod/i.test(ua) || /iPad/i.test(ua)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      return iOS || /Android/i.test(ua);
    },

    loadLib() {
      if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
      if (this.libPromise) return this.libPromise;

      this.libPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = this.libSrc;
        script.onload = () => {
          if (!window.pdfjsLib) {
            reject(new Error('pdf.js não carregou'));
            return;
          }
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = this.workerSrc;
          resolve(window.pdfjsLib);
        };
        script.onerror = () => reject(new Error('Falha ao carregar pdf.js'));
        document.head.appendChild(script);
      });

      return this.libPromise;
    },

    init() {
      const frames = document.querySelectorAll('iframe.pdf-viewer');
      if (!frames.length || !this.needsJsViewer()) return;
      frames.forEach((iframe) => {
        this.mount(iframe).catch(() => {});
      });
    },

    async mount(iframe) {
      const src = iframe.getAttribute('src');
      if (!src) return;

      const wrap = iframe.closest('.pdf-viewer-wrap') || iframe.parentElement;
      const embed = document.createElement('div');
      embed.className = 'pdf-embed';
      embed.innerHTML = `
        <div class="pdf-embed__toolbar">
          <button type="button" class="pdf-embed__btn" data-pdf-prev aria-label="Página anterior"><i class="fa-solid fa-chevron-left"></i></button>
          <span class="pdf-embed__page">Carregando...</span>
          <button type="button" class="pdf-embed__btn" data-pdf-next aria-label="Próxima página"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        <div class="pdf-embed__stage">
          <canvas class="pdf-embed__canvas"></canvas>
        </div>
      `;
      iframe.replaceWith(embed);

      const pdfjsLib = await this.loadLib();
      const pdf = await pdfjsLib.getDocument(src).promise;
      const state = {
        pdf,
        page: 1,
        canvas: embed.querySelector('canvas'),
        stage: embed.querySelector('.pdf-embed__stage'),
        label: embed.querySelector('.pdf-embed__page')
      };

      const render = async () => {
        const page = await state.pdf.getPage(state.page);
        const base = page.getViewport({ scale: 1 });
        const width = state.stage.clientWidth || wrap.clientWidth || 320;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: (width / base.width) * dpr });
        const context = state.canvas.getContext('2d');
        state.canvas.width = viewport.width;
        state.canvas.height = viewport.height;
        state.canvas.style.width = '100%';
        state.canvas.style.height = 'auto';
        await page.render({ canvasContext: context, viewport }).promise;
        state.label.textContent = state.page + ' / ' + state.pdf.numPages;
      };

      embed.querySelector('[data-pdf-prev]').addEventListener('click', () => {
        if (state.page <= 1) return;
        state.page -= 1;
        render();
      });
      embed.querySelector('[data-pdf-next]').addEventListener('click', () => {
        if (state.page >= state.pdf.numPages) return;
        state.page += 1;
        render();
      });
      window.addEventListener('resize', () => {
        window.clearTimeout(state.resizeTimer);
        state.resizeTimer = window.setTimeout(render, 200);
      });

      await render();
    }
  };

  /* ============================================
     Inicialização
     ============================================ */
  function init() {
    DateTimeModule.init();
    StickyNavModule.init();
    MobileMenuModule.init();
    SearchModule.init();
    NavActiveModule.init();
    NoticeModalModule.init();
    BoardModalModule.init();
    GalleryModule.init();
    CurriculumModule.init();
    MarketWidgetsModule.init();
    ScrollRevealModule.init();
    DirectoryModule.init();
    ProfileModule.init();
    EvaluationModule.init();
    GrowthVideoModule.init();
    CourseAccessModule.init();
    PdfViewerModule.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
