use clap::{Parser, Subcommand};
use talentscout_backend::scanner::CandidateScanner;

#[derive(Parser)]
#[command(name = "talentscout-cli")]
#[command(author = "Pepe Nuôi Thân Tech Labs")]
#[command(version = "1.2.0")]
#[command(about = "TalentScout AI — Rust CLI for LinkedIn Candidate Harvester (10-100 CV/ngày)")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Cào và lưu lô hồ sơ ứng viên IT/AI mới hôm nay (10 - 100 CV)
    Scan {
        #[arg(short, long, default_value_t = 50)]
        count: usize,
    },
    /// Xem thống kê cơ sở dữ liệu ứng viên và tiến độ hôm nay
    Stats,
    /// Liệt kê danh sách ứng viên trong database
    List {
        #[arg(short, long, default_value_t = 10)]
        limit: usize,
        #[arg(short, long)]
        search: Option<String>,
    },
    /// Xuất database ra file CSV chuẩn Microsoft Excel (UTF-8 with BOM)
    Export {
        #[arg(short, long, default_value = "talentscout_export.csv")]
        output: String,
    },
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();
    let scanner = CandidateScanner::new();

    match cli.command {
        Commands::Scan { count } => {
            let scan_count = count.clamp(10, 100);
            println!("================================================================================");
            println!("🦀 [TALENTSCOUT AI RUST ENGINE] BẮT ĐẦU CÀO {} CV ỨNG VIÊN LINKEDIN...", scan_count);
            println!("================================================================================");

            let start = std::time::Instant::now();
            let res = scanner.run_daily_scan(scan_count)?;
            let elapsed = start.elapsed();

            println!("✅ Hoàn tất siêu tốc trong {:.2?}!", elapsed);
            println!("• Ngày quét: {}", res.date);
            println!("• Số lượng vừa cào: {} CV", res.scanned_count);
            println!("• Tổng quét hôm nay: {} CV", res.today_scanned_total);
            println!("• Tổng Master Database: {} CV", res.master_total);
            println!("• File CSV hôm nay: {}", res.csv_file);
            println!("• Master CSV CRM : {}", res.master_csv);
            println!("--------------------------------------------------------------------------------");
            println!("{:<16} {:<24} {:<22} {}", "MÃ ID", "HỌ TÊN", "CẤP BẬC", "CÔNG TY");
            println!("--------------------------------------------------------------------------------");
            for c in res.candidates.iter().take(10) {
                println!("{:<16} {:<24} {:<22} {}", c.id, c.name, c.level, c.company);
            }
            if res.candidates.len() > 10 {
                println!("... và {} ứng viên khác đã được lưu vào database.", res.candidates.len() - 10);
            }
            println!("================================================================================");
        }
        Commands::Stats => {
            let state = scanner.get_storage().load_state();
            let master = scanner.get_storage().load_master_candidates();
            let open_to_work = master.iter().filter(|c| c.is_open_to_work).count();

            println!("================================================================================");
            println!("📊 TALENTSCOUT AI — THỐNG KÊ DATABASE (RUST ENGINE)");
            println!("================================================================================");
            println!("• Tổng hồ sơ Master DB : {} ứng viên", master.len());
            println!("• Đang tìm việc (#OpenToWork): {} ứng viên ({:.1}%)", open_to_work, if master.is_empty() { 0.0 } else { (open_to_work as f64 / master.len() as f64) * 100.0 });
            println!("• Đã cào hôm nay ({}) : {} / {} CV mục tiêu", state.last_scan_date, state.today_scanned_count, state.daily_target);
            println!("• Đường dẫn Master CSV : {}/talentscout_candidates_master.csv", scanner.get_storage().data_dir.display());
            println!("================================================================================");
        }
        Commands::List { limit, search } => {
            let mut master = scanner.get_storage().load_master_candidates();
            if let Some(ref kw) = search {
                let lower = kw.to_lowercase();
                master.retain(|c| {
                    c.name.to_lowercase().contains(&lower)
                        || c.headline.to_lowercase().contains(&lower)
                        || c.skills.iter().any(|s| s.to_lowercase().contains(&lower))
                });
            }

            println!("================================================================================");
            println!("📋 DANH SÁCH ỨNG VIÊN (Hiển thị tối đa {} hồ sơ)", limit);
            println!("--------------------------------------------------------------------------------");
            println!("{:<16} {:<22} {:<22} {}", "ID", "HỌ TÊN", "LEVEL", "TECH STACK");
            println!("--------------------------------------------------------------------------------");
            for c in master.iter().take(limit) {
                let tags = c.skills.iter().take(3).cloned().collect::<Vec<_>>().join(", ");
                println!("{:<16} {:<22} {:<22} {}", c.id, c.name, c.level, tags);
            }
            println!("================================================================================");
        }
        Commands::Export { output } => {
            let master = scanner.get_storage().load_master_candidates();
            let out_path = std::path::Path::new(&output);
            scanner.get_storage().export_to_csv_bom(out_path, &master)?;
            println!("📥 Đã xuất thành công {} hồ sơ ra file: {}", master.len(), output);
        }
    }

    Ok(())
}
