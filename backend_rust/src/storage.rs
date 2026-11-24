use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::collections::HashSet;
use crate::models::{Candidate, DailyState, IncomingCandidate};

pub struct StorageManager {
    pub base_dir: PathBuf,
    pub data_dir: PathBuf,
    pub state_file: PathBuf,
}

impl StorageManager {
    pub fn new() -> Self {
        // Resolve base directory
        let base_dir = if Path::new("products/talentscout-extension").exists() {
            PathBuf::from(".")
        } else if Path::new("../products/talentscout-extension").exists() {
            PathBuf::from("..")
        } else {
            PathBuf::from("/Users/happypc/AIEarnMoney")
        };

        let data_dir = base_dir.join("products/talentscout-extension/data");
        let state_file = base_dir.join(".talentscout_scanner_state.json");

        if let Err(e) = fs::create_dir_all(&data_dir) {
            eprintln!("Warning: Failed to create data dir: {}", e);
        }

        Self {
            base_dir,
            data_dir,
            state_file,
        }
    }

    pub fn load_state(&self) -> DailyState {
        if self.state_file.exists() {
            if let Ok(mut f) = File::open(&self.state_file) {
                let mut content = String::new();
                if f.read_to_string(&mut content).is_ok() {
                    if let Ok(state) = serde_json::from_str::<DailyState>(&content) {
                        return state;
                    }
                }
            }
        }
        DailyState::default()
    }

    pub fn save_state(&self, state: &DailyState) -> std::io::Result<()> {
        let json_str = serde_json::to_string_pretty(state)?;
        let mut f = File::create(&self.state_file)?;
        f.write_all(json_str.as_bytes())?;
        Ok(())
    }

    pub fn load_master_candidates(&self) -> Vec<Candidate> {
        let master_json = self.data_dir.join("talentscout_candidates_master.json");
        if master_json.exists() {
            if let Ok(content) = fs::read_to_string(&master_json) {
                if let Ok(list) = serde_json::from_str::<Vec<Candidate>>(&content) {
                    return list;
                }
            }
        }
        Vec::new()
    }

    pub fn save_candidates_json(&self, file_path: &Path, candidates: &[Candidate]) -> std::io::Result<()> {
        let json_str = serde_json::to_string_pretty(candidates)?;
        fs::write(file_path, json_str)?;
        Ok(())
    }

    pub fn export_to_csv_bom(&self, file_path: &Path, candidates: &[Candidate]) -> std::io::Result<()> {
        let headers = [
            "ID", "Họ Tên", "Chức Danh (Headline)", "Cấp Bậc (Level)",
            "OpenToWork", "Email / Liên Hệ", "Công Ty", "Khu Vực",
            "Kỹ Năng (Tech Stack)", "Link LinkedIn Profile", "Ngày Cào", "Trạng Thái"
        ];

        let mut lines = Vec::new();
        // UTF-8 BOM
        let mut content = String::from("\u{FEFF}");
        lines.push(headers.join(","));

        for c in candidates {
            let row = vec![
                format!("\"{}\"", clean_csv(&c.id)),
                format!("\"{}\"", clean_csv(&c.name)),
                format!("\"{}\"", clean_csv(&c.headline)),
                format!("\"{}\"", clean_csv(&c.level)),
                format!("\"{}\"", clean_csv(&c.open_to_work_status)),
                format!("\"{}\"", clean_csv(&c.email)),
                format!("\"{}\"", clean_csv(&c.company)),
                format!("\"{}\"", clean_csv(&c.location)),
                format!("\"{}\"", clean_csv(&c.skills_formatted)),
                format!("\"{}\"", clean_csv(&c.profile_url)),
                format!("\"{}\"", clean_csv(&c.scouted_at)),
                format!("\"{}\"", clean_csv(&c.status)),
            ];
            lines.push(row.join(","));
        }

        content.push_str(&lines.join("\r\n"));
        content.push_str("\r\n");
        fs::write(file_path, content)?;
        Ok(())
    }

