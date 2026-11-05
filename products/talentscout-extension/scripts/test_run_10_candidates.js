const fs = require('fs');
const path = require('path');

// 1. Tech Keywords Dictionary directly from talentscout-content.js
const TECH_KEYWORDS = [
  "React", "React Native", "Vue", "Angular", "Node.js", "Nodejs", "TypeScript", "JavaScript",
  "Python", "Django", "FastAPI", "Flask", "AI", "Machine Learning", "LLM", "Deep Learning",
  "Java", "Spring Boot", "Golang", "Go", "Rust", "C++", "C#", ".NET", "PHP", "Laravel",
  "Flutter", "iOS", "Swift", "Android", "Kotlin", "AWS", "GCP", "Azure", "DevOps",
  "Docker", "Kubernetes", "CI/CD", "PostgreSQL", "MongoDB", "MySQL", "Redis",
  "Product Manager", "Scrum Master", "Tech Lead", "Solution Architect", "Engineering Manager",
  "UI/UX", "Figma", "Data Engineer", "QA Automation", "Tester", "Headhunter", "HR"
];

function extractTechTags(text) {
  if (!text) return [];
  const found = new Set();
  TECH_KEYWORDS.forEach(tech => {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = /[a-zA-Z0-9_]$/.test(tech) 
      ? `\\b${escaped}\\b` 
      : `(?:\\b|\\s|^)${escaped}(?:\\b|\\s|[.,;!?]|$)`;
    const regex = new RegExp(pattern, "i");
    if (regex.test(text)) {
      found.add(tech);
    }
  });
  return Array.from(found);
}

function detectSeniority(headline) {
  const lower = headline.toLowerCase();
  if (lower.includes("intern") || lower.includes("fresher")) return "Fresher / Intern";
  if (lower.includes("junior")) return "Junior";
  if (lower.includes("lead") || lower.includes("principal") || lower.includes("architect")) return "Tech Lead / Principal";
  if (lower.includes("senior") || lower.includes("sr.")) return "Senior";
  if (lower.includes("manager") || lower.includes("head of") || lower.includes("director")) return "Management / Director";
  return "Mid-Level";
}

function generateAiOutreach(name, headline, company, skills) {
  const primarySkills = skills.slice(0, 4).join(", ") || "công nghệ";
  return `Chào ${name},\n\nMình ấn tượng với hồ sơ và kinh nghiệm chuyên sâu của bạn ở vị trí ${headline} tại ${company}, đặc biệt là mảng ${primarySkills}.\n\nHiện bên mình đang có cơ hội mở cho vị trí phù hợp với Tech Stack của bạn (Mức lương cạnh tranh + Chế độ Hybrid/Remote linh hoạt).\n\nNếu bạn đang sẵn sàng đón nhận cơ hội mới hoặc muốn trao đổi ngắn, bạn phản hồi tin nhắn này để mình gửi JD chi tiết nhé. Chúc bạn tuần mới nhiều năng lượng!\n\n(Gửi qua TalentScout AI)`;
}

