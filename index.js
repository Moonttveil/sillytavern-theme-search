(function () {
    'use strict';

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }


    function highlight(text, query) {
        if (!query) return document.createTextNode(text);
        const re = new RegExp(`(${escapeRegex(query)})`, 'gi');
        const parts = text.split(re);
        const frag = document.createDocumentFragment();
        parts.forEach(part => {
            if (re.test(part)) {
                const mark = document.createElement('mark');
                mark.textContent = part;
                frag.appendChild(mark);
                re.lastIndex = 0; // reset after test
            } else {
                frag.appendChild(document.createTextNode(part));
            }
        });
        return frag;
    }


    function getThemeSelect() {

        const candidates = [
            'select#themes',
            'select[name="themes"]',
            '#user-settings-block select',   
        ];
        for (const sel of candidates) {
            const el = document.querySelector(sel);
            if (el && el.options.length > 1) return el;
        }

 
        const allSelects = Array.from(document.querySelectorAll('select'));
        return allSelects.find(sel => {
            const opts = Array.from(sel.options);
            return opts.length > 5 && opts.some(o => /[^\d\s]/.test(o.text));
        }) || null;
    }

 

    function buildSearchUI(themeSelect) {
   
        const wrapper = document.createElement('div');
        wrapper.id = 'theme-search-wrapper';

    
        const input = document.createElement('input');
        input.id = 'theme-search-input';
        input.type = 'text';
        input.placeholder = '🔍 Buscar tema…';
        input.autocomplete = 'off';
        input.spellcheck = false;


        const clearBtn = document.createElement('button');
        clearBtn.id = 'theme-search-clear';
        clearBtn.textContent = '✕';
        clearBtn.title = 'Limpiar búsqueda';
        clearBtn.type = 'button';


        const results = document.createElement('div');
        results.id = 'theme-search-results';


        const count = document.createElement('div');
        count.id = 'theme-search-count';

        wrapper.appendChild(input);
        wrapper.appendChild(clearBtn);
        wrapper.appendChild(results);


        themeSelect.parentNode.insertBefore(wrapper, themeSelect);
        themeSelect.parentNode.insertBefore(count, themeSelect);

        return { input, clearBtn, results, count };
    }


    function applyTheme(themeSelect, value) {
        themeSelect.value = value;
        themeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        themeSelect.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function initSearch(themeSelect) {
        const { input, clearBtn, results, count } = buildSearchUI(themeSelect);

        let activeIndex = -1;

        function getOptions() {
            return Array.from(themeSelect.options);
        }

        function showResults(query) {
            results.innerHTML = '';
            activeIndex = -1;

            const q = query.trim().toLowerCase();

            const matched = getOptions().filter(opt =>
                !q || opt.text.toLowerCase().includes(q)
            );

            count.textContent = q
                ? `${matched.length} coincidencia${matched.length !== 1 ? 's' : ''}`
                : '';

            if (!q || matched.length === 0) {
                results.style.display = 'none';
                return;
            }

            matched.forEach((opt, idx) => {
                const item = document.createElement('div');
                item.className = 'theme-search-item';
                item.dataset.value = opt.value;
                item.appendChild(highlight(opt.text, q));

                item.addEventListener('mousedown', e => {
                    e.preventDefault();
                    applyTheme(themeSelect, opt.value);
                    input.value = opt.text;
                    results.style.display = 'none';
                    clearBtn.style.display = 'inline';
                    count.textContent = '';
                });

                results.appendChild(item);
            });

            results.style.display = 'block';
        }

        function moveActive(dir) {
            const items = results.querySelectorAll('.theme-search-item');
            if (!items.length) return;
            items[activeIndex]?.classList.remove('active');
            activeIndex = (activeIndex + dir + items.length) % items.length;
            const target = items[activeIndex];
            target.classList.add('active');
            target.scrollIntoView({ block: 'nearest' });
        }


        input.addEventListener('input', () => {
            const q = input.value;
            clearBtn.style.display = q ? 'inline' : 'none';
            showResults(q);
        });

        input.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
            else if (e.key === 'Enter') {
                e.preventDefault();
                const active = results.querySelector('.theme-search-item.active');
                const first = results.querySelector('.theme-search-item');
                const target = active || first;
                if (target) {
                    applyTheme(themeSelect, target.dataset.value);
                    input.value = target.textContent;
                    results.style.display = 'none';
                    count.textContent = '';
                }
            } else if (e.key === 'Escape') {
                results.style.display = 'none';
            }
        });

        input.addEventListener('focus', () => {
            if (input.value.trim()) showResults(input.value);
        });

        input.addEventListener('blur', () => {
            setTimeout(() => { results.style.display = 'none'; }, 150);
        });

        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.style.display = 'none';
            results.style.display = 'none';
            count.textContent = '';
            input.focus();
        });
    }


    const INJECTION_ID = 'theme-search-wrapper';
    let injected = false;

    function tryInject() {
        if (injected && document.getElementById(INJECTION_ID)) return;
        injected = false; 

        const themeSelect = getThemeSelect();
        if (!themeSelect) return;

        if (document.getElementById(INJECTION_ID)) return;

        console.log('[ThemeSearch] Theme selector found, injecting search bar…');
        initSearch(themeSelect);
        injected = true;
    }

    const observer = new MutationObserver(() => tryInject());
    observer.observe(document.body, { childList: true, subtree: true });

    tryInject();

})();
