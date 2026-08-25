/**
 * LAUNCHPAD: FIRST STEP — 2-hour paid bootcamp under the `launchpad` cohort.
 *
 * Content lives in code (same pattern as prisma/seed-launchpad.ts DEFAULT_SESSIONS);
 * only the Bundle row and per-user Enrollment live in the DB.
 *
 * The `startDate` column on Bundle is a free-text String, so the countdown needs a
 * real timestamp — it lives here rather than as a new DB column.
 */

export { LAUNCHPAD_FIRST_STEP_SLUG as FIRST_STEP_SLUG } from "./launchpad"

/** 30 August 2026, 6:00 PM IST (UTC+05:30) */
export const FIRST_STEP_START_ISO = "2026-08-30T18:00:00+05:30"
/** 30 August 2026, 8:00 PM IST — session ends */
export const FIRST_STEP_END_ISO = "2026-08-30T20:00:00+05:30"

export const FIRST_STEP_META = {
  name: "LAUNCHPAD: FIRST STEP",
  tagline: "Two hours. Blank screen to a real app running on the internet.",
  duration: "2 Hours",
  schedule: "Sunday, 6–8 PM IST",
  startDateLabel: "30 August 2026",
  price: 199,
  location: "Online, live",
}

/** Shown on the dashboard tab, above the guide. */
export const FIRST_STEP_ABOUT = {
  intro:
    "In one 2-hour session you go from a blank screen to a real app running on the internet.",
  body: [
    "Most “learn to code” advice is out of date. The way people actually build software changed, and a lot of what gets taught hasn’t caught up. This is us showing you how it actually works right now, from the very first command.",
    "Two hours, hands on keyboard. No slides you forget by Monday.",
  ],
  outcomes: [
    "A working app on a live URL — something you can put on a resume, send home, or open in an interview.",
    "Your laptop set up the way an actual developer’s is.",
    "A feel for the tools people are building with today, most of which you probably haven’t opened yet.",
    "A Discord full of people building alongside you, so you don’t stall out the day after.",
  ],
  /**
   * NOTE: the Luma listing says the ₹199 is "credited toward your next cohort".
   * That is incorrect — it is refunded on completion. This is the correct wording.
   */
  refundNote:
    "Your ₹199 is refunded in full if you stay through the session and submit the final activity. The fee exists to keep the room real — a session this short falls apart when half the seats are people who never show.",
  beforeYouShowUp:
    "Run the setup guide below before Sunday. It takes about 15 minutes and means we spend the session building instead of watching install bars.",
}

// ─────────────────────────────────────────────────────────────
// SETUP GUIDE
// ─────────────────────────────────────────────────────────────

export type OS = "macos" | "windows" | "linux"

export const OS_LABELS: Record<OS, string> = {
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
}

export interface OSVariant {
  /** Short label for the tool used on this OS, e.g. "WARP" */
  label: string
  commands: string[]
  note?: string
}

