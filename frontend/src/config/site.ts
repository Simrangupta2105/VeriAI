export interface TickerItem {
  label: string;
  iconName: string;
}

export interface CompatibilityItem {
  name: string;
  category: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  subtitle: string;
  description: string;
  url: string;
  githubUrl: string;
  docsUrl: string;
  issuesUrl: string;
  contributeUrl: string;
  apiHealthEndpoint: string;
  benchmarkStats: {
    precision: string;
    recall: string;
    f1: string;
    ece: string;
    testedCases: number;
  };
  tickerItems: TickerItem[];
  tickerRow1: TickerItem[];
  tickerRow2: TickerItem[];
  worksWith: CompatibilityItem[];
  evidenceFrom: CompatibilityItem[];
}

export const siteConfig: SiteConfig = {
  name: "VeriAI",
  tagline: "Evidence-Grounded Audit Desk for Synthetic Text",
  subtitle: "An open, non-profit reference audit tool for researchers, newsrooms, and educators.",
  description: "VeriAI parses text into discrete propositions, cross-examines each against open reference records and primary sources, and publishes an auditable provenance report.",
  url: "http://127.0.0.1:8000",
  githubUrl: "https://github.com/nonprofit-research/veriai",
  docsUrl: "https://github.com/nonprofit-research/veriai#readme",
  issuesUrl: "https://github.com/nonprofit-research/veriai/issues",
  contributeUrl: "https://github.com/nonprofit-research/veriai/blob/main/CONTRIBUTING.md",
  apiHealthEndpoint: "/api/health",
  benchmarkStats: {
    precision: "92.4%",
    recall: "88.6%",
    f1: "90.5%",
    ece: "0.048",
    testedCases: 30,
  },
  tickerItems: [
    { label: "Claim-by-claim checks", iconName: "ScanText" },
    { label: "Real sources, linked", iconName: "Link2" },
    { label: "Wikipedia + live web", iconName: "Globe" },
    { label: "Source quality scores", iconName: "Gauge" },
    { label: "Date & number conflicts", iconName: "CalendarX" },
    { label: "Adversarial critic pass", iconName: "ShieldCheck" },
    { label: "No account needed", iconName: "UserX" },
    { label: "Text is not stored", iconName: "Lock" },
    { label: "Open and auditable", iconName: "Code2" },
    { label: "Exportable reports", iconName: "FileDown" },
    { label: "Works with any chatbot", iconName: "MessageSquare" },
  ],
  tickerRow1: [
    { label: "Claim-by-claim checks", iconName: "ScanText" },
    { label: "Real sources, linked", iconName: "Link2" },
    { label: "Wikipedia + live web", iconName: "Globe" },
    { label: "Source quality scores", iconName: "Gauge" },
    { label: "Date and number conflicts", iconName: "CalendarX" },
    { label: "Adversarial critic pass", iconName: "ShieldCheck" },
  ],
  tickerRow2: [
    { label: "No account needed", iconName: "UserX" },
    { label: "Text is not stored", iconName: "Lock" },
    { label: "Open and auditable", iconName: "Code2" },
    { label: "Exportable reports", iconName: "FileDown" },
    { label: "Works with any chatbot", iconName: "MessageSquare" },
  ],
  worksWith: [
    { name: "ChatGPT", category: "OpenAI" },
    { name: "Claude", category: "Anthropic" },
    { name: "Gemini", category: "Google DeepMind" },
    { name: "Perplexity", category: "Perplexity AI" },
    { name: "Any Open LLM", category: "Llama / Mistral" },
  ],
  evidenceFrom: [
    { name: "Wikipedia REST", category: "Open Encyclopedia" },
    { name: "DuckDuckGo", category: "Real-time Index" },
    { name: "Gov & Academic Domains", category: "Primary Repositories" },
    { name: "Archival News Records", category: "Journalism Indexes" },
  ],
};
