(() => {
      const root = document.documentElement;
      const body = document.body;
      const themeBtn = document.querySelector('[data-theme-toggle]');
      const cheatBtn = document.querySelector('[data-secret-toggle]');
      let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const syncTheme = () => {
        root.setAttribute('data-theme', theme);
        body.setAttribute('data-theme', theme);
        themeBtn.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
        themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      };
      syncTheme();
      themeBtn.addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        syncTheme();
      });
      cheatBtn.addEventListener('click', () => {
        body.classList.toggle('palette-flip');
        window._cheatMode = body.classList.contains('palette-flip');
        cheatBtn.textContent = window._cheatMode ? 'Cheat ON 🔓' : 'Cheat code';
      });

      const bootLines = [
        'INIT :: aclab research .......... READY',
        'MOUNT :: timeblind dataset ...... READY',
        'LOAD :: escalion engine ......... READY',
        'SPAWN :: gsg senate ............. READY',
        'SYNC :: rust toolchain .......... READY'
      ];
      const boot = document.getElementById('boot-lines');
      let bootIndex = 0;
      const tickBoot = () => {
        if (bootIndex >= bootLines.length) return;
        const line = document.createElement('div');
        line.textContent = bootLines[bootIndex++];
        boot.appendChild(line);
        if (bootIndex < bootLines.length) setTimeout(tickBoot, 400);
      };
      tickBoot();

      // ── VIRTUALIZED UNIX SHELL ─────────────────────────────────────
      const output = document.getElementById('terminal-output');
      const shellInput = document.getElementById('terminal-input');
      const shellForm = document.getElementById('terminal-form');
      const shellPromptEl = document.getElementById('shell-prompt');

      // Virtual filesystem
      const VFS = {
        type: 'dir', modified: 'Sep  1 2025',
        entries: {
          'about.txt': { type: 'file', size: 248, modified: 'Sep  1 2025',
            content: `Dhairya Bhatia
MS Computer Science — Northeastern University (2025–2027)
BSc Computer Science — University of British Columbia (2020–2024)

Building at the intersection of LLM tooling, embedded systems, and Rust.
Boston, MA · bhatiadhairya19@gmail.com` },
          'contact.txt': { type: 'file', size: 148, modified: 'May 16 10:22',
            content: `email     bhatiadhairya19@gmail.com
linkedin  linkedin.com/in/dhairyanbhatia
github    github.com/dhairyab0069
web       dhairyab0069.github.io` },
          'resume.pdf': { type: 'file', size: 89012, modified: 'May 16 09:14',
            content: '[binary PDF]\n→ https://dhairyab0069.github.io/Dhairya_Bhatia_Embedded_Security.pdf' },
          'research': { type: 'dir', modified: 'May 10 14:33', entries: {
            'cactilab': { type: 'dir', modified: 'May 10 14:33', entries: {
              'README.md': { type: 'file', size: 512, modified: 'May 10 14:33',
                content: `# Research Project — CACTILab, Northeastern University

Contributed to a research project at CACTILab.
Details to be shared at a later date.` },
              'pipeline.txt': { type: 'file', size: 384, modified: 'May  2 18:41',
                content: `[contents not available for public sharing]` },
              'hal_gpio.elf': { type: 'file', size: 42108, modified: 'May  2 2026',
                content: '[ELF binary — use checksec, readelf, or strings to inspect]' },
              '.classified': { type: 'dir', hidden: true, modified: 'May 10 14:33', entries: {
                'notes.txt': { type: 'file', size: 188, modified: 'May 10 14:33',
                  content: `# classified — do not commit

stage 2 prompt injection attempts logged: 3
all contained. model stayed on-task.

root cause: unescaped brace in PAC introspection prompt.
fix: strip { } before feeding to agent.

FLAG{gh0st_1n_th3_h4l}` }
              }},
              'progress.md': { type: 'file', size: 540, modified: 'May 10 14:33',
                content: `[contents not available for public sharing]` }
            }}}
          },
          'projects': { type: 'dir', modified: 'Jan 15 2026', entries: {
            'aclab': { type: 'dir', modified: 'May 20 2026', entries: {
              'README.md': { type: 'file', size: 412, modified: 'May 20 2026',
                content: `# ACLab — Augmented Cognition Lab\nNortheastern University\n\nRole: Research Lab Member (May 2026 – Present)\n\nContributions:\n  Paper reviewer — CV4Smalls Workshop, CVPR 2026\n  Collected 50+ video pairs contributing to the TimeBlind\n  spatio-temporal compositionality benchmark\n\nThesis project starting Fall 2026.` }
            }},
            'escalion': { type: 'dir', modified: 'May 16 11:20', entries: {
              'escalion.elf': { type: 'file', size: 18432, modified: 'May 16 11:20',
                content: '[ELF binary — use checksec or strings to inspect]' },
              'README.md': { type: 'file', size: 298, modified: 'May 16 11:20',
                content: `# Project Escalion — NU Launch Labs

Building a custom game engine in Rust from scratch.
Co-founded the studio through Northeastern's Launch Labs program.

Focus:
  Memory layout and architecture
  Performance-critical subsystems
  Zero-cost abstractions
  Low-level systems design

Status: Early stage — core architecture in progress.
Team:   NU Launch Labs` }
            }},
            'coursify': { type: 'dir', modified: 'Apr 20 2024', entries: {
              'README.md': { type: 'file', size: 261, modified: 'Apr 20 2024',
                content: `# Coursify.ai — UBC CS Capstone

LLM-assisted tools for K-12 educators. Built with a team of 5.

Features: lecture generation, quizzes, slides, course planning
Stack:    ReactJS · NodeJS · GPT-3.5
Status:   Completed April 2024` }
            }}
          }},
          'teaching': { type: 'dir', modified: 'Jan 10 2026', entries: {
            'cs3100': { type: 'dir', modified: 'May 16 08:30', entries: {
              'README.md': { type: 'file', size: 334, modified: 'May 16 08:30',
                content: `# Teaching Assistant — CS3100
# Programming and Design Paradigms II
# Khoury College of Computer Science, Northeastern University

Jan 2026 – Present

Responsibilities:
  Lab and assignment design + testing (pre-release)
  Office hours and lab sessions
  Student debugging support

Research:
  Analyzing student feedback on AI-assisted programming workflows
  Developing framework for human subjects study on AI usage in CS ed` },
              'feedback-study.txt': { type: 'file', size: 189, modified: 'Apr 28 16:12',
                content: `AI Usage Study — CS3100 (in progress)

Collecting + analyzing student feedback on AI-assisted programming
in a course where AI usage is actively encouraged.

Next step: IRB approval for human subjects component.` }
            }}
          }},
          '.env': { type: 'file', size: 312, modified: 'Sep  1 2025', hidden: true,
            content: `# Environment — dhairya@nextcube
EDITOR=vim
SHELL=/bin/zsh
LANG=en_US.UTF-8
RUST_LOG=debug
CARGO_HOME=/home/dhairya/.cargo
ANTHROPIC_API_KEY=sk-ant-[REDACTED]
LANGFUSE_PUBLIC_KEY=pk-lf-[REDACTED]

# nothing to see here
FLAG{d0tf1l3s_n3v3r_l13}` },
          '.bash_history': { type: 'file', size: 420, hidden: true, modified: 'May 16 11:44',
            content: `cat about.txt
cd research/cactilab
cargo build --target thumbv6m-none-eabi
cargo test
strings resume.pdf | grep FLAG
checksec research/cactilab/hal_gpio.elf
readelf -S research/cactilab/hal_gpio.elf
find . -name "*.flag"
ssh dhairya@nextcube` },
          'senate': { type: 'dir', modified: 'Feb 28 2026', entries: {
            'README.md': { type: 'file', size: 243, modified: 'Feb 28 2026',
              content: `# GSG — Graduate Student Government
# Senator for Student Affairs, Northeastern University
# Jan 2026 – Present

Initiatives:
  Club auditing and compliance
  Impact Symposium (volunteering + org)
  Student advocacy and outreach` },
            'awards.txt': { type: 'file', size: 178, modified: 'Mar  1 2026',
              content: `Senator of the Month — February 2026
  Awarded for contributions to student affairs

GLI Emerging Graduate Leader Award
  Graduate Leadership Institute (co-sponsored by GSG)` }
          }}
        }
      };

      // Shell state
      let cwdArr = [];
      const shellHistory = [];
      let histIdx = -1;

      // Filesystem helpers
      function getNode(pathArr) {
        let node = VFS;
        for (const seg of pathArr) {
          if (!node || node.type !== 'dir' || !node.entries[seg]) return null;
          node = node.entries[seg];
        }
        return node;
      }
      function formatCwd() {
        return cwdArr.length === 0 ? '~' : '~/' + cwdArr.join('/');
      }
      function updatePromptLabel() {
        shellPromptEl.textContent = `dhairya@nextcube:${formatCwd()}$`;
      }

      // Output helpers
      function w(html) {
        const d = document.createElement('div');
        d.innerHTML = html;
        output.appendChild(d);
      
      }
      function wPre(text) {
        const d = document.createElement('div');
        d.style.whiteSpace = 'pre';
        d.style.fontFamily = 'inherit';
        d.textContent = text;
        output.appendChild(d);
      }
      function wErr(msg) {
        w(`<span style="color:var(--color-magenta)">${esc(msg)}</span>`);
      }
      function esc(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      }
      function dirSpan(name) {
        return `<span style="color:var(--color-primary);font-weight:600">${esc(name)}/</span>`;
      }
      function fileSpan(name) {
        return `<span style="color:var(--color-text)">${esc(name)}</span>`;
      }

      // Resolve a path string relative to cwd
      function resolvePath(arg) {
        if (!arg || arg === '~') return [];
        if (arg === '-') return cwdArr.slice(0,-1); // crude cd -
        let segs;
        if (arg.startsWith('~/')) segs = arg.slice(2).split('/');
        else if (arg.startsWith('/')) segs = arg.slice(1).split('/');
        else segs = [...cwdArr, ...arg.split('/')];
        // normalise . and ..
        const out = [];
        for (const s of segs) {
          if (!s || s === '.') continue;
          if (s === '..') { if (out.length) out.pop(); }
          else out.push(s);
        }
        return out;
      }

      // Commands
      const CMDS = {
        help() {
          w(`<span style="color:var(--color-primary)">Commands:</span>`);
          const cmds = [
            ['ls [-la]',       'list directory'],
            ['cd [dir]',       'change directory'],
            ['cat [file]',     'read a file'],
            ['find [path]',    'search filesystem'],
            ['file [path]',    'identify file type'],
            ['strings [file]', 'extract printable strings'],
            ['checksec [elf]', 'check binary protections'],
            ['readelf [elf]',  'read ELF headers/sections'],
            ['xxd [file]',     'hex dump'],
            ['objdump [elf]',  'disassemble / dump sections'],
            ['ps [aux]',       'active processes'],
            ['uname [-a]',     'system information'],
            ['man [page]',     'manual  (try: man dhairya)'],
            ['history',        'command history'],
            ['clear',          'clear terminal'],
            ['ctf',            'start the CTF challenge 🚩'],
            ['hint [1-5]',     'get a hint for a flag'],
            ['submit FLAG{..}','submit a flag'],
            ['scoreboard',     'see your progress'],
            ['fastfetch',      'system information'],
            ['flip',           '🙃 cheat: flip the page'],
            ['dungeon',        '⚔️  cheat: enter the kernel dungeon'],
          ];
          for (const [cmd, desc] of cmds) {
            w(`  <span style="color:var(--color-green)">${esc(cmd.padEnd(14))}</span><span style="color:var(--color-text-muted)">${esc(desc)}</span>`);
          }
          w(`<span style="color:var(--color-text-faint)">Tip: use ↑/↓ for history, Tab to complete filenames.</span>`);
        },

        ls(args) {
          const longFmt = args.some(a => a.startsWith('-') && a.includes('l'));
          const showHidden = args.some(a => a.startsWith('-') && a.includes('a'));
          const targetArg = args.find(a => !a.startsWith('-'));
          const targetPath = targetArg ? resolvePath(targetArg) : cwdArr;
          const node = getNode(targetPath);
          if (!node) { wErr(`ls: ${targetArg}: No such file or directory`); return; }
          if (node.type !== 'dir') { wErr(`ls: ${targetArg}: Not a directory`); return; }
          const entries = Object.entries(node.entries)
            .filter(([n, e]) => showHidden || !e.hidden);
          if (longFmt) {
            w(`<span style="color:var(--color-text-faint)">total ${entries.length}</span>`);
            if (showHidden) {
              w(`<span style="color:var(--color-text-faint)">drwxr-xr-x  dhairya  -    May 16  </span>${dirSpan('.')}`);
              w(`<span style="color:var(--color-text-faint)">drwxr-xr-x  dhairya  -    Sep  1  </span>${dirSpan('..')}`);
            }
            for (const [name, entry] of entries) {
              const isDir = entry.type === 'dir';
              const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
              const size  = isDir ? '      -' : String(entry.size || 0).padStart(7);
              const mod   = (entry.modified || 'Jan  1 00:00').padEnd(14);
              const nameHtml = isDir ? dirSpan(name) : fileSpan(name);
              w(`<span style="color:var(--color-text-faint)">${perms}  dhairya  ${size}  ${mod} </span>${nameHtml}`);
            }
          } else {
            const chunks = entries.map(([name, entry]) =>
              `<span style="display:inline-block;min-width:18ch;margin-bottom:.1rem">${entry.type==='dir' ? dirSpan(name) : fileSpan(name)}</span>`
            );
            // 3 per row
            for (let i = 0; i < chunks.length; i += 3) {
              w(chunks.slice(i, i+3).join(''));
            }
          }
        },

        cd(args) {
          const target = args[0];
          const newPath = resolvePath(target);
          if (newPath.length > 0) {
            const node = getNode(newPath);
            if (!node) { wErr(`cd: ${target}: No such file or directory`); return; }
            if (node.type !== 'dir') { wErr(`cd: ${target}: Not a directory`); return; }
          }
          cwdArr = newPath;
    

      // ── PANEL SWITCHING ────────────────────────────────────────────
      function showPanel(name) {
        const panels = { about: 'panel-about', workbench: 'panel-workbench', mail: 'panel-mail' };
        Object.entries(panels).forEach(([k, id]) => {
          const el = document.getElementById(id);
          if (el) el.style.display = k === name ? '' : 'none';
        });
        document.querySelectorAll('.dock a').forEach(a => {
          a.classList.toggle('active', a.dataset.panel === name);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (name === 'about' && typeof tickBoot === 'function') tickBoot();
      }
      document.querySelectorAll('[data-panel]').forEach(a => {
        a.addEventListener('click', e => { e.preventDefault(); showPanel(a.dataset.panel); });
      });
      // ── CTF PANEL ──────────────────────────────────────────────────
      // No shared leaderboard — local score only

      const FLAG_MAP = {
        'FLAG{str1ngs_4r3_y0ur_fr13nd}': 1,
        'FLAG{d0tf1l3s_n3v3r_l13}':      2,
        'FLAG{ch3cks3c_pr0t3ct10ns}':    3,
        'FLAG{3lf_s3ct10n_hunt3r}':      4,
        'FLAG{gh0st_1n_th3_h4l}':        5,
        'FLAG{k3rn3l_dungeon_master}':   6,
      };

      // Load persisted state
      let ctfState = (() => {
        try { return JSON.parse(localStorage.getItem('ctf_state') || '{}'); } catch { return {}; }
      })();
      if (!ctfState.found) ctfState.found = [];

      function saveCTFState() {
        try { localStorage.setItem('ctf_state', JSON.stringify(ctfState)); } catch {}
      }

      function updateCTFPanel() {
        const n = ctfState.found.length;
        document.getElementById('ctf-score-label').textContent = n >= 6 ? `5 / 5 flags + bonus ⚔️` : `${Math.min(n,5)} / 5 flags found`;
        document.getElementById('ctf-score-fill').style.width = `${(Math.min(n,5)/5)*100}%`;
        ctfState.found.forEach(num => {
          const row = document.querySelector(`.ctf-flag-row[data-flag="${num}"]`);
          if (row) {
            row.classList.add('found');
            row.querySelector('.flag-icon').textContent = '✓';
          }
        });
        if (n >= 5) {
          document.getElementById('ctf-submit-row').classList.remove('ctf-locked');
        }
      }

      // Hook into window._ctfFound to sync with terminal submit
      const _origSubmit = window._ctfFound;
      function syncFromTerminal(flag) {
        const num = FLAG_MAP[flag];
        if (num && !ctfState.found.includes(num)) {
          ctfState.found.push(num);
          saveCTFState();
          updateCTFPanel();
        }
      }

      // Patch the terminal's submit command to also update panel
      const _origExec = execCmd;
      // We intercept via MutationObserver on terminal output — simpler
      const ctfObserver = new MutationObserver(() => {
        const found = window._ctfFound;
        if (found) {
          found.forEach(f => syncFromTerminal(f));
        }
      });
      ctfObserver.observe(output, { childList: true });

      // Submit handler — local only
      document.getElementById('ctf-submit-btn').addEventListener('click', () => {
        const handle = document.getElementById('ctf-handle').value.trim();
        const status = document.getElementById('ctf-status');
        if (!handle) { status.textContent = 'Enter a handle first.'; return; }
        if (ctfState.found.length < 1) { status.textContent = 'Find at least one flag first.'; return; }
        const btn = document.getElementById('ctf-submit-btn');
        const score = ctfState.found.length;
        btn.disabled = true;
        const base = Math.min(score, 5);
        btn.textContent = score >= 6 ? '🎉 5/5 + bonus!' : score === 5 ? '🎉 All 5 flags!' : `${base}/5 claimed`;
        status.textContent = score >= 6
          ? `${handle} — 5/5 flags + bonus dungeon flag. Impressive.`
          : score === 5
            ? `Nice work, ${handle}. All 5 flags captured.`
            : `${handle} — ${score}/5 flags. Keep going.`;
        ctfState.handle = handle;
        saveCTFState();
      });

      updateCTFPanel();

      updatePromptLabel();
        },

        cat(args) {
          if (!args.length) { wErr('cat: missing operand'); return; }
          for (const arg of args) {
            const p = resolvePath(arg);
            const node = getNode(p);
            if (!node) { wErr(`cat: ${arg}: No such file or directory`); continue; }
            if (node.type === 'dir') { wErr(`cat: ${arg}: Is a directory`); continue; }
            wPre(node.content);
          }
        },

        pwd() {
          const full = cwdArr.length === 0 ? '/home/dhairya' : '/home/dhairya/' + cwdArr.join('/');
          w(`<span style="color:var(--color-text)">${esc(full)}</span>`);
        },

        whoami() { w(`<span style="color:var(--color-green)">dhairya</span>`); },

        uname(args) {
          if (args.includes('-a') || args.includes('-a')) {
            w(`<span style="color:var(--color-text-faint)">NeXTSTEP 4.2 nextcube 68040 #42 Sat Sep 1 00:00:00 EST 2025 Rust/aarch64</span>`);
          } else {
            w(`<span style="color:var(--color-text-faint)">NeXTSTEP</span>`);
          }
        },

        ps(args) {
          w(`<span style="color:var(--color-text-faint)">  PID  STAT  STARTED       COMMAND</span>`);
          const procs = [
            ['    1', 'S', 'Sep  1 2025  ', 'init — nextcube workstation'],
            ['  124', 'R', 'Jan 10 2026  ', 'ta-service — cs3100 khoury college'],
            ['  201', 'R', 'Jan 15 2026  ', 'escalion — rust game engine (nu launch labs)'],
            ['  314', 'R', 'May  2 2026  ', 'cactilab-pipeline'],
            ['  315', 'S', 'May  2 2026  ', '  └─ claude-sonnet — stage 2 codegen (40 turns)'],
            ['  316', 'S', 'May  2 2026  ', '  └─ claude-haiku  — stages 1+3 (fast)'],
            ['  317', 'S', 'May  2 2026  ', '  └─ openhands     — tdd red-phase verifier'],
            ['  400', 'R', 'Jan 26 2026  ', 'gsg-senate — student affairs, northeastern'],
          ];
          for (const [pid, stat, started, cmd] of procs) {
            const faint = cmd.startsWith('  └');
            const col = faint ? 'color:var(--color-text-faint)' : 'color:var(--color-text)';
            w(`<span style="color:var(--color-text-faint)">${esc(pid)}  ${stat}   ${esc(started)} </span><span style="${col}">${esc(cmd)}</span>`);
          }
        },

        history() {
          if (!shellHistory.length) { w(`<span style="color:var(--color-text-faint)">(no history)</span>`); return; }
          shellHistory.slice().reverse().forEach((cmd, i) => {
            w(`<span style="color:var(--color-text-faint)">${String(i+1).padStart(4)}  </span><span style="color:var(--color-text)">${esc(cmd)}</span>`);
          });
        },

        man(args) {
          const page = args[0];
          if (page === 'dhairya') {
            const g = `style="color:var(--color-gold)"`;
            const p = `style="color:var(--color-primary)"`;
            const t = `style="color:var(--color-text)"`;
            const f = `style="color:var(--color-text-faint)"`;
            w(`<span ${g}>DHAIRYA(1)                User Commands                DHAIRYA(1)</span>`);
            w(``); w(`<span ${p}>NAME</span>`);
            w(`       <span ${t}>dhairya</span> <span ${f}>- MS CS student, builder, systems thinker</span>`);
            w(``); w(`<span ${p}>SYNOPSIS</span>`);
            w(`       <span ${f}>dhairya [--research] [--build] [--teach] [--lead]</span>`);
            w(``); w(`<span ${p}>DESCRIPTION</span>`);
            w(`       <span ${f}>Graduate student at Northeastern University, Khoury College</span>`);
            w(`       <span ${f}>of Computer Science (MS 2025–2027).</span>`);
            w(``);
            w(`       <span ${f}>Builds agentic LLM pipelines for embedded Rust firmware</span>`);
            w(`       <span ${f}>generation at CACTILab. Founding a Rust game engine at NU</span>`);
            w(`       <span ${f}>Launch Labs. GSG Senator for Student Affairs.</span>`);
            w(``); w(`<span ${p}>OPTIONS</span>`);
            w(`       <span ${f}>--research    LLM tooling, embedded Rust, agentic pipelines</span>`);
            w(`       <span ${f}>--build       Escalion engine, CACTILab Hardware Abstraction Layer pipeline</span>`);
            w(`       <span ${f}>--teach       TA for CS3100, Khoury College</span>`);
            w(`       <span ${f}>--lead        GSG Senator, GLI Emerging Graduate Leader</span>`);
            w(``); w(`<span ${p}>FILES</span>`);
            w(`       <span ${f}>~/about.txt  ~/contact.txt  ~/research/  ~/projects/  ~/senate/</span>`);
            w(``); w(`<span ${p}>SEE ALSO</span>`);
            w(`       <a href="https://dhairyab0069.github.io" target="_blank" style="color:var(--color-primary)">dhairyab0069.github.io</a>  <a href="https://github.com/dhairyab0069" target="_blank" style="color:var(--color-primary)">github.com/dhairyab0069</a>`);
            w(``);
            w(`<span ${g}>Northeastern University             May 2026             DHAIRYA(1)</span>`);
          } else if (!page) {
            wErr('man: missing argument');
            w(`Try: <span style="color:var(--color-green)">man dhairya</span>`);
          } else {
            wErr(`No manual entry for ${page}`);
          }
        },


        ctf() {
          const g = `style="color:var(--color-gold)"`;
          const p = `style="color:var(--color-primary)"`;
          const m = `style="color:var(--color-magenta)"`;
          w(`<span ${g}>╔══════════════════════════════════════════════╗</span>`);
          w(`<span ${g}>║   DHAIRYA'S RESUME — CTF CHALLENGE v1.0     ║</span>`);
          w(`<span ${g}>╚══════════════════════════════════════════════╝</span>`);
          w(``);
          w(`<span ${p}>5 flags hidden across this workstation.</span>`);
          w(`<span style="color:var(--color-text-faint)">Each one requires a different reverse engineering technique.</span>`);
          w(`<span style="color:var(--color-text-faint)">Format: <span ${m}>FLAG{...}</span></span>`);
          w(``);
          w(`<span ${p}>Tools available:</span>`);
          w(`  <span style="color:var(--color-green)">strings  checksec  readelf  xxd  find  file</span>`);
          w(``);
          w(`<span style="color:var(--color-text-faint)">Type <span ${p}>hint [1-5]</span> if you're stuck.</span>`);
          w(`<span style="color:var(--color-text-faint)">Type <span ${p}>submit FLAG{...}</span> to claim a flag.</span>`);
          w(`<span style="color:var(--color-text-faint)">Type <span ${p}>scoreboard</span> to see your progress.</span>`);
        },

        strings(args) {
          const target = args[0];
          if (!target) { wErr('strings: missing operand'); return; }
          const p = resolvePath(target);
          const node = getNode(p);
          if (!node) { wErr(`strings: ${target}: No such file or directory`); return; }
          if (node.type === 'dir') { wErr(`strings: ${target}: Is a directory`); return; }
          const name = p[p.length - 1] || '';
          if (name === 'resume.pdf' || target.includes('resume')) {
            const lines = [
              '/usr/lib/libpdf.so.2','/lib/x86_64-linux-gnu/libc.so.6',
              'GCC: (Ubuntu 11.4.0) 11.4.0','PDF-1.4','Helvetica-Bold',
              'bhatiadhairya19@gmail.com','Northeastern University',
              'Khoury College of Computer Science','Master of Science',
              'CACTILab','Northeastern University',
              '__libc_start_main','_IO_puts','malloc','free',
              '.text','.rodata','.data','.bss',
              'LLM-Assisted Hardware Abstraction Layer (HAL) Generation',
              'cargo test -- --nocapture',
              '/home/dhairya/research/cactilab',
              'FLAG{str1ngs_4r3_y0ur_fr13nd}',
              'embedded-hal = "1.0"','no_std',
              'typestate pattern','PhantomData',
              '/tmp/.X0-lock','_start','atexit',
            ];
            w(`<span style="color:var(--color-text-faint)">Scanning ${esc(target)} for printable strings (min 4)...</span>`);
            lines.forEach(l => {
              const isFlag = l.startsWith('FLAG{');
              w(`<span style="${isFlag ? 'color:var(--color-gold);font-weight:600' : 'color:var(--color-text-faint)'}">${esc(l)}</span>`);
            });
          } else if (name.endsWith('.elf')) {
            const lines = [
              'GCC: (arm-none-eabi 12.2.0)','_start','Reset_Handler',
              'SystemInit','main','gpio_init','gpio_set_high','gpio_set_low',
              'DL_GPIO_setPins','DL_GPIO_clearPins','DL_GPIO_readPins',
              '.text','.rodata','.bss','.data','.flag',
              'embedded-hal','no_std',
              'PA0_PIN','PB0_PIN','PC0_PIN','GPIOA','GPIOB','GPIOC',
              'unsafe { (*GPIOA::ptr()).dout31_0.write(|w| w.bits(val)) }',
            ];
            w(`<span style="color:var(--color-text-faint)">Scanning ${esc(name)} for printable strings...</span>`);
            lines.forEach(l => w(`<span style="color:var(--color-text-faint)">${esc(l)}</span>`));
          } else {
            w(`<span style="color:var(--color-text-faint)">Scanning ${esc(target)}...</span>`);
            wPre(node.content);
          }
        },

        checksec(args) {
          const target = args[0];
          if (!target) { wErr('checksec: missing target\nUsage: checksec <elf-file>'); return; }
          const p = resolvePath(target);
          const node = getNode(p);
          if (!node) { wErr(`checksec: ${target}: No such file or directory`); return; }
          const name = p[p.length-1] || '';
          if (!name.endsWith('.elf')) { wErr(`checksec: ${target}: not an ELF binary`); return; }
          const g = `style="color:var(--color-green)"`;
          const r = `style="color:var(--color-magenta)"`;
          const f = `style="color:var(--color-text-faint)"`;
          const y = `style="color:var(--color-gold)"`;
          w(`<span ${f}>RELRO           STACK CANARY    NX              PIE             RPATH      RUNPATH    Symbols         FORTIFY  FILE</span>`);
          if (name === 'hal_gpio.elf') {
            w(`<span ${g}>Full RELRO</span>      <span ${g}>Canary found</span>    <span ${g}>NX enabled</span>      <span ${g}>PIE enabled</span>     <span ${g}>No RPATH</span>   <span ${g}>No RUNPATH</span> <span ${r}>FLAG{ch3cks3c_pr0t3ct10ns}</span>   <span ${g}>Yes</span>      <span ${f}>${esc(name)}</span>`);
          } else {
            w(`<span ${g}>Partial RELRO</span>   <span ${r}>No canary</span>       <span ${g}>NX enabled</span>      <span ${r}>No PIE</span>          <span ${g}>No RPATH</span>   <span ${g}>No RUNPATH</span> <span ${f}>No symbols</span>       <span ${r}>No</span>       <span ${f}>${esc(name)}</span>`);
          }
        },

        readelf(args) {
          const longFlag = args.includes('-S') || args.includes('--sections') || args.includes('-a') || args.includes('-h');
          const target = args.find(a => !a.startsWith('-'));
          if (!target) { wErr('readelf: missing operand'); return; }
          const p = resolvePath(target);
          const node = getNode(p);
          if (!node) { wErr(`readelf: ${target}: No such file or directory`); return; }
          const name = p[p.length-1] || '';
          if (!name.endsWith('.elf')) { wErr(`readelf: ${target}: not an ELF file`); return; }
          const f = `style="color:var(--color-text-faint)"`;
          const p2 = `style="color:var(--color-primary)"`;
          const y = `style="color:var(--color-gold)"`;
          w(`<span ${f}>ELF Header:</span>`);
          w(`<span ${f}>  Magic:   7f 45 4c 46 02 01 01 00  00 00 00 00 00 00 00 00</span>`);
          w(`<span ${f}>  Class:   ELF32</span>`);
          w(`<span ${f}>  Machine: ARM (Cortex-M0+)</span>`);
          w(`<span ${f}>  Entry:   0x00000000080010c0</span>`);
          w(``);
          if (name === 'hal_gpio.elf') {
            w(`<span ${f}>Section Headers:</span>`);
            w(`<span ${f}>  [Nr] Name                Type      Addr      Off    Size</span>`);
            w(`<span ${f}>  [ 0] <null>               NULL      00000000  000000 000000</span>`);
            w(`<span ${f}>  [ 1] .text                PROGBITS  08010000  000040 003c20</span>`);
            w(`<span ${f}>  [ 2] .rodata              PROGBITS  08013c20  003c60 000480</span>`);
            w(`<span ${f}>  [ 3] .data                PROGBITS  20000000  004100 000080</span>`);
            w(`<span ${f}>  [ 4] .bss                 NOBITS    20000080  004180 000200</span>`);
            w(`<span ${f}>  [ 5] .ARM.attributes      ARM       00000000  004380 000030</span>`);
            w(`<span ${y}>  [ 6] <span ${y}>.flag                NOTE      deadbeef  ffff00 000040  ← suspicious</span>`);
            w(`<span ${f}>  [ 7] .symtab              SYMTAB    00000000  0043b0 000800</span>`);
            w(`<span ${f}>  [ 8] .strtab              STRTAB    00000000  004bb0 000300</span>`);
            w(`<span ${f}>  [ 9] .shstrtab            STRTAB    00000000  004eb0 000060</span>`);
            w(``);
            w(`<span ${f}>Hint: something's in section [6]. Try <span style="color:var(--color-green)">xxd ${esc(target)}</span> or <span style="color:var(--color-green)">objdump -s --section=.flag ${esc(target)}</span></span>`);
          } else {
            w(`<span ${f}>Section Headers:</span>`);
            w(`<span ${f}>  [Nr] Name     Type      Addr      Off    Size</span>`);
            w(`<span ${f}>  [ 0] .text    PROGBITS  08010000  000040 002400</span>`);
            w(`<span ${f}>  [ 1] .rodata  PROGBITS  08012400  002440 000200</span>`);
            w(`<span ${f}>  [ 2] .data    PROGBITS  20000000  002640 000060</span>`);
            w(`<span ${f}>  [ 3] .bss     NOBITS    20000060  0026a0 000100</span>`);
          }
        },

        xxd(args) {
          const target = args[0];
          if (!target) { wErr('xxd: missing operand'); return; }
          const p = resolvePath(target);
          const node = getNode(p);
          if (!node) { wErr(`xxd: ${target}: No such file or directory`); return; }
          const name = p[p.length-1] || '';
          const f = `style="color:var(--color-text-faint)"`;
          const y = `style="color:var(--color-gold)"`;
          if (name === 'hal_gpio.elf') {
            w(`<span ${f}>00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............</span>`);
            w(`<span ${f}>00000010: 0200 2800 0100 0000 c010 0108 3400 0000  ..(.........4...</span>`);
            w(`<span ${f}>00000020: 0000 0000 0200 0005 3400 2000 0100 2800  ........4. ...</span>`);
            w(`<span ${f}>...</span>`);
            w(`<span ${f}>0000ffe0: 464c 4147 7b33 6c66 5f73 3374 6331 6930  </span><span ${y}>FLAG{3lf_s3ct10n_hunt3r}</span>`);
            w(`<span ${f}>0000fff0: 5f68 756e 7433 727d 0000 0000 0000 0000  ........................</span>`);
          } else if (name.endsWith('.elf')) {
            w(`<span ${f}>00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............</span>`);
            w(`<span ${f}>00000010: 0200 2800 0100 0000 d010 0108 3400 0000  ..(.........4...</span>`);
            w(`<span ${f}>00000020: 5869 7374 2069 7320 6e6f 7420 6120 636f  Xist is not a co</span>`);
          } else {
            const hex = Array.from(node.content.slice(0,64))
              .map((c,i) => ({ h: c.charCodeAt(0).toString(16).padStart(2,'0'), c }));
            let out = '00000000: ';
            hex.forEach((x,i) => { out += x.h + (i%2?'':' '); });
            w(`<span ${f}>${esc(out.trim())}  ${esc(node.content.slice(0,16))}</span>`);
          }
        },

        objdump(args) {
          const sFlag = args.includes('-s');
          const secIdx = args.findIndex(a => a === '--section');
          const sec = secIdx >= 0 ? args[secIdx+1] : (args.find(a => a.startsWith('.')) || null);
          const target = args.find(a => !a.startsWith('-') && !a.startsWith('.') && a !== '--section');
          if (!target) { wErr('objdump: missing operand'); return; }
          const p = resolvePath(target);
          const node = getNode(p);
          if (!node) { wErr(`objdump: ${target}: No such file or directory`); return; }
          const name = p[p.length-1] || '';
          const f = `style="color:var(--color-text-faint)"`;
          const y = `style="color:var(--color-gold)"`;
          if (name === 'hal_gpio.elf' && sec === '.flag') {
            w(`<span ${f}>${esc(name)}:     file format elf32-littlearm</span>`);
            w(``);
            w(`<span ${f}>Contents of section .flag:</span>`);
            w(`<span ${f}> deadbeef 464c4147 7b336c66 5f733374  </span><span ${y}>FLAG{3lf_s3ct10n</span>`);
            w(`<span ${f}> deadbeff 6331306e 5f68756e 7433727d  </span><span ${y}>_hunt3r}</span>`);
          } else if (name.endsWith('.elf')) {
            w(`<span ${f}>${esc(name)}:     file format elf32-littlearm</span>`);
            w(`<span ${f}>Disassembly of section .text:</span>`);
            w(`<span ${f}>08010000 <Reset_Handler>:</span>`);
            w(`<span ${f}> 8010000: 4800      ldr  r0, [pc, #0]</span>`);
            w(`<span ${f}> 8010002: 4700      bx   r0</span>`);
          } else {
            wErr(`objdump: ${target}: file format not recognized`);
          }
        },

        find(args) {
          const root = args[0] === '.' || !args[0] ? cwdArr : resolvePath(args[0]);
          const nameFlag = args.findIndex(a => a === '-name');
          const pattern = nameFlag >= 0 ? args[nameFlag+1] : null;
          const typeFlag = args.findIndex(a => a === '-type');
          const typeFilter = typeFlag >= 0 ? args[typeFlag+1] : null;
          const f = `style="color:var(--color-text-faint)"`;
          function walk(pathArr, node) {
            const pathStr = '~' + (pathArr.length ? '/' + pathArr.join('/') : '');
            const name = pathArr[pathArr.length-1] || '~';
            const matchName = !pattern || name.includes(pattern.replace(/\*/g,''));
            const matchType = !typeFilter || (typeFilter === 'd' ? node.type === 'dir' : typeFilter === 'f' ? node.type === 'file' : true);
            if (matchName && matchType) {
              const isHidden = name.startsWith('.');
              w(`<span style="${isHidden ? 'color:var(--color-gold)' : 'color:var(--color-text-faint)'}">${esc(pathStr)}</span>`);
            }
            if (node.type === 'dir') {
              Object.entries(node.entries).forEach(([n, child]) => walk([...pathArr, n], child));
            }
          }
          const startNode = getNode(root);
          if (!startNode) { wErr(`find: ${args[0]}: No such file or directory`); return; }
          walk(root, startNode);
        },

        file(args) {
          if (!args.length) { wErr('file: missing operand'); return; }
          for (const arg of args) {
            const p = resolvePath(arg);
            const node = getNode(p);
            if (!node) { w(`<span style="color:var(--color-text-faint)">${esc(arg)}: ERROR: No such file or directory</span>`); continue; }
            const name = p[p.length-1] || '';
            let type;
            if (node.type === 'dir') type = 'directory';
            else if (name.endsWith('.elf')) type = 'ELF 32-bit LSB executable, ARM, EABI5, statically linked, not stripped';
            else if (name.endsWith('.pdf')) type = 'PDF document, version 1.4';
            else if (name.endsWith('.md')) type = 'ASCII text, with CRLF line terminators';
            else if (name.endsWith('.txt')) type = 'ASCII text';
            else if (name.endsWith('.rs')) type = 'Rust source code, ASCII text';
            else type = 'ASCII text';
            w(`<span style="color:var(--color-text-faint)">${esc(arg)}: ${esc(type)}</span>`);
          }
        },

        hint(args) {
          const n = parseInt(args[0]);
          const g = `style="color:var(--color-gold)"`;
          const p = `style="color:var(--color-primary)"`;
          const f = `style="color:var(--color-text-faint)"`;
          const hints = {
            1: { title:'Binary Strings', h1:'Binary files often hide readable text.', h2:'Try running strings on your resume.', h3:`<span ${p}>strings resume.pdf</span>` },
            2: { title:'Hidden Files', h1:'Not all files show up by default.', h2:'Unix hides files starting with a dot.', h3:`<span ${p}>ls -la</span> in your home directory` },
            3: { title:'Binary Protections', h1:'Security engineers always check ELF hardening.', h2:'There is an ELF binary in the cactilab directory.', h3:`<span ${p}>checksec research/cactilab/hal_gpio.elf</span>` },
            4: { title:'Section Headers', h1:'ELF files are divided into named sections.', h2:'One section has an unusual name and address.', h3:`<span ${p}>readelf -S research/cactilab/hal_gpio.elf</span> then <span ${p}>xxd</span> it` },
            5: { title:'Hidden Directories', h1:'Some directories are marked classified.', h2:'ls -la shows more than ls alone.', h3:`<span ${p}>ls -la research/cactilab</span>` },
          };
          if (!n || !hints[n]) {
            w(`<span ${g}>CTF Hints — 5 flags total</span>`);
            for (let i = 1; i <= 5; i++) {
              w(`  <span ${p}>hint ${i}</span> <span ${f}>→ ${hints[i].title}</span>`);
            }
            return;
          }
          const h = hints[n];
          w(`<span ${g}>Flag ${n} — ${h.title}</span>`);
          w(`  <span ${f}>${h.h1}</span>`);
          w(`  <span ${f}>${h.h2}</span>`);
          w(`  <span ${p}>Try: ${h.h3}</span>`);
        },

        submit(args) {
          const input = args.join(' ').trim();
          const flags = {
            'FLAG{str1ngs_4r3_y0ur_fr13nd}': { n:1, name:'Binary Strings' },
            'FLAG{d0tf1l3s_n3v3r_l13}':      { n:2, name:'Hidden Files' },
            'FLAG{ch3cks3c_pr0t3ct10ns}':    { n:3, name:'Binary Protections' },
            'FLAG{3lf_s3ct10n_hunt3r}':      { n:4, name:'Section Headers' },
            'FLAG{gh0st_1n_th3_h4l}':        { n:5, name:'Classified Directory' },
            'FLAG{k3rn3l_dungeon_master}':   { n:6, name:'Kernel Dungeon' },
          };
          const g = `style="color:var(--color-gold)"`;
          const r = `style="color:var(--color-magenta)"`;
          if (!input.startsWith('FLAG{')) {
            wErr('submit: flag must start with FLAG{...}');
            return;
          }
          if (flags[input]) {
            const f = flags[input];
            if (!window._ctfFound) window._ctfFound = new Set();
            window._ctfFound.add(input);
            w(`<span ${g}>✓  CORRECT — Flag ${f.n}: ${f.name}</span>`);
            w(`<span style="color:var(--color-text-faint)">${window._ctfFound.size}/5 flags found. ${window._ctfFound.size === 5 ? '🎉 All flags captured!' : 'Keep going...'}</span>`);
          } else {
            w(`<span ${r}>✗  Wrong flag. Keep looking.</span>`);
          }
        },

        scoreboard() {
          const found = window._ctfFound || new Set();
          const all = [
            { n:1, name:'Binary Strings',      flag:'FLAG{str1ngs_4r3_y0ur_fr13nd}' },
            { n:2, name:'Hidden Files',         flag:'FLAG{d0tf1l3s_n3v3r_l13}' },
            { n:3, name:'Binary Protections',   flag:'FLAG{ch3cks3c_pr0t3ct10ns}' },
            { n:4, name:'Section Headers',      flag:'FLAG{3lf_s3ct10n_hunt3r}' },
            { n:5, name:'Classified Directory', flag:'FLAG{gh0st_1n_th3_h4l}' },
          { n:6, name:'Kernel Dungeon (bonus ⚔️)', flag:'FLAG{k3rn3l_dungeon_master}' },
          ];
          const g = `style="color:var(--color-gold)"`;
          const f2 = `style="color:var(--color-text-faint)"`;
          const p = `style="color:var(--color-primary)"`;
          w(`<span ${g}>Scoreboard — ${Math.min(found.size,5)}/5 flags${found.size>=6?' + bonus ⚔️':''}</span>`);
          for (const entry of all) {
            const done = found.has(entry.flag);
            w(`  ${done ? '<span style="color:var(--color-green)">✓' : '<span style="color:var(--color-magenta)">○'} Flag ${entry.n}: ${entry.name}</span>`);
          }
          if (found.size === 5) {
            w(``);
            w(`<span ${g}>All flags captured. You'd fit in at CACTILab.</span>`);
          }
        },

        // ── FLIP COMMAND ─────────────────────────────────────────────
        fastfetch() {
          output.innerHTML = '';
          const g  = `style="color:var(--color-green)"`;
          const p  = `style="color:var(--color-primary)"`;
          const f  = `style="color:var(--color-text-faint)"`;
          const gd = `style="color:var(--color-gold)"`;
          const m  = `style="color:var(--color-magenta)"`;
          const pre = `style="white-space:pre;font-family:ui-monospace,SFMono-Regular,Menlo,monospace"`;
          // art lines — fixed 12 chars wide
          const art = [
            '  .------. ',
            ' /  ____  \\',
            '|  /    \\ |',
            '|  \\____/ |',
            ' \\________/',
            '   NEXCUBE  ',
          ];
          const rows = [
            ['OS',       'NeXTSTEP 4.2 (nextcube 68040)'],
            ['Host',     'Dhairya Bhatia'],
            ['Role',     'MS CS \u00b7 Khoury \u00b7 Northeastern'],
            ['Research', 'ACLab \u00b7 TimeBlind \u00b7 CVPR 2026'],
            ['Shell',    'nextcube-term'],
            ['Stack',    'Python \u00b7 PyTorch \u00b7 Rust \u00b7 Git'],
            ['Site',     'dhairyab0069.github.io'],
            ['GitHub',   'github.com/dhairyab0069'],
            ['Uptime',   'June 2026'],
            ['Memory',   'caffeine / infinite'],
          ];
          const PAD = '             '; // 13 spaces to match art width
          w(`<span ${m}>dhairya</span><span ${f}>@</span><span ${g}>nextcube</span>`);
          w(`<span ${f}>\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500</span>`);
          rows.forEach(([k,v], i) => {
            const artCol = i < art.length
              ? `<span ${g}>${art[i]}</span>`
              : `<span>${PAD}</span>`;
            w(`<span ${pre}>${artCol}  <span ${p}>${k.padEnd(9)}</span><span ${f}>${v}</span></span>`);
          });
          w('');
          const sw=document.getElementById('screen-wrap');
          if(sw) sw.scrollTop=0;
        },
        flip() {
          if (!window._cheatMode) { wErr('flip: permission denied. activate cheat code first.'); return; }
          const body = document.body;
          const flipped = body.style.transform === 'rotate(180deg)';
          body.style.transform = flipped ? '' : 'rotate(180deg)';
          body.style.transition = 'transform .6s ease';
          w(flipped
            ? `<span style="color:var(--color-green)">right-side up. welcome back.</span>`
            : `<span style="color:var(--color-magenta)">flipped. type <span style="color:var(--color-green)">flip</span> again to undo.</span>`
          );
        },

        // ── DUNGEON CRAWLER ──────────────────────────────────────────
        dungeon(args) {
          if (!window._cheatMode) { wErr('dungeon: permission denied. activate cheat code first.'); return; }
          if (window._dg && window._dg.active) {
            w(`<span style="color:var(--color-text-faint)">Already in dungeon. Type <span style="color:var(--color-green)">quit</span> to exit.</span>`);
            return;
          }
          window._dg = {
            active: true, room: 'boot', hp: 10, maxHp: 10,
            inventory: [], taken: new Set(), defeated: new Set(), won: false,
            rooms: {
              boot:   { name:'Castle Gates',      exits:{east:'heap',south:'stack'},  items:['rusty_pointer'], enemy:null, desc:'Crumbling stone archways flicker with dying torchlight. The air smells of ash.' },
              heap:   { name:'The Vaulted Hall',   exits:{west:'boot',south:'kernel'}, items:[],               enemy:'memory_leak', desc:'A grand hall, now ruined. Something stirs in the rubble.' },
              stack:  { name:'The Armoury',        exits:{north:'boot',east:'kernel'}, items:['health_potion'], enemy:'segfault', desc:'Weapon racks line the walls. A potion sits forgotten on a shelf.' },
              kernel: { name:'The Inner Sanctum',  exits:{north:'heap',west:'stack',south:'void'}, items:['sudo_token'], enemy:null, desc:'A circular chamber. Ancient runes cover the floor. Something gleams at the centre.' },
              void:   { name:'The Throne Room',    exits:{north:'kernel'},             items:[],               enemy:'race_condition', desc:'The air warps and flickers. On the throne sits the Race Condition, waiting.' },
            },
            items: {
              rusty_pointer:  { name:'Rusty Blade',    desc:'An old sword. Unreliable but sharp enough.', damage:3 },
              health_potion:  { name:'Elixir',         desc:'A glowing vial. Restores 5 HP.' },
              sudo_token:     { name:'Sudo Seal',      desc:'An ancient seal of authority. The throne room will yield to it.' },
            },
            enemies: {
              memory_leak:    { name:'Wraith of Forgotten Things', hp:6,  maxHp:6,  dmg:2, sudo:false },
              segfault:       { name:'The Segfault Knight', hp:8,  maxHp:8,  dmg:3, sudo:false },
              race_condition: { name:'The Race Condition', hp:15, maxHp:15, dmg:5, sudo:true  },
            },
            eHp: {},
          };
          const dg = window._dg;
          for (const [k,v] of Object.entries(dg.enemies)) dg.eHp[k] = v.hp;
          const g = `style="color:var(--color-gold)"`;
          const gr = `style="color:var(--color-green)"`;
          const f = `style="color:var(--color-text-faint)"`;
          const p = `style="color:var(--color-primary)"`;
          const m = `style="color:var(--color-magenta)"`;
          w(`<span ${g}>╔══════════════════════════════════════╗</span>`);
          w(`<span ${g}>║        THE KERNEL DUNGEON  v0.1      ║</span>`);
          w(`<span ${g}>╚══════════════════════════════════════╝</span>`);
          w(``);
          w(`<span ${f}>The kingdom of Nexcube has fallen silent.</span>`);
          w(`<span ${f}>A dark force — the Race Condition — has seized the throne, splitting</span>`);
          w(`<span ${f}>reality into fragments. Only the Sudo Token, hidden deep within</span>`);
          w(`<span ${f}>the castle, can end its reign.</span>`);
          w(`<span ${f}>You are the last one willing to go in.</span>`);
          w(``);
          w(`<span ${p}>── HOW TO PLAY ─────────────────────────────────</span>`);
          w(`  <span ${gr}>look</span>            <span ${f}>describe your current room</span>`);
          w(`  <span ${gr}>go north</span>        <span ${f}>(or south / east / west) — move between rooms</span>`);
          w(`  <span ${gr}>take rusty pointer</span>  <span ${f}>pick up an item (use its name)</span>`);
          w(`  <span ${gr}>use health potion</span>   <span ${f}>use an item from your inventory</span>`);
          w(`  <span ${gr}>attack</span>          <span ${f}>fight the enemy in this room</span>`);
          w(`  <span ${gr}>inventory</span>       <span ${f}>see what you're carrying</span>`);
          w(`  <span ${gr}>status</span>          <span ${f}>check your HP</span>`);
          w(`  <span ${gr}>quit</span>            <span ${f}>exit the dungeon</span>`);
          w(``);
          w(`<span ${p}>── TIPS ────────────────────────────────────────</span>`);
          w(`  <span ${f}>• You can't move through a room with a living enemy — defeat it first.</span>`);
          w(`  <span ${f}>• Pick up every item you find — you'll need them.</span>`);
          w(`  <span ${f}>• The final boss requires a special item to beat.</span>`);
          w(`  <span ${f}>• Type <span ${gr}>look</span> any time to remind yourself where you are.</span>`);
          w(``);
          w(`<span ${m}>You stand at the Castle Gates. Good luck.</span>`);
          w(``);
          dgLook();
          // Override execCmd to intercept dungeon commands
          window._dgMode = true;
        },
        clear() { output.innerHTML = ''; }
      };

      // Tab completion
      function tabComplete(val) {
        const parts = val.split(' ');
        const last = parts[parts.length - 1];
        if (parts.length === 1) {
          const matches = Object.keys(CMDS).filter(c => c.startsWith(last));
          if (matches.length === 1) return matches[0] + ' ';
          if (matches.length > 1) w(matches.join('  '));
          return val;
        }
        const node = getNode(cwdArr);
        if (node && node.type === 'dir') {
          const matches = Object.entries(node.entries)
            .filter(([n]) => n.startsWith(last));
          if (matches.length === 1) {
            const [n, e] = matches[0];
            return [...parts.slice(0,-1), n + (e.type==='dir' ? '/' : '')].join(' ');
          }
          if (matches.length > 1) w(matches.map(([n,e]) => n+(e.type==='dir'?'/':'')).join('  '));
        }
        return val;
      }


      // ── DUNGEON HELPERS ─────────────────────────────────────────────
      function dgRoom()  { return window._dg.rooms[window._dg.room]; }
      function dgEnemy() {
        const r = dgRoom();
        if (!r.enemy || window._dg.defeated.has(r.enemy)) return null;
        return { key: r.enemy, ...window._dg.enemies[r.enemy] };
      }
      function dgHpBar(cur, max) {
        const filled = Math.round((cur/max)*10);
        return '█'.repeat(filled) + '░'.repeat(10-filled) + ` ${cur}/${max}`;
      }
      function dgLook() {
        const dg = window._dg;
        const r = dgRoom();
        const en = dgEnemy();
        const g = `style="color:var(--color-gold)"`;
        const p = `style="color:var(--color-primary)"`;
        const m = `style="color:var(--color-magenta)"`;
        const f = `style="color:var(--color-text-faint)"`;
        w(`<span ${g}>${esc(r.name)}</span>`);
        w(`<span ${f}>${esc(r.desc||'')}</span>`);
        const liveItems = (r.items||[]).filter(i => !dg.taken.has(i));
        if (liveItems.length) w(`<span ${f}>Items here: <span ${p}>${liveItems.map(i=>dg.items[i].name).join(', ')}</span></span>`);
        const exits = Object.keys(r.exits||{});
        w(`<span ${f}>Exits: <span style="color:var(--color-green)">${exits.join(', ')}</span></span>`);
        if (en) w(`<span ${m}>⚠ ${esc(en.name)} is here! [HP: ${dgHpBar(dg.eHp[en.key], en.maxHp)}]</span>`);
      }
      function dgCmd(line) {
        const dg = window._dg;
        const [cmd, ...rest] = line.trim().toLowerCase().split(/\s+/);
        const arg = rest.join(' ');
        const g  = `style="color:var(--color-gold)"`;
        const gr = `style="color:var(--color-green)"`;
        const m  = `style="color:var(--color-magenta)"`;
        const f  = `style="color:var(--color-text-faint)"`;
        const p  = `style="color:var(--color-primary)"`;
        w(`<span style="color:var(--color-green)">dungeon</span><span style="color:var(--color-text-faint)">></span> <span style="color:var(--color-text)">${esc(line)}</span>`);
        if (cmd==='quit'||cmd==='exit') {
          dg.active=false; window._dgMode=false;
          w(`<span ${f}>Exiting dungeon.</span>`); return;
        }
        if (cmd==='clear') { output.innerHTML=''; return; }
        if (cmd==='look') { dgLook(); return; }
        if (cmd==='inventory'||cmd==='inv') {
          if (!dg.inventory.length) { w(`<span ${f}>Inventory empty.</span>`); return; }
          dg.inventory.forEach(i => w(`<span ${p}>${esc(dg.items[i].name)}</span> <span ${f}>— ${esc(dg.items[i].desc)}</span>`));
          return;
        }
        if (cmd==='status') {
          w(`<span ${gr}>HP: ${dgHpBar(dg.hp, dg.maxHp)}</span>`);
          w(`<span ${f}>Room: ${esc(dgRoom().name)}</span>`); return;
        }
        if (cmd==='go') {
          const r=dgRoom(); const en=dgEnemy();
          if (en) { w(`<span ${m}>${esc(en.name)} blocks your path. Defeat it first.</span>`); return; }
          if (!r.exits||!r.exits[arg]) { w(`<span ${m}>Can't go ${esc(arg||'?')} from here.</span>`); return; }
          dg.room=r.exits[arg]; dgLook(); return;
        }
        if (cmd==='take'||cmd==='pick'||cmd==='get') {
          const r=dgRoom();
          const available=(r.items||[]).filter(i=>!dg.taken.has(i));
          const key = arg
            ? Object.keys(dg.items).find(k=>dg.items[k].name.toLowerCase().includes(arg)&&available.includes(k))
            : available[0];
          if (!key) { w(`<span ${m}>${available.length?'No such item here.':'Nothing to take here.'}</span>`); return; }
          dg.inventory.push(key);
          dg.taken.add(key);
          w(`<span ${gr}>Took ${esc(dg.items[key].name)}.</span>`); return;
        }
        if (cmd==='use') {
          const key=dg.inventory.find(k=>dg.items[k].name.toLowerCase().includes(arg));
          if (!arg) {
            if (!dg.inventory.length) { w(`<span ${f}>Inventory empty.</span>`); return; }
            w(`<span ${f}>Use what? You have: <span style="color:var(--color-primary)">${dg.inventory.map(i=>dg.items[i].name).join(', ')}</span></span>`);
            return;
          }
          if (!key) { w(`<span ${m}>You don't have that.</span>`); return; }
          if (key==='health_potion') {
            const gained=Math.min(5,dg.maxHp-dg.hp); dg.hp=Math.min(dg.maxHp,dg.hp+5);
            dg.inventory=dg.inventory.filter(i=>i!=='health_potion');
            w(`<span ${gr}>Drank the elixir. +${gained} HP. [${dgHpBar(dg.hp,dg.maxHp)}]</span>`);
          } else if (key==='sudo_token') {
            const en=dgEnemy();
            if (!en) { w(`<span ${f}>No enemy here to use it on.</span>`); return; }
            if (!en.sudo) { w(`<span ${f}>The Sudo Seal hums, but this enemy does not yield to authority.</span>`); return; }
            // Treat as an attack with guaranteed sudo bonus
            const pdmg = 3 + 8 + Math.floor(Math.random()*2);
            dg.eHp[en.key]=Math.max(0,dg.eHp[en.key]-pdmg);
            w(`<span ${g}>The Sudo Seal blazes with light. SUDO OVERRIDE — ${pdmg} damage!</span>`);
            w(`<span ${gr}>[Enemy HP: ${dgHpBar(dg.eHp[en.key],en.maxHp)}]</span>`);
            if (dg.eHp[en.key]<=0) {
              dg.defeated.add(en.key);
              w(`<span ${g}>✓ ${esc(en.name)} defeated!</span>`);
              dg.won=true; window._dgMode=false; dg.active=false;
              w(``); w(`<span ${g}>╔═════════════════════════════════════╗</span>`);
              w(`<span ${g}>║      YOU WIN. KINGDOM RESTORED.     ║</span>`);
              w(`<span ${g}>╚═════════════════════════════════════╝</span>`);
              w(`<span ${f}>The throne shatters. Something falls to the floor...</span>`); w(``);
              w(`<span style="color:var(--color-gold);font-weight:600">FLAG{k3rn3l_dungeon_master}</span>`); w(``);
              w(`<span ${f}>Type <span style="color:var(--color-green)">submit FLAG{k3rn3l_dungeon_master}</span> to claim the bonus flag.</span>`);
              return;
            }
            // Enemy fights back
            const edmg=Math.max(1,en.dmg+Math.floor(Math.random()*2)-1);
            dg.hp-=edmg;
            w(`<span ${m}>${esc(en.name)} retaliates for ${edmg}. [Your HP: ${dgHpBar(dg.hp,dg.maxHp)}]</span>`);
            if (dg.hp<=0) {
              dg.active=false; window._dgMode=false;
              w(``); w(`<span ${m}>You died. The kingdom falls.</span>`);
              w(`<span ${f}>Type <span style="color:var(--color-green)">dungeon</span> to try again.</span>`);
            }
          } else { w(`<span ${f}>Can't use that here.</span>`); }
          return;
        }
        if (cmd==='attack') {
          const en=dgEnemy();
          if (!en) { w(`<span ${f}>Nothing to attack.</span>`); return; }
          const hasSword=dg.inventory.includes('rusty_pointer');
          const hasSudo=dg.inventory.includes('sudo_token');
          let pdmg=hasSword?3:1;
          if (en.sudo&&hasSudo) { pdmg+=8; w(`<span ${gr}>SUDO OVERRIDE — critical hit!</span>`); }
          pdmg+=Math.floor(Math.random()*2);
          dg.eHp[en.key]=Math.max(0,dg.eHp[en.key]-pdmg);
          w(`<span ${gr}>You hit ${esc(en.name)} for ${pdmg}. [Enemy HP: ${dgHpBar(dg.eHp[en.key],en.maxHp)}]</span>`);
          if (dg.eHp[en.key]<=0) {
            dg.defeated.add(en.key);
            w(`<span ${g}>✓ ${esc(en.name)} defeated!</span>`);
            if (en.key==='race_condition') {
              dg.won=true; window._dgMode=false; dg.active=false;
              w(``); w(`<span ${g}>╔═════════════════════════════════════╗</span>`);
              w(`<span ${g}>║      YOU WIN. KERNEL CLEARED.       ║</span>`);
              w(`<span ${g}>╚═════════════════════════════════════╝</span>`);
              w(`<span ${f}>The daemon dissolves and drops something...</span>`); w(``);
              w(`<span style="color:var(--color-gold);font-weight:600">FLAG{k3rn3l_dungeon_master}</span>`); w(``);
              w(`<span ${f}>Type <span style="color:var(--color-green)">submit FLAG{k3rn3l_dungeon_master}</span> to claim the bonus flag.</span>`);
            }
            return;
          }
          const edmg=Math.max(1,en.dmg+Math.floor(Math.random()*2)-1);
          dg.hp-=edmg;
          w(`<span ${m}>${esc(en.name)} hits you for ${edmg}. [Your HP: ${dgHpBar(dg.hp,dg.maxHp)}]</span>`);
          if (dg.hp<=0) {
            dg.active=false; window._dgMode=false;
            w(``); w(`<span ${m}>You died. Kernel panic.</span>`);
            w(`<span ${f}>Type <span style="color:var(--color-green)">dungeon</span> to try again.</span>`);
          }
          return;
        }
        w(`<span ${f}>Unknown command. Try: look  go [dir]  take [item]  use [item]  attack  inventory  status  quit</span>`);
      }

      // Execute a command line
      function execCmd(line) {
        const parts = line.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        // Echo with styled prompt
        w(`<span style="color:var(--color-green)">dhairya@nextcube</span><span style="color:var(--color-text-faint)">:</span><span style="color:var(--color-primary)">${esc(formatCwd())}</span><span style="color:var(--color-text-faint)">$</span> <span style="color:var(--color-text)">${esc(line)}</span>`);
        if (CMDS[cmd]) CMDS[cmd](args);
        else if (cmd) wErr(`${cmd}: command not found  (try 'help')`);
      }

      shellForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const line = shellInput.value.trim();
        if (!line) return;
        shellHistory.unshift(line);
        histIdx = -1;
        if (window._dgMode) { try { dgCmd(line); } catch(e) { w(`<span style="color:var(--color-magenta)">dungeon error: ${esc(String(e.message))}. type quit to exit.</span>`); } }
        else { execCmd(line); }
        shellInput.value = '';
      });

      shellInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (histIdx < shellHistory.length - 1) shellInput.value = shellHistory[++histIdx];
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          histIdx > 0 ? (shellInput.value = shellHistory[--histIdx]) : (histIdx = -1, shellInput.value = '');
        } else if (e.key === 'Tab') {
          e.preventDefault();
          shellInput.value = tabComplete(shellInput.value);
        }
      });

      // Boot message


      // ── PANEL SWITCHING ────────────────────────────────────────────
      function showPanel(name) {
        const panels = { about: 'panel-about', workbench: 'panel-workbench', mail: 'panel-mail' };
        Object.entries(panels).forEach(([k, id]) => {
          const el = document.getElementById(id);
          if (el) el.style.display = k === name ? '' : 'none';
        });
        document.querySelectorAll('.dock a').forEach(a => {
          a.classList.toggle('active', a.dataset.panel === name);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (name === 'about' && typeof tickBoot === 'function') tickBoot();
      }
      document.querySelectorAll('[data-panel]').forEach(a => {
        a.addEventListener('click', e => { e.preventDefault(); showPanel(a.dataset.panel); });
      });
      // ── CTF PANEL ──────────────────────────────────────────────────
      // No shared leaderboard — local score only

      const FLAG_MAP = {
        'FLAG{str1ngs_4r3_y0ur_fr13nd}': 1,
        'FLAG{d0tf1l3s_n3v3r_l13}':      2,
        'FLAG{ch3cks3c_pr0t3ct10ns}':    3,
        'FLAG{3lf_s3ct10n_hunt3r}':      4,
        'FLAG{gh0st_1n_th3_h4l}':        5,
        'FLAG{k3rn3l_dungeon_master}':   6,
      };

      // Load persisted state
      let ctfState = (() => {
        try { return JSON.parse(localStorage.getItem('ctf_state') || '{}'); } catch { return {}; }
      })();
      if (!ctfState.found) ctfState.found = [];

      function saveCTFState() {
        try { localStorage.setItem('ctf_state', JSON.stringify(ctfState)); } catch {}
      }

      function updateCTFPanel() {
        const n = ctfState.found.length;
        document.getElementById('ctf-score-label').textContent = n >= 6 ? `5 / 5 flags + bonus ⚔️` : `${Math.min(n,5)} / 5 flags found`;
        document.getElementById('ctf-score-fill').style.width = `${(Math.min(n,5)/5)*100}%`;
        ctfState.found.forEach(num => {
          const row = document.querySelector(`.ctf-flag-row[data-flag="${num}"]`);
          if (row) {
            row.classList.add('found');
            row.querySelector('.flag-icon').textContent = '✓';
          }
        });
        if (n >= 5) {
          document.getElementById('ctf-submit-row').classList.remove('ctf-locked');
        }
      }

      // Hook into window._ctfFound to sync with terminal submit
      const _origSubmit = window._ctfFound;
      function syncFromTerminal(flag) {
        const num = FLAG_MAP[flag];
        if (num && !ctfState.found.includes(num)) {
          ctfState.found.push(num);
          saveCTFState();
          updateCTFPanel();
        }
      }

      // Patch the terminal's submit command to also update panel
      const _origExec = execCmd;
      // We intercept via MutationObserver on terminal output — simpler
      const ctfObserver = new MutationObserver(() => {
        const found = window._ctfFound;
        if (found) {
          found.forEach(f => syncFromTerminal(f));
        }
      });
      ctfObserver.observe(output, { childList: true });

      // Submit handler — local only
      document.getElementById('ctf-submit-btn').addEventListener('click', () => {
        const handle = document.getElementById('ctf-handle').value.trim();
        const status = document.getElementById('ctf-status');
        if (!handle) { status.textContent = 'Enter a handle first.'; return; }
        if (ctfState.found.length < 1) { status.textContent = 'Find at least one flag first.'; return; }
        const btn = document.getElementById('ctf-submit-btn');
        const score = ctfState.found.length;
        btn.disabled = true;
        const base = Math.min(score, 5);
        btn.textContent = score >= 6 ? '🎉 5/5 + bonus!' : score === 5 ? '🎉 All 5 flags!' : `${base}/5 claimed`;
        status.textContent = score >= 6
          ? `${handle} — 5/5 flags + bonus dungeon flag. Impressive.`
          : score === 5
            ? `Nice work, ${handle}. All 5 flags captured.`
            : `${handle} — ${score}/5 flags. Keep going.`;
        ctfState.handle = handle;
        saveCTFState();
      });

      updateCTFPanel();

      updatePromptLabel();
      w(`<span style="color:var(--color-green)">NeXTSTEP 4.2 — nextcube (68040)</span>`);
      w(`<span style="color:var(--color-text-faint)">Last login: ${new Date().toDateString()} on ttys001</span>`);
      w(`<span style="color:var(--color-text-faint)">Try it out — <span style="color:var(--color-green)">ls</span> to browse, <span style="color:var(--color-green)">cat about.txt</span> for bio, <span style="color:var(--color-green)">man dhairya</span> for the full picture.</span>`);
      w(`<span style="color:var(--color-text-faint)">Type <span style="color:var(--color-gold)">ctf</span> to start a 5-flag reverse engineering challenge hidden in this filesystem.</span>`);

      const projectDetail = document.getElementById('project-detail');
      const projectData = {
        cactilab: { title: 'Research Volunteer // CACTILab, Northeastern University', url: null, body: 'Contributed to a research project at CACTILab, Northeastern University. Details to be shared at a later date.', chips: ['Research', 'LLM', 'Rust', 'Embedded'] },
        aclab: { title: 'ACLab — Augmented Cognition Lab // Northeastern University', url: null, body: 'Research lab member at Northeastern University. Served as paper reviewer for CV4Smalls Workshop at CVPR 2026. Collected 50+ video pairs contributing to the TimeBlind spatio-temporal compositionality benchmark for video-language model evaluation. Thesis project starting Fall 2026.', chips: ['Computer Vision', 'Video-Language Models', 'CVPR 2026', 'ACLab'] },
        escalion: { title: 'Project Escalion // NU Launch Labs', url: 'https://github.com/dhairyab0069', body: 'Co-founded a Rust-based game development studio through NU Launch Labs. Building a custom game engine from scratch — focus on memory layout, performance-critical subsystems, and zero-cost abstractions. Early stage, high ambition. Also competed in MITRE eCTF 2026, contributing to embedded security firmware in a hardware-constrained competition environment.', chips: ['Rust', 'Game Engine', 'Systems', 'eCTF 2026'] },
        teaching: { title: 'TA Console // CS3100', url: null, body: 'Teaching Assistant for CS3100 (Programming and Design Paradigms II) at Khoury College of Computer Science. Work includes designing and testing labs and assignments pre-release, analyzing student feedback on AI-assisted programming workflows, and exploring a human subjects study on AI usage patterns in CS education. Office hours and lab support.', chips: ['CS3100', 'Curriculum', 'AI Research', 'Student Support'] },
        senate: { title: 'Senate Signal // GSG', url: null, body: 'Senator for Student Affairs at the Northeastern Graduate Student Government. Awarded Senator of the Month for February 2026. Recipient of the Emerging Graduate Leader Award through the Graduate Leadership Institute (co-sponsored by GSG). Active on initiatives including club auditing, Impact Symposium volunteering, and broader student advocacy work.', chips: ['GSG', 'GLI Award', 'Senator of the Month', 'Student Affairs'] }
      };
      const renderProject = (key) => {
        const p = projectData[key];
        const runBtn = p.url ? `<a class="run-btn" href="${p.url}" target="_blank" rel="noopener">Run → view repo</a>` : '';
        projectDetail.innerHTML = `<p class="eyebrow">Inserted cartridge</p><h3 class="section-title">${p.title}</h3><p class="lede">${p.body}</p><div class="chips" style="margin-top:1rem">${p.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>${runBtn}`;
      };
      document.querySelectorAll('.project-card').forEach(card => card.addEventListener('click', () => {
        document.querySelectorAll('.project-card').forEach(node => node.classList.remove('active'));
        card.classList.add('active');
        renderProject(card.dataset.project);
      }));
      renderProject('aclab');

      const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
      const buffer = [];
      window.addEventListener('keydown', (event) => {
        buffer.push(event.key);
        if (buffer.length > sequence.length) buffer.shift();
        if (sequence.every((k, i) => buffer[i] === k)) {
          body.classList.toggle('palette-flip');
          window._cheatMode = body.classList.contains('palette-flip');
          cheatBtn.textContent = window._cheatMode ? 'Cheat ON 🔓' : 'Cheat code';
        }
      });
    })();
