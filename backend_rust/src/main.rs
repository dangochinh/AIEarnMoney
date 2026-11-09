use std::net::SocketAddr;
use std::sync::Arc;
use clap::Parser;
use talentscout_backend::api::create_router;
use talentscout_backend::scanner::CandidateScanner;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[derive(Parser)]
#[command(name = "talentscout-server")]
#[command(author = "Pepe Nuôi Thân Tech Labs")]
#[command(version = "1.2.0")]
#[command(about = "TalentScout AI — Ultra-Fast Rust Web & Candidate Harvester Server")]
struct Args {
    #[arg(short, long, default_value_t = 8090)]
    port: u16,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "talentscout_backend=info,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let args = Args::parse();
    let port = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(args.port);

    let scanner = Arc::new(CandidateScanner::new());
    let router = create_router(scanner);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("==================================================");
    println!("🦀 TALENTSCOUT AI — RUST HIGH-PERFORMANCE BACKEND");
    println!("⚡ Engine: Tokio 1.38 + Axum 0.7 (Zero CPU Idle)");
    println!("👉 REST API Server: http://127.0.0.1:{}", port);
    println!("👉 Health check   : http://127.0.0.1:{}/api/talentscout/health", port);
    println!("👉 Stats endpoint : http://127.0.0.1:{}/api/talentscout/stats", port);
    println!("👉 Candidate list : http://127.0.0.1:{}/api/talentscout/candidates", port);
    println!("👉 Web Demo UI    : http://127.0.0.1:{}/products/talentscout-extension/demo.html", port);
    println!("==================================================");

    let listener = tokio::net::TcpListener::bind(addr).await?;
    info!("🚀 Rust Backend Server listening on http://{}", addr);

    axum::serve(listener, router)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn shutdown_signal() {
    let _ = tokio::signal::ctrl_c().await;
    println!("\n🛑 Đã nhận tín hiệu dừng. Tắt TalentScout Rust Server an toàn.");
}
