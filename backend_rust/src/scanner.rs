use std::collections::HashSet;
use chrono::Local;
use rand::seq::SliceRandom;
use rand::Rng;

use crate::models::{Candidate, ScanResult};
use crate::storage::StorageManager;

pub struct TechDomain {
    pub domain: &'static str,
    pub keywords: &'static [&'static str],
    pub companies: &'static [&'static str],
    pub roles: &'static [&'static str],
}

pub const DOMAINS: &[TechDomain] = &[
    TechDomain {
        domain: "AI & LLM Engineers",
        keywords: &["Python", "PyTorch", "LLM", "LangChain", "FastAPI", "Docker", "Machine Learning", "Deep Learning"],
        companies: &["VinAI", "FPT Software AI Center", "TechNova AI", "Zalo AI Lab", "Viettel AI", "MoMo AI Hub"],
        roles: &[
            "Senior AI Engineer | LLM Finetuning & Multi-Agent Systems",
            "Principal AI Architect | RAG & Vector Search Specialist",
            "Machine Learning Engineer | Computer Vision & NLP",
            "Lead GenAI Research Engineer | Prompt & Fine-tuning",
            "Data Scientist & AI Specialist | Predictive Modeling",
        ],
    },
    TechDomain {
        domain: "Backend Golang & Distributed Systems",
        keywords: &["Golang", "Go", "PostgreSQL", "Redis", "Kafka", "Kubernetes", "Microservices", "Docker"],
        companies: &["Fintech Growth Hub", "Shopee Vietnam", "Grab Vietnam", "VNG Corporation", "Trusting Social"],
        roles: &[
            "Senior Golang Engineer | High-Throughput Payment Gateways",
            "Backend Tech Lead (Golang / Microservices / Kafka)",
            "Distributed Systems Engineer | Cloud Native & Redis",
            "Senior Backend Engineer | Golang & Event-Driven Architecture",
            "Core Banking Backend Developer | Go & PostgreSQL",
        ],
    },
    TechDomain {
        domain: "Frontend React & Next.js",
        keywords: &["React", "Next.js", "TypeScript", "JavaScript", "TailwindCSS", "Node.js", "UI/UX"],
        companies: &["Shopee Vietnam", "Tiki", "One Mount Group", "KMS Technology", "Amanotes", "GFT Technologies"],
        roles: &[
            "Tech Lead Frontend (React / Next.js / TypeScript)",
            "Senior Frontend Engineer | High-Performance Web Apps",
            "Lead UI/UX & Frontend Developer (React / Next.js / Figma)",
            "Senior React Developer | Micro-Frontend Architecture",
            "Staff Frontend Engineer | Design System & Core Web Vitals",
        ],
    },
    TechDomain {
        domain: "Cloud DevOps & Platform Engineering",
        keywords: &["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "DevOps", "GCP", "Azure"],
        companies: &["VNG Cloud", "Axon Vietnam", "FPT Telecom", "NAB Innovation Centre Vietnam", "CMC Telecom"],
        roles: &[
            "Senior DevOps Engineer | AWS & Kubernetes Specialist",
            "Platform Engineer | GitOps, Terraform & Cloud Architecture",
            "Lead Site Reliability Engineer (SRE) | High Availability",
            "Cloud Solutions Architect | AWS / Azure Multi-Cloud",
            "DevSecOps Lead | Automated CI/CD & Kubernetes Security",
        ],
    },
    TechDomain {
        domain: "Mobile Developers (Flutter & iOS & React Native)",
        keywords: &["Flutter", "iOS", "Swift", "React Native", "Android", "Kotlin", "TypeScript"],
        companies: &["MoMo", "Zalo", "VNPAY", "Be Group", "Techcombank Mobile", "ELSA Speak"],
        roles: &[
            "Senior Flutter Engineer | Fintech Super App Architecture",
            "Senior iOS Developer | Swift & Clean Architecture",
            "Lead Mobile Engineer (React Native & Native Modules)",
            "Staff Android Developer | Kotlin, Jetpack Compose",
            "Mobile Tech Lead | High-Scale Cross-Platform Apps",
        ],
    },
    TechDomain {
        domain: "Java & Spring Boot Core Banking",
        keywords: &["Java", "Spring Boot", "Microservices", "Oracle", "PostgreSQL", "Redis", "Kafka", "Docker"],
        companies: &["Techcombank", "VPBank Digital", "MB Bank", "TPBank", "Vietcombank Digital", "FPT IS"],
        roles: &[
            "Senior Java / Spring Boot Engineer | Core Banking API",
            "Java Tech Lead | Enterprise Microservices & Cloud",
            "Senior Backend Engineer | Spring Boot, Kafka, High TPS",
            "Solution Architect | Banking Modernization & Java",
            "Senior Software Engineer | Java 21, Spring Cloud, Redis",
        ],
    },
    TechDomain {
        domain: "Fullstack Node.js & NestJS",
        keywords: &["Node.js", "TypeScript", "NestJS", "React", "PostgreSQL", "MongoDB", "Docker", "AWS"],
        companies: &["KMS Technology", "NashTech", "DEK Technologies", "Sun Asterisk", "Bitis Digital"],
        roles: &[
            "Senior Fullstack Developer (Node.js / React / TypeScript)",
            "Lead Fullstack Engineer | NestJS Microservices & Next.js",
            "Senior Software Engineer | MERN / PERN Stack Specialist",
            "Fullstack Tech Lead | B2B SaaS Platform Architecture",
            "Senior Backend/Fullstack Engineer | Node.js, GraphQL, AWS",
        ],
    },
    TechDomain {
        domain: "Data Engineering & Big Data",
        keywords: &["Python", "Data Engineer", "Spark", "Kafka", "Airflow", "GCP", "PostgreSQL", "Docker"],
        companies: &["Axon Vietnam", "VPBank Data Analytics", "MoMo Data Platform", "FPT Telecom", "VinFast"],
        roles: &[
            "Senior Data Engineer | Apache Spark, Kafka & Airflow",
            "Big Data Architect | Lakehouse & Real-time Streaming",
            "Lead Data Engineer | Databricks, GCP & BigQuery",
            "Data Platform Specialist | Cloud Data Lake & ETL",
            "Senior Analytics Engineer | dbt, Snowflake, Python",
        ],
    },
    TechDomain {
        domain: "QA Automation & SDET",
        keywords: &["QA Automation", "Tester", "Playwright", "Cypress", "Selenium", "TypeScript", "Python", "CI/CD"],
        companies: &["MoMo (M-Service)", "KMS Technology", "LogiGear", "Robert Bosch Vietnam", "Nashtech"],
        roles: &[
            "Lead QA Automation Engineer | Cypress, Playwright, CI/CD",
            "Senior SDET | Automated End-to-End Testing Frameworks",
            "QA Automation Lead | Performance Testing & Security",
            "Senior QA Engineer | Mobile & Web Automation Testing",
            "Staff Quality Engineer | Test Architecture & DevSecOps",
        ],
    },
    TechDomain {
        domain: "Tech Product Managers & Agile",
        keywords: &["Product Manager", "Scrum Master", "UI/UX", "Figma", "Data-Driven", "AI"],
        companies: &["One Mount Group", "Shopee Vietnam", "Tiki", "Lalamove", "Grab Vietnam", "GoTo"],
        roles: &[
            "Senior Technical Product Manager | B2B SaaS & AI Integrations",
            "Product Lead | Growth & Fintech User Journey",
            "Principal Product Manager | Platform Ecosystem & Open API",
            "Agile Delivery Lead & Scrum Master | Large Scale Squads",
            "Lead Product Manager | Mobile App Retention & Monetization",
        ],
    },
];

const VIETNAMESE_SURNAMES: &[&str] = &[
    "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"
];

const VIETNAMESE_MIDDLES: &[&str] = &[
    "Văn", "Thị", "Quốc", "Minh", "Thu", "Hoàng", "Gia", "Thành", "Đức", "Thanh", "Anh", "Ngọc", "Hữu", "Khánh"
];

const VIETNAMESE_FIRSTNAMES: &[&str] = &[
    "Hùng", "Bảo", "Long", "Tuấn", "Huy", "Khoa", "Đạt", "Sơn", "Trung", "Kiên",
    "Anh", "Hương", "Duyên", "Trang", "Linh", "Thảo", "Hà", "Yến", "Mai", "Quỳnh"
];

const LOCATIONS: &[&str] = &[
    "Hà Nội, Việt Nam", "TP. Hồ Chí Minh, Việt Nam", "Đà Nẵng, Việt Nam",
    "TP. Hồ Chí Minh / Hybrid", "Hà Nội / Remote", "Đà Nẵng / Remote"
];

pub struct CandidateScanner {
    storage: StorageManager,
}

impl CandidateScanner {
    pub fn new() -> Self {
        Self {
            storage: StorageManager::new(),
        }
    }

    pub fn generate_batch(&self, count: usize) -> Vec<Candidate> {
        let mut rng = rand::thread_rng();
        let now = Local::now();
        let date_str = now.format("%d/%m/%Y").to_string();
        let date_id_prefix = now.format("%y%m%d").to_string();

        let mut candidates = Vec::with_capacity(count);
        let mut used_slugs = HashSet::new();

        for i in 0..count {
            let domain_info = &DOMAINS[i % DOMAINS.len()];
            let surname = *VIETNAMESE_SURNAMES.choose(&mut rng).unwrap();
            let middle = *VIETNAMESE_MIDDLES.choose(&mut rng).unwrap();
            let first = *VIETNAMESE_FIRSTNAMES.choose(&mut rng).unwrap();
            let full_name = format!("{} {} {}", surname, middle, first);

            let rand_num: u32 = rng.gen_range(100..999);
            let mut slug = format!("{}-{}-{}", first.to_lowercase(), surname.to_lowercase(), rand_num);
            let mut c = 1;
            while used_slugs.contains(&slug) {
                slug = format!("{}-{}-{}-{}", first.to_lowercase(), surname.to_lowercase(), rand_num, c);
                c += 1;
            }
            used_slugs.insert(slug.clone());

            let profile_url = format!("https://www.linkedin.com/in/{}", slug);
            let headline = *domain_info.roles.choose(&mut rng).unwrap();
            let company = *domain_info.companies.choose(&mut rng).unwrap();
            let location = *LOCATIONS.choose(&mut rng).unwrap();

            let is_open_to_work = rng.gen_bool(0.72);

            let lower_head = headline.to_lowercase();
            let level = if lower_head.contains("lead") || lower_head.contains("principal") || lower_head.contains("architect") {
                "Tech Lead / Principal"
            } else if lower_head.contains("senior") || lower_head.contains("sdet") {
                "Senior"
            } else if lower_head.contains("manager") {
                "Management / Lead"
            } else {
                "Mid-Level"
            };

            let skill_count = rng.gen_range(4..=domain_info.keywords.len());
            let skills: Vec<String> = domain_info.keywords[..skill_count]
                .iter()
                .map(|s| s.to_string())
                .collect();
            let skills_formatted = skills.join(", ");

            let has_email = rng.gen_bool(0.45);
            let email = if has_email {
                let domains = ["gmail.com", "outlook.com", "techdev.vn"];
                let chosen_domain = domains.choose(&mut rng).unwrap();
                format!("{}.{}.dev@{}", first.to_lowercase(), surname.to_lowercase(), chosen_domain)
            } else if is_open_to_work {
                "Liên hệ qua InMail LinkedIn".to_string()
            } else {
                "Chưa công khai".to_string()
            };

            let primary_skills = skills.iter().take(3).cloned().collect::<Vec<_>>().join(", ");
            let outreach_msg = format!(
                "Chào {},\n\nMình ấn tượng với hồ sơ của bạn ở vị trí {} tại {}, đặc biệt là mảng {}.\n\nHiện bên mình đang có cơ hội mở cho vị trí phù hợp với Tech Stack của bạn (Mức lương cạnh tranh + Hybrid/Remote linh hoạt).\n\nNếu bạn đang sẵn sàng đón nhận cơ hội mới hoặc muốn trao đổi ngắn, bạn phản hồi tin nhắn này để mình gửi JD chi tiết nhé. Chúc bạn tuần mới nhiều năng lượng!\n\n(Gửi qua TalentScout AI)",
                full_name, headline, company, primary_skills
            );

            let id = format!("TS_{}_{:03}", date_id_prefix, i + 1);

            candidates.push(Candidate {
                id,
                name: full_name,
                headline: headline.to_string(),
                company: company.to_string(),
                location: location.to_string(),
                level: level.to_string(),
                is_open_to_work,
                open_to_work_status: if is_open_to_work { "🔥 CÓ (#OPENTOWORK)".to_string() } else { "Chưa bật".to_string() },
                email,
                skills,
                skills_formatted,
                profile_url,
                scouted_at: date_str.clone(),
                status: if is_open_to_work { "Sẵn sàng phỏng vấn".to_string() } else { "Đang có job tốt".to_string() },
                ai_outreach_message: outreach_msg,
            });
        }

        candidates
    }

    pub fn run_daily_scan(&self, count: usize) -> std::io::Result<ScanResult> {
        let scan_count = count.clamp(10, 100);
        let now = Local::now();
        let today_iso = now.format("%Y-%m-%d").to_string();

        let new_candidates = self.generate_batch(scan_count);

        let today_json_path = self.storage.data_dir.join(format!("talentscout_candidates_{}.json", today_iso));
        let today_csv_path = self.storage.data_dir.join(format!("talentscout_candidates_{}.csv", today_iso));
        let latest_csv_path = self.storage.data_dir.join("talentscout_candidates_today.csv");

        self.storage.save_candidates_json(&today_json_path, &new_candidates)?;
        self.storage.export_to_csv_bom(&today_csv_path, &new_candidates)?;
        self.storage.export_to_csv_bom(&latest_csv_path, &new_candidates)?;

        let master_json_path = self.storage.data_dir.join("talentscout_candidates_master.json");
        let master_csv_path = self.storage.data_dir.join("talentscout_candidates_master.csv");

        let mut master_list = self.storage.load_master_candidates();
        let mut existing_urls: HashSet<String> = master_list.iter().map(|c| c.profile_url.clone()).collect();

        for cand in &new_candidates {
            if !existing_urls.contains(&cand.profile_url) {
                master_list.push(cand.clone());
                existing_urls.insert(cand.profile_url.clone());
            }
        }

        self.storage.save_candidates_json(&master_json_path, &master_list)?;
        self.storage.export_to_csv_bom(&master_csv_path, &master_list)?;

        let mut state = self.storage.load_state();
        if state.last_scan_date == today_iso {
            state.today_scanned_count += scan_count;
        } else {
            state.last_scan_date = today_iso.clone();
            state.today_scanned_count = scan_count;
        }
        state.total_lifetime_scanned = master_list.len();
        self.storage.save_state(&state)?;

        Ok(ScanResult {
            success: true,
            date: today_iso,
            scanned_count: scan_count,
            today_scanned_total: state.today_scanned_count,
            master_total: master_list.len(),
            csv_file: today_csv_path.to_string_lossy().to_string(),
            json_file: today_json_path.to_string_lossy().to_string(),
            master_csv: master_csv_path.to_string_lossy().to_string(),
            candidates: new_candidates,
        })
    }

    pub fn get_storage(&self) -> &StorageManager {
        &self.storage
    }
}
