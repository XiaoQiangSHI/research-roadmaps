# Open Research Roadmaps

一个数据驱动、可审查、可扩展的研究发展路线图库。它把论文、持续问题、解决方案、机构与路线归属存成 YAML，再由同一套 Astro 页面生成交互式时间轴。

## 当前内容

- `embodied-ai`：60 篇论文、7 条具身智能发展线路。
- `vla`：从具身智能数据动态生成的 VLA 与世界模型专题视图。

## 本地运行

```bash
npm install
npm run validate
npm run dev
```

生产构建与预览：

```bash
npm run build
npm run preview
```

然后访问终端显示的 HTTP 地址。不要直接双击 `dist/index.html`：Astro 的静态资源使用站点路径，必须通过 HTTP 服务访问。

提交数据前建议完整执行：

```bash
npm run check
npm run validate
npm test
npm run build
npm run test:e2e
npm run check:links
```

`check:links` 会访问论文来源，适合在网络可用时运行；其余命令均为本地、确定性检查。

## 数据结构

```text
datasets/<domain>/
├─ roadmap.yaml       # 领域、路线、持续问题与演进阶段
├─ papers.yaml        # 论文、机构引用、链接与归类依据
├─ institutions.yaml  # 机构名称和离线徽标
└─ references.yaml    # 领域级来源和筛选规则
```

`schemas/` 提供 JSON Schema；`npm run validate` 还会检查重复论文、无效路线、无效机构与缺失来源。

## 增加路线图

完整领域复制 `datasets/_template`。专题路线图可以只创建一个 `kind: view` 的 `roadmap.yaml`，引用已有领域中的若干路线，因此不会复制论文事实。

详细规则见 [CONTRIBUTING.md](CONTRIBUTING.md)。

每个领域由 `roadmap.yaml` 中的 `editorial.maintainers` 指定维护者。新增或修改路线归属时，Pull Request 必须说明事实来源、归类理由和置信度；领域维护者负责审核本领域的路线判断。

## 部署

推送到 GitHub 的 `main` 分支后，`.github/workflows/deploy.yml` 会自动构建并发布到 GitHub Pages，并自动兼容 `owner.github.io` 根站点和普通项目仓库的子路径。

首次部署：

1. 在 GitHub 创建仓库并推送本目录内容。
2. 打开 **Settings → Pages**。
3. 将 **Build and deployment → Source** 设为 **GitHub Actions**。
4. 推送到 `main`，或在 Actions 页面手动运行 **Deploy to GitHub Pages**。

## 许可证

- 代码：Apache License 2.0，见 [LICENSE](LICENSE)。
- `datasets/` 中的原创路线数据：CC BY 4.0，见 [LICENSE-DATA](LICENSE-DATA)。
- 论文、商标和 Logo 的权利归其原始权利人所有；本项目仅作引用和识别。