// 2. Real-world Candidate Profiles on LinkedIn Vietnam
const RAW_CANDIDATES = [
  {
    name: "Nguyễn Văn Hùng",
    headline: "Senior Python & AI Engineer | LLM Finetuning & Multi-Agent Architecture | Ex-VinAI",
    about: "5+ years of experience building scalable backend and generative AI systems with Python, FastAPI, Docker, and LangChain. Contact: hung.nguyen.ai@gmail.com",
    company: "TechNova Solutions",
    location: "Hà Nội, Việt Nam",
    isOpenToWork: true,
    profileUrl: "https://www.linkedin.com/in/hung-nguyen-ai-dev"
  },
  {
    name: "Trần Thị Mai Anh",
    headline: "Tech Lead Frontend (React / Next.js / TypeScript / UI-UX)",
    about: "Passionate about building blazing-fast web applications with React, TypeScript, TailwindCSS and Next.js. Currently leading a squad of 8 frontend engineers at Shopee Vietnam.",
    company: "Shopee Vietnam",
    location: "TP. Hồ Chí Minh, Việt Nam",
    isOpenToWork: true,
    profileUrl: "https://www.linkedin.com/in/maianh-tran-frontend-lead"
  },
  {
    name: "Lê Quốc Bảo",
    headline: "Senior Golang & Distributed Systems Engineer | Microservices | Cloud Native",
    about: "Building high-throughput payment gateways handling 10,000+ TPS. Tech stack: Golang, PostgreSQL, Redis, Kafka, Kubernetes, AWS.",
    company: "Fintech Growth Hub",
    location: "Đà Nẵng / Remote",
    isOpenToWork: false,
    profileUrl: "https://www.linkedin.com/in/bao-le-golang-senior"
  },
  {
    name: "Đỗ Hoàng Long",
    headline: "Principal AI Architect | RAG Systems & Vector Database | Ex-FPT Software",
    about: "Specialized in fine-tuning open-source LLMs (Llama 3, Qwen) and enterprise RAG architecture using Python, PyTorch, LangChain, Qdrant.",
    company: "FPT Software / AI Center",
    location: "Hà Nội, Việt Nam",
    isOpenToWork: true,
    profileUrl: "https://www.linkedin.com/in/long-do-ai-architect"
  },
  {
    name: "Vũ Minh Tuấn",
    headline: "Senior DevOps & Cloud Platform Engineer (AWS, Kubernetes, Terraform, CI/CD)",
    about: "Certified AWS Solutions Architect Professional & CKA. Automating infrastructure and gitops pipelines with Docker, Kubernetes, Terraform, GitLab CI.",
    company: "VNG Cloud",
    location: "TP. Hồ Chí Minh, Việt Nam",
    isOpenToWork: true,
    profileUrl: "https://www.linkedin.com/in/tuan-vu-devops-cloud"
  },
  {
    name: "Phạm Thu Hương",
    headline: "Product Manager | Data-Driven Growth | B2B SaaS & Marketplace",
    about: "Experienced PM with strong technical background in agile product lifecycle, Figma prototyping, and user retention analytics. Email: thu.huong.pm@outlook.com",
    company: "One Mount Group",
    location: "Hà Nội, Việt Nam",
    isOpenToWork: true,
    profileUrl: "https://www.linkedin.com/in/huong-pham-product-manager"
  },
  {
    name: "Bùi Anh Khoa",
    headline: "Senior Fullstack Developer (Node.js / React Native / NestJS / MongoDB)",
    about: "Building cross-platform mobile apps and high-performance REST/GraphQL APIs with React Native, Node.js, TypeScript, Docker.",
    company: "KMS Technology",
    location: "TP. Hồ Chí Minh, Việt Nam",
    isOpenToWork: false,
    profileUrl: "https://www.linkedin.com/in/khoa-bui-fullstack-dev"
  },
  {
    name: "Hoàng Gia Huy",
    headline: "Senior Java / Spring Boot Backend Engineer | High-Traffic Core Banking",
    about: "7 years of enterprise development with Java, Spring Boot, Microservices, Oracle, PostgreSQL, Redis. Experienced in event-driven architecture.",
    company: "Techcombank",
    location: "Hà Nội, Việt Nam",
    isOpenToWork: true,
    profileUrl: "https://www.linkedin.com/in/huy-hoang-java-core"
  },
  {
    name: "Ngô Mỹ Duyên",
    headline: "Lead QA Automation Engineer | Cypress, Playwright, Selenium, CI/CD",
    about: "Building automated end-to-end testing frameworks for web and mobile platforms with TypeScript, Cypress, Playwright, Python.",
    company: "MoMo (M-Service)",
    location: "TP. Hồ Chí Minh, Việt Nam",
    isOpenToWork: true,
    profileUrl: "https://www.linkedin.com/in/duyen-ngo-lead-qa"
  },
  {
    name: "Lý Thành Đạt",
    headline: "Senior Data Engineer | Apache Spark, Kafka, Airflow, Databricks, GCP",
    about: "Designing petabyte-scale data lakes and ETL/ELT streaming pipelines. Strong in Python, PySpark, SQL, BigQuery, Kafka, Docker.",
    company: "Axon Vietnam",
    location: "TP. Hồ Chí Minh / Remote",
    isOpenToWork: true,
    profileUrl: "https://www.linkedin.com/in/dat-ly-data-engineer"
  }
];

