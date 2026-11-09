use std::sync::Arc;
use axum::{
    extract::{Query, State},
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Json, Response},
    routing::{get, post},
    Router,
};
use chrono::Local;
use serde::Deserialize;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;
use tracing::info;

use crate::models::{HealthResponse, ScanRequest, SetQuotaRequest, StatsResponse};
use crate::scanner::CandidateScanner;

#[derive(Clone)]
pub struct AppState {
    pub scanner: Arc<CandidateScanner>,
}

#[derive(Debug, Deserialize)]
pub struct CandidateFilterQuery {
    pub search: Option<String>,
    pub level: Option<String>,
    pub skill: Option<String>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

pub fn create_router(scanner: Arc<CandidateScanner>) -> Router {
    let state = AppState { scanner };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let base_dir = &state.scanner.get_storage().base_dir;

    Router::new()
        // TalentScout REST API
        .route("/api/talentscout/health", get(handle_ts_health))
        .route("/api/talentscout/stats", get(handle_ts_stats))
        .route("/api/talentscout/candidates", get(handle_get_candidates))
        .route("/api/talentscout/scan", post(handle_trigger_scan))
        .route("/api/talentscout/export", get(handle_export_csv))
        .route("/api/talentscout/quota", post(handle_set_quota))
        // General / Pepe Server compatibility endpoints
        .route("/api/health", get(handle_general_health))
        .route("/api/custom-order", post(handle_custom_order))
        // Serve static files from repository
        .fallback_service(ServeDir::new(base_dir))
        .layer(cors)
        .with_state(state)
}

async fn handle_ts_health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "online".to_string(),
        service: "TalentScout AI High-Performance Rust Engine".to_string(),
        version: "1.2.0".to_string(),
        rust_engine: "Tokio + Axum (Zero CPU Idle · Apple Silicon M4)".to_string(),
        timestamp: Local::now().to_rfc3339(),
    })
}

async fn handle_ts_stats(State(state): State<AppState>) -> Json<StatsResponse> {
    let daily = state.scanner.get_storage().load_state();
    let master = state.scanner.get_storage().load_master_candidates();
    let today = Local::now().format("%Y-%m-%d").to_string();

    let today_scanned = if daily.last_scan_date == today {
        daily.today_scanned_count
    } else {
        0
    };

    Json(StatsResponse {
        today_scanned,
        daily_quota: daily.daily_target,
        total_candidates: master.len(),
        date: today,
        status: if today_scanned >= daily.daily_target {
            "🎯 Đạt chỉ tiêu ngày".to_string()
        } else {
            "⚡ Đang chạy thu thập".to_string()
        },
    })
}

async fn handle_get_candidates(
    State(state): State<AppState>,
    Query(params): Query<CandidateFilterQuery>,
) -> impl IntoResponse {
    let mut list = state.scanner.get_storage().load_master_candidates();

    if let Some(ref search) = params.search {
        let kw = search.to_lowercase();
        list.retain(|c| {
            c.name.to_lowercase().contains(&kw)
                || c.headline.to_lowercase().contains(&kw)
                || c.company.to_lowercase().contains(&kw)
                || c.skills.iter().any(|s| s.to_lowercase().contains(&kw))
        });
    }

    if let Some(ref level) = params.level {
        let l = level.to_lowercase();
        list.retain(|c| c.level.to_lowercase().contains(&l));
    }

    if let Some(ref skill) = params.skill {
        let s = skill.to_lowercase();
        list.retain(|c| c.skills.iter().any(|sk| sk.to_lowercase().contains(&s)));
    }

    let total = list.len();
    let offset = params.offset.unwrap_or(0);
    let limit = params.limit.unwrap_or(50);

    let paged: Vec<_> = list.into_iter().skip(offset).take(limit).collect();

    Json(serde_json::json!({
        "success": true,
        "total": total,
        "offset": offset,
        "limit": limit,
        "candidates": paged
    }))
}

async fn handle_trigger_scan(
    State(state): State<AppState>,
    Json(payload): Json<ScanRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let count = payload.count.clamp(10, 100);
    info!("🚀 [Rust API] Trigger scan requested: {} candidates", count);

    match state.scanner.run_daily_scan(count) {
        Ok(result) => Ok(Json(serde_json::json!(result))),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Scan failed: {}", e),
        )),
    }
}

async fn handle_export_csv(State(state): State<AppState>) -> Response {
    let master_csv_path = state.scanner.get_storage().data_dir.join("talentscout_candidates_master.csv");
    let content = match std::fs::read(&master_csv_path) {
        Ok(bytes) => bytes,
        Err(_) => {
            let list = state.scanner.get_storage().load_master_candidates();
            let buf = Vec::new();
            let _ = state.scanner.get_storage().export_to_csv_bom(&master_csv_path, &list);
            std::fs::read(&master_csv_path).unwrap_or_else(|_| buf)
        }
    };

    let mut headers = HeaderMap::new();
    headers.insert(
        header::CONTENT_TYPE,
        "text/csv; charset=utf-8".parse().unwrap(),
    );
    headers.insert(
        header::CONTENT_DISPOSITION,
        "attachment; filename=\"talentscout_candidates.csv\"".parse().unwrap(),
    );

    (headers, content).into_response()
}

async fn handle_set_quota(
    State(state): State<AppState>,
    Json(payload): Json<SetQuotaRequest>,
) -> Json<serde_json::Value> {
    let mut current_state = state.scanner.get_storage().load_state();
    current_state.daily_target = payload.quota.clamp(10, 100);
    let _ = state.scanner.get_storage().save_state(&current_state);

    Json(serde_json::json!({
        "success": true,
        "new_quota": current_state.daily_target
    }))
}

async fn handle_general_health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "online",
        "pepe": "running (rust)",
        "message": "Pepe Nuôi Thân Server (Rust Accelerated) đang hoạt động tốt!"
    }))
}

async fn handle_custom_order(
    Json(body): Json<serde_json::Value>,
) -> Json<serde_json::Value> {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let rand_digits: u32 = rng.gen_range(10000..99999);
    let rand_code = format!("PEPE-RS-{}", rand_digits);

    Json(serde_json::json!({
        "ok": true,
        "code": rand_code,
        "received": body,
        "message": "Đã tiếp nhận yêu cầu từ Pepe Rust Server"
    }))
}
