export const URDU_CHRISTIAN_TRANSLATION_RULES = [
  {
    pattern: /حضرت\s+عیسیٰ?\s+علیہ\s*السلام/g,
    replacement: "یسوع مسیح"
  },
  {
    pattern: /عیسیٰ?\s+علیہ\s*السلام/g,
    replacement: "یسوع"
  },
  {
    pattern: /حضرت\s+عیسیٰ?/g,
    replacement: "یسوع مسیح"
  },
  {
    pattern: /حضور\s+عیسیٰ?\s+مسیح/g,
    replacement: "خداوند یسوع مسیح"
  },
  {
    pattern: /حضور\s+عیسیٰ?/g,
    replacement: "خداوند یسوع"
  },
  {
    pattern: /حضور\s+یسوع\s+مسیح/g,
    replacement: "خداوند یسوع مسیح"
  },
  {
    pattern: /حضور\s+یسوع/g,
    replacement: "خداوند یسوع"
  },
  {
    pattern: /عیسیٰ?/g,
    replacement: "یسوع"
  },
  {
    pattern: /علیہ\s*السلام/g,
    replacement: ""
  },
  {
    pattern: /علیہم\s*السلام/g,
    replacement: ""
  },
  {
    pattern: /روح[ِ ]?پاک/g,
    replacement: "روح القدس"
  },
  {
    pattern: /چرچ/g,
    replacement: "کلیسیا"
  },
  {
    pattern: /لارڈ یسوع مسیح/gi,
    replacement: "خداوند یسوع مسیح"
  },
  {
    pattern: /لارڈ یسوع/gi,
    replacement: "خداوند یسوع"
  },
  {
    pattern: /ہولی سپرٹ/gi,
    replacement: "روح القدس"
  },
  {
    pattern: /ہولی گھوسٹ/gi,
    replacement: "روح القدس"
  },
  {
    pattern: / {2,}/g,
    replacement: " "
  }
]
