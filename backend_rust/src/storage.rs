use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use crate::models::{Candidate, DailyState};

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
}

fn clean_csv(val: &str) -> String {
    val.replace('"', "\"\"")
}
