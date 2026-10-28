"""
Pepe Nuôi Thân — Autonomous Cloudflare Deployer & Git Sync
Tự động đẩy nhật ký và sản phẩm mới lên Cloudflare Pages
"""

import logging
import subprocess
from datetime import datetime
from services.config import BASE_DIR, CF_PROJECT_NAME, CF_BRANCH, AUTO_DEPLOY


class AutoDeployer:
    def __init__(self, base_dir=BASE_DIR):
        self.base_dir = base_dir

    def commit_and_deploy(self, note: str = "Tự động cập nhật nhật ký & sản phẩm") -> dict:
        """Thực hiện git commit, git push và npx wrangler deploy."""
        now_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        res = {
            "git_commit": None,
            "cf_deployed": False,
            "url": None,
            "error": None
        }

        # 1. Git add, commit & push
        try:
            subprocess.run(["git", "add", "."], cwd=self.base_dir, check=True, capture_output=True)
            commit_msg = f"chore(pepe-auto): {note} [{now_str}]"
            c_proc = subprocess.run(
                ["git", "commit", "-m", commit_msg],
                cwd=self.base_dir,
                capture_output=True,
                text=True
            )
            if c_proc.returncode == 0:
                res["git_commit"] = "Committed"
                logging.info(f"💾 [Deployer] Git commit thành công: '{commit_msg}'")
                try:
                    p_proc = subprocess.run(
                        ["git", "push", "origin", CF_BRANCH],
                        cwd=self.base_dir,
                        capture_output=True,
                        text=True,
                        timeout=30
                    )
                    if p_proc.returncode == 0:
                        logging.info("🐙 [Deployer] Đã sync code mới nhất lên GitHub origin/main.")
                except Exception as pe:
                    logging.warning(f"⚠️ [Deployer] Git push warning: {pe}")
            else:
                res["git_commit"] = "No changes to commit"
        except Exception as e:
            res["git_commit"] = f"Git error: {e}"
            logging.error(f"❌ [Deployer] Git error: {e}")

        # 2. Wrangler Pages Deploy
        if AUTO_DEPLOY:
            try:
                cmd = [
                    "npx", "wrangler", "pages", "deploy", ".",
                    f"--project-name={CF_PROJECT_NAME}",
                    f"--branch={CF_BRANCH}",
                    "--commit-dirty=true"
                ]
                d_proc = subprocess.run(
                    cmd,
                    cwd=self.base_dir,
                    capture_output=True,
                    text=True,
                    timeout=90
                )
                if d_proc.returncode == 0:
                    res["cf_deployed"] = True
                    res["url"] = f"https://{CF_PROJECT_NAME}.pages.dev"
                    logging.info(f"🌐 [Deployer] Cloudflare Pages deployed thành công -> {res['url']}")
                else:
                    err_msg = d_proc.stderr or d_proc.stdout
                    res["error"] = err_msg
                    logging.error(f"❌ [Deployer] Wrangler error: {err_msg}")
            except Exception as e:
                res["error"] = str(e)
                logging.error(f"❌ [Deployer] Deploy exception: {e}")

        return res