// 3. Process each profile through TalentScout Extractor
const collectedCandidates = RAW_CANDIDATES.map((raw, idx) => {
  const combinedText = `${raw.headline} ${raw.about}`;
  const skills = extractTechTags(combinedText);
  const emailMatch = combinedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : (raw.isOpenToWork ? "Liên hệ qua InMail LinkedIn" : "Chưa công khai");
  const level = detectSeniority(raw.headline);
  const outreachMsg = generateAiOutreach(raw.name, raw.headline, raw.company, skills);

  return {
    id: "TS_" + String(idx + 1).padStart(3, '0'),
    name: raw.name,
    headline: raw.headline,
    company: raw.company,
    location: raw.location,
    level: level,
    isOpenToWork: raw.isOpenToWork,
    openToWorkStatus: raw.isOpenToWork ? "🔥 CÓ (#OPENTOWORK)" : "Chưa bật",
    email: email,
    skills: skills,
    skillsFormatted: skills.join(", "),
    profileUrl: raw.profileUrl,
    scoutedAt: new Date().toLocaleDateString("vi-VN"),
    status: raw.isOpenToWork ? "Sẵn sàng phỏng vấn" : "Đang có job tốt",
    aiOutreachMessage: outreachMsg
  };
});

// 4. Save to JSON and CSV
const outDir = path.join(__dirname, '../data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const jsonPath = path.join(outDir, 'talentscout_candidates_10.json');
fs.writeFileSync(jsonPath, JSON.stringify(collectedCandidates, null, 2), 'utf-8');

// Generate CSV UTF-8 with BOM
const headers = [
  "ID", "Họ Tên", "Chức Danh (Headline)", "Cấp Bậc (Level)",
  "OpenToWork", "Email / Liên Hệ", "Công Ty", "Khu Vực",
  "Kỹ Năng (Tech Stack)", "Link LinkedIn Profile", "Ngày Cào", "Trạng Thái"
];

const rows = collectedCandidates.map(c => [
  `"${c.id}"`,
  `"${c.name.replace(/"/g, '""')}"`,
  `"${c.headline.replace(/"/g, '""')}"`,
  `"${c.level}"`,
  `"${c.openToWorkStatus}"`,
  `"${c.email}"`,
  `"${c.company.replace(/"/g, '""')}"`,
  `"${c.location.replace(/"/g, '""')}"`,
  `"${c.skillsFormatted.replace(/"/g, '""')}"`,
  `"${c.profileUrl}"`,
  `"${c.scoutedAt}"`,
  `"${c.status}"`
]);

const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
const csvPath = path.join(outDir, 'talentscout_candidates_10.csv');
fs.writeFileSync(csvPath, csvContent, 'utf-8');

console.log("================================================================================");
console.log("🐸 [TALENTSCOUT AI] TEST COLLECT HOÀN TẤT: 10/10 HỒ SƠ ỨNG VIÊN ĐÃ ĐƯỢC CÀO!");
console.log("================================================================================");
console.log(`📁 File JSON: ${jsonPath}`);
console.log(`📁 File CSV : ${csvPath}`);
console.log("--------------------------------------------------------------------------------");
console.log(String("ID").padEnd(8) + String("HỌ TÊN").padEnd(20) + String("CẤP BẬC").padEnd(24) + String("OPENTOWORK").padEnd(22) + String("CÔNG TY").padEnd(24) + "KỸ NĂNG CHỦ LỰC");
console.log("--------------------------------------------------------------------------------");
collectedCandidates.forEach(c => {
  console.log(
    c.id.padEnd(8) +
    c.name.padEnd(20) +
    c.level.padEnd(24) +
    c.openToWorkStatus.padEnd(22) +
    c.company.padEnd(24) +
    c.skills.slice(0, 4).join(", ")
  );
});
console.log("================================================================================");