export interface GuideStep {
  id: string
  index: number
  kicker: string
  title: string
  summary: string
  /** Per-OS instructions. Absent when the step is identical everywhere. */
  variants?: Record<OS, OSVariant>
  /** Used instead of `variants` for steps that are the same on every OS. */
  universal?: { commands: string[]; note?: string }
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: "terminal",
    index: 1,
    kicker: "Terminal",
    title: "Your new home screen.",
    summary: "A text window where you talk to your computer. You’ll live here.",
    variants: {
      macos: {
        label: "Warp",
        commands: ["brew install --cask warp"],
        note: "Modern, AI-native terminal. Or stick with the built-in Terminal.app / iTerm2.",
      },
      windows: {
        label: "Windows Terminal + WSL",
        commands: ["winget install Microsoft.WindowsTerminal", "wsl --install"],
        note: "WSL gives you real Ubuntu inside Windows. Reboot, then open Ubuntu from the Start menu.",
      },
      linux: {
        label: "GNOME / Konsole / Warp",
        commands: ["curl https://app.warp.dev/get_warp.sh | sh"],
        note: "Your distro ships with one already. Warp is a great upgrade if you want AI built in.",
      },
    },
  },
  {
    id: "package-manager",
    index: 2,
    kicker: "Package manager",
    title: "One command, any app.",
    summary: "An app store for the terminal. Installs and updates everything else.",
    variants: {
      macos: {
        label: "Homebrew",
        commands: [
          '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
        ],
        note: "Then brew install <anything>. The single most important tool on macOS.",
      },
      windows: {
        label: "winget · Scoop",
        commands: ["winget --version", "# inside WSL Ubuntu:", "sudo apt update && sudo apt upgrade"],
        note: "winget ships with Windows 11. Inside WSL you’ll use apt.",
      },
      linux: {
        label: "apt · dnf · pacman",
        commands: ["sudo apt update", "sudo apt install build-essential"],
        note: "Already installed. build-essential gives you the C compilers other tools assume.",
      },
    },
  },
  {
    id: "git-github",
    index: 3,
    kicker: "Git + GitHub",
    title: "Save points for code.",
    summary: "Time machine for your project. Plus a public folder where the world can see it.",
    variants: {
      macos: {
        label: "brew + gh",
        commands: ["brew install git gh", "gh auth login"],
        note: "gh is GitHub’s CLI. Running gh auth login connects your account once, then forgets about it.",
      },
      windows: {
        label: "winget + WSL",
        commands: ["winget install Git.Git GitHub.cli", "gh auth login"],
        note: "Run inside WSL Ubuntu so paths and line endings behave. Pick HTTPS when asked.",
      },
      linux: {
        label: "apt",
        commands: ["sudo apt install git gh", "gh auth login"],
        note: 'Set your name and email once: git config --global user.name "...".',
      },
    },
  },
  {
    id: "ssh-keys",
    index: 4,
    kicker: "SSH keys",
    title: "A passwordless handshake.",
    summary: "Generate once. Push to GitHub forever, no password prompts. Make → Copy → Paste.",
    universal: {
      commands: [
        "# 1. Make a key (any OS, same command)",
        'ssh-keygen -t ed25519 -C "you@example.com"',
        "# 2. Copy the public half",
        "cat ~/.ssh/id_ed25519.pub | pbcopy",
        "# Linux: xclip -sel c   ·   Windows: clip.exe",
        "# 3. Paste it into GitHub → Settings → SSH keys, then verify:",
        "ssh -T git@github.com",
      ],
      note: "Git uses this key as your ID every time you push. No more passwords, no more 2FA prompts mid-work.",
    },
  },
  {
    id: "node",
    index: 5,
    kicker: "Node.js + pnpm",
    title: "JavaScript for everything.",
    summary: "Powers most of the web — and almost every AI tool you’ll install.",
    variants: {
      macos: {
        label: "fnm + pnpm",
        commands: ["brew install fnm pnpm", "fnm install --lts", "fnm use lts-latest"],
        note: "fnm swaps Node versions per project. pnpm is faster than npm and saves disk.",
      },
      windows: {
        label: "inside WSL",
        commands: [
          "curl -fsSL https://fnm.vercel.app/install | bash",
          "fnm install --lts",
          "npm i -g pnpm",
        ],
        note: "Run from your WSL Ubuntu shell. Avoid installing Node on Windows directly — too many path bugs.",
      },
      linux: {
        label: "fnm + pnpm",
        commands: [
          "curl -fsSL https://fnm.vercel.app/install | bash",
          "fnm install --lts",
          "npm i -g pnpm",
        ],
        note: "Re-source your shell or open a new tab so fnm takes effect.",
      },
    },
  },
  {
    id: "python",
    index: 6,
    kicker: "Python + uv",
    title: "The lingua franca of AI.",
    summary: "Use uv — the fast Python tool that replaces pip, venv, and pyenv.",
    variants: {
      macos: {
        label: "uv via brew",
        commands: ["brew install uv", "uv python install 3.12", "uv init my-app && cd my-app"],
        note: "Forget pip, virtualenv, and pyenv. uv does all three, 10× faster.",
      },
      windows: {
        label: "uv via PowerShell",
        commands: [
          'powershell -c "irm https://astral.sh/uv/install.ps1 | iex"',
          "uv python install 3.12",
        ],
        note: "Or inside WSL: curl -LsSf https://astral.sh/uv/install.sh | sh",
      },
      linux: {
        label: "uv via curl",
        commands: ["curl -LsSf https://astral.sh/uv/install.sh | sh", "uv python install 3.12"],
        note: "Skip your distro’s Python and let uv manage versions cleanly.",
      },
    },
  },
  {
    id: "docker",
    index: 7,
    kicker: "Docker",
    title: "Apps in tiny boxes.",
    summary:
      "Run any database, service, or someone else’s project — without polluting your machine.",
    variants: {
      macos: {
        label: "Docker Desktop",
        commands: ["brew install --cask docker", "open -a Docker", "docker run hello-world"],
        note: "Docker Desktop bundles the engine + a GUI. Launch it once so the daemon starts.",
      },
      windows: {
        label: "Docker Desktop + WSL",
        commands: ["winget install Docker.DockerDesktop", "# enable WSL2 integration in settings"],
        note: "In settings, enable WSL integration for your Ubuntu distro so docker works in your shell.",
      },
      linux: {
        label: "Docker Engine",
        commands: ["curl -fsSL https://get.docker.com | sh", "sudo usermod -aG docker $USER"],
        note: "Log out and back in so the group change sticks. Then docker run hello-world.",
      },
    },
  },
  {
    id: "shell-dotfiles",
    index: 8,
    kicker: "Shell + dotfiles",
    title: "Make the prompt yours.",
    summary: "A nicer shell, a colourful prompt, and your settings backed up on GitHub.",
    universal: {
      commands: [
        "# 1. Modern shell (default on mac, opt-in elsewhere)",
        "chsh -s $(which zsh)",
        "# 2. Pretty prompt that just works",
        "brew install starship",
        "echo 'eval \"$(starship init zsh)\"' >> ~/.zshrc",
        "# 3. Track your config in a 'dotfiles' repo",
        "mkdir ~/dotfiles && cd ~/dotfiles",
        "git init && gh repo create --private",
      ],
      note: "Aliases, env vars, AI keys, prompt theme — all plain text in your home folder. Push them to a private repo and you can re-set-up any laptop in 10 minutes.",
    },
  },
]

