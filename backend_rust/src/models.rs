use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Candidate {
    pub id: String,
    pub name: String,
    pub headline: String,
    pub company: String,
    pub location: String,
    pub level: String,
    pub is_open_to_work: bool,
    pub open_to_work_status: String,
    pub email: String,
    pub skills: Vec<String>,
    pub skills_formatted: String,
    pub profile_url: String,
    pub scouted_at: String,
    pub status: String,
    pub ai_outreach_message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    pub success: bool,
    pub date: String,
    pub scanned_count: usize,
    pub today_scanned_total: usize,
    pub master_total: usize,
    pub csv_file: String,
    pub json_file: String,
    pub master_csv: String,
    #[serde(default)]
    pub candidates: Vec<Candidate>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyState {
    pub last_scan_date: String,
    pub today_scanned_count: usize,
    pub total_lifetime_scanned: usize,
    pub daily_target: usize,
}

impl Default for DailyState {
    fn default() -> Self {
        Self {
            last_scan_date: String::new(),
            today_scanned_count: 0,
            total_lifetime_scanned: 0,
            daily_target: 50,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanRequest {
    #[serde(default = "default_scan_count")]
    pub count: usize,
}

fn default_scan_count() -> usize {
    50
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SetQuotaRequest {
    pub quota: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatsResponse {
    pub today_scanned: usize,
    pub daily_quota: usize,
    pub total_candidates: usize,
    pub date: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub service: String,
    pub version: String,
    pub rust_engine: String,
    pub timestamp: String,
}