    pub fn append_candidates(&self, incoming: Vec<IncomingCandidate>) -> (usize, usize, usize) {
        let mut master = self.load_master_candidates();
        let mut seen_urls: HashSet<String> = master
            .iter()
            .map(|c| c.profile_url.trim_end_matches('/').to_lowercase())
            .collect();

        let mut added = 0;
        let mut duplicates = 0;
        let today = chrono::Local::now().format("%d/%m/%Y").to_string();

        for (idx, inc) in incoming.into_iter().enumerate() {
            let clean_url = inc.profile_url.trim_end_matches('/').to_lowercase();
            if seen_urls.contains(&clean_url) {
                duplicates += 1;
                continue;
            }

            seen_urls.insert(clean_url);
            added += 1;

            let is_open = inc.is_open_to_work.unwrap_or(false);
            let open_status = inc.open_to_work_status.unwrap_or_else(|| {
                if is_open {
                    "🔥 CÓ (#OPENTOWORK)".to_string()
                } else {
                    "Chưa bật".to_string()
                }
            });

            let skills = inc.skills.unwrap_or_else(|| vec!["Chung".to_string()]);
            let skills_formatted = inc.skills_formatted.unwrap_or_else(|| skills.join(", "));
            let id = inc.id.unwrap_or_else(|| {
                let now_code = chrono::Local::now().format("%y%m%d").to_string();
                format!("TS_REAL_{}_{:03}", now_code, idx + 1)
            });

            let email = inc.email.unwrap_or_else(|| {
                if is_open {
                    "Liên hệ qua InMail LinkedIn".to_string()
                } else {
                    "Chưa công khai".to_string()
                }
            });

            let outreach = inc.ai_outreach_message.unwrap_or_else(|| {
                let company = inc.company.as_deref().unwrap_or("doanh nghiệp");
                let headline = inc.headline.as_deref().unwrap_or("Kỹ sư công nghệ");
                format!(
                    "Chào {},\n\nMình ấn tượng với hồ sơ của bạn ở vị trí {} tại {}.\n\n(Gửi qua TalentScout AI)",
                    inc.name, headline, company
                )
            });

            let candidate = Candidate {
                id,
                name: inc.name,
                headline: inc.headline.unwrap_or_else(|| "Kỹ sư phần mềm".to_string()),
                company: inc.company.unwrap_or_else(|| "Chưa cập nhật".to_string()),
                location: inc.location.unwrap_or_else(|| "Việt Nam".to_string()),
                level: inc.level.unwrap_or_else(|| "Mid-Level".to_string()),
                is_open_to_work: is_open,
                open_to_work_status: open_status,
                email,
                skills,
                skills_formatted,
                profile_url: inc.profile_url,
                scouted_at: inc.scouted_at.unwrap_or_else(|| today.clone()),
                status: inc.status.unwrap_or_else(|| {
                    if is_open {
                        "Sẵn sàng phỏng vấn".to_string()
                    } else {
                        "Mới cào từ LinkedIn thật".to_string()
                    }
                }),
                ai_outreach_message: outreach,
            };

            // Prepend new candidate so it appears on top
            master.insert(0, candidate);
        }

        if added > 0 {
            let master_json = self.data_dir.join("talentscout_candidates_master.json");
            let master_csv = self.data_dir.join("talentscout_candidates_master.csv");
            let public_csv = self.base_dir.join("products/talentscout_candidates_master.csv");

            let _ = self.save_candidates_json(&master_json, &master);
            let _ = self.export_to_csv_bom(&master_csv, &master);
            let _ = self.export_to_csv_bom(&public_csv, &master);

            // Update daily state
            let mut state = self.load_state();
            let today_iso = chrono::Local::now().format("%Y-%m-%d").to_string();
            if state.last_scan_date == today_iso {
                state.today_scanned_count += added;
            } else {
                state.last_scan_date = today_iso;
                state.today_scanned_count = added;
            }
            state.total_lifetime_scanned += added;
            let _ = self.save_state(&state);

            // Trigger cv_exporter.py to refresh JS and JSON marketplace data
            let exporter_script = self.base_dir.join("services/cv_exporter.py");
            if exporter_script.exists() {
                let _ = std::process::Command::new("python3")
                    .arg(&exporter_script)
                    .output();
            }
        }

        (added, duplicates, master.len())
    }
}

fn clean_csv(val: &str) -> String {
    val.replace('"', "\"\"")
}