// ─────────────────────────────────────────────────────────────
// AI IDEs
// ─────────────────────────────────────────────────────────────

export interface IdePick {
  rank: string
  kind: string
  name: string
  description: string
  meta: string
}

export const IDE_PICKS: IdePick[] = [
  {
    rank: "#1",
    kind: "Agent-first IDE",
    name: "Antigravity",
    description:
      "Google’s free AI IDE. Multiple agents work in parallel, with browser-in-the-loop and verifiable artifacts.",
    meta: "Free · Gemini, Claude, GPT-OSS",
  },
  {
    rank: "#2",
    kind: "Daily driver IDE",
    name: "Cursor",
    description:
      "The most popular AI IDE. Best inline autocomplete, mature Composer mode, huge community.",
    meta: "Free · $20/mo Pro",
  },
  {
    rank: "#3",
    kind: "Terminal agents",
    name: "Gemini CLI / Claude Code",
    description:
      "Gemini CLI — Google’s free, open-source terminal agent. Claude Code — Anthropic’s paid agent, best reasoning + 1M context. Pick by budget.",
    meta: "Gemini free · Claude $20/mo+",
  },
]

export const IDE_RUNNERS_UP = [
  { name: "GitHub Copilot", note: "The original. Best if you live in VS Code or JetBrains.", meta: "From $10/mo" },
  { name: "Windsurf", note: "Cascade agent + persistent context. Cheapest paid tier.", meta: "Free · $15/mo" },
  { name: "Zed", note: "Built in Rust. Materially lighter than Electron editors.", meta: "Free" },
  { name: "VS Code", note: "Still the most popular editor. Add Copilot or Cline for AI.", meta: "Free · OSS" },
]

export const IDE_COMBOS = [
  {
    kicker: "Free forever",
    name: "Antigravity solo",
    description: "Free Google IDE with Gemini 3, three model options, multi-agent orchestration.",
    price: "$0/mo",
  },
  {
    kicker: "Most popular",
    name: "Cursor + Gemini CLI",
    description: "Cursor for typing, Gemini CLI in a terminal tab for long, complex tasks.",
    price: "~$20/mo",
  },
  {
    kicker: "Power user",
    name: "All three at once",
    description: "Antigravity for parallel agents, Cursor for daily flow, Claude Code for the hardest tickets.",
    price: "~$40–120/mo",
  },
]

// ─────────────────────────────────────────────────────────────
// PRE-FLIGHT + CHEAT SHEET
// ─────────────────────────────────────────────────────────────

export const PREFLIGHT = [
  { label: "Terminal opens without errors", cmd: "echo hello" },
  { label: "Package manager installs apps", cmd: "brew · winget · apt" },
  { label: "git config name + email set", cmd: "git config --global user.name" },
  { label: "SSH key on GitHub", cmd: "ssh -T git@github.com" },
  { label: "node + pnpm work", cmd: "node -v · pnpm -v" },
  { label: "uv runs python", cmd: "uv run python --version" },
  { label: "docker hello-world prints", cmd: "docker run hello-world" },
  { label: "An AI IDE is open", cmd: "antigravity · cursor · gemini · claude" },
]

export const CHEAT_SHEET: { group: string; links: string[] }[] = [
  { group: "Core", links: ["brew.sh", "git-scm.com/docs", "cli.github.com", "docs.astral.sh/uv"] },
  { group: "Runtimes", links: ["nodejs.org", "pnpm.io", "docs.docker.com", "starship.rs"] },
  { group: "AI IDEs", links: ["antigravity.google", "cursor.com", "github.com/google/gemini-cli", "claude.com/code"] },
  { group: "When stuck", links: ["stackoverflow.com", "claude.ai", "chatgpt.com", "your AI IDE chat"] },
]

/** Slide deck, served from public/. Set to null to hide the download button. */
export const FIRST_STEP_PDF_URL: string | null = "/setup_guide.pdf"
