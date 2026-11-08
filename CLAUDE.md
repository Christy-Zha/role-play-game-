# 灵潮修仙录 · 工作规矩

- 先读 `交接说明.md`，按里面写的位置直接改，少翻找。
- 只改 `src/` 里的源码，改完运行 `python3 build.py`，不要手改 `index.html`。
- 改完只跑 `node test-game.cjs` 和 `node test-art.cjs`。除非我明确要求，不做浏览器试玩、不截图。
- 命令输出尽量短：用 `head`、`grep -c`、`cut -c` 等截断，不要整段打印大文件。
- 一次对话只做一件事；做完就提交并推送到 `main`，不用反复确认。
- 推送前运行 `git fetch origin main:refs/remotes/origin/main`。
- 交流用中文；游戏里的文案不要写成制作说明的口吻。
