"""
Pepe Nuôi Thân — Autonomous Cloudflare Deployer & Git Sync
Tự động đẩy nhật ký và sản phẩm mới lên Cloudflare Pages
"""

import subprocess
from datetime import datetime
from services.config import BASE_DIR, CF_PROJECT_NAME, CF_BRANCH, AUTO_DEPLOY


class AutoDeployer:
    def __init__(self, base_dir=BASE_DIR):
        self.base_dir = base_dir

    def commit_and_deploy(self, note: str = "Tự động cập nhật nhật ký & sản phẩm") -> dict:
        """Thực hiện git commit và npx wrangler deploy."""
        now_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        res = {
            "git_commit": None,
            "cf_deployed": False,
            "url": None,
            "error": None
        }

        # 1. Git add and commit
        try:
            subprocess.run(["git", "add", "."], cwd=self.base_dir, check=True, capture_output=True)
            commit_msg = f"chore(pepe-auto): {note} [{now_str}]"
            c_proc = subprocess.run(
                ["git", "commit", "-m", commit_msg],
                cwd=self.base_dir,
                capture_output=True,
                text=True
            )
            res["git_commit"] = "Committed" if c_proc.returncode == 0 else "No changes to commit"
        except Exception as e:
            res["git_commit"] = f"Git error: {e}"

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
                else:
                    res["error"] = d_proc.stderr or d_proc.stdout
            except Exception as e:
                res["error"] = str(e)

        return res
