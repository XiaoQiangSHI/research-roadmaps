# Open Research Roadmaps

[![CI](https://github.com/XiaoQiangSHI/research-roadmaps/actions/workflows/ci.yml/badge.svg)](https://github.com/XiaoQiangSHI/research-roadmaps/actions/workflows/ci.yml)
[![Deploy](https://github.com/XiaoQiangSHI/research-roadmaps/actions/workflows/deploy.yml/badge.svg)](https://github.com/XiaoQiangSHI/research-roadmaps/actions/workflows/deploy.yml)
[![License: Apache-2.0](https://img.shields.io/badge/code-Apache--2.0-blue.svg)](LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-lightgrey.svg)](datasets/LICENSE)

把一个研究领域中分散的论文，整理成可以追踪“时间、问题与解决方案演进”的交互式路线图。

**在线访问：<https://xiaoqiangshi.github.io/research-roadmaps/>**

## 我为什么做这个项目

传统论文列表能回答“有哪些工作”，但很难回答：

- 这个领域长期在解决哪些核心问题？
- 不同工作之间是继承、替代，还是并行发展？
- 一条技术路线经历了哪些关键阶段？
- 每篇论文由哪些机构完成，有没有中文详解？

这个项目将论文事实与路线判断分开记录，再用统一渲染器生成可搜索、可筛选、可点击的时间轴。点击论文后，可以查看主要工作、待解决问题、核心方案、机构、归类依据以及论文、代码、项目主页和中文博客链接。

## 当前路线图

| 路线图 | 类型 | 内容 |
| --- | --- | --- |
| [具身智能论文发展路线图](https://xiaoqiangshi.github.io/research-roadmaps/roadmaps/embodied-ai/) | 完整领域 | 60 篇论文、7 条发展线路、31 家机构 |

## 这个项目与普通论文列表的区别

- **按问题组织**：每条线路先说明持续问题，再展示方案如何演进。
- **事实与观点分层**：日期、机构、链接必须有来源；路线归属必须写明理由和置信度。
- **数据驱动**：路线图存为 YAML，同一套页面可以渲染不同研究领域。
- **可审查**：每一篇论文、每一次归类和每一个机构都能通过 Pull Request 讨论修订。
- **可复用**：专题视图引用已有领域数据，不重复维护论文事实。
- **面向阅读**：支持搜索、路线筛选、机构标识、论文详情和中文博客入口。

## 如何参与

不需要会写代码也可以参与。

### 1. 推荐论文或纠正信息

优先使用在线的 [论文贡献向导](https://xiaoqiangshi.github.io/research-roadmaps/contribute/)：填写表单后会实时校验、生成 YAML，并跳转到 GitHub 创建 Pull Request，不需要本地安装环境或手写数据文件。

也可以在 [Issues](https://github.com/XiaoQiangSHI/research-roadmaps/issues/new/choose) 中选择对应模板：

- **推荐论文**：提供论文链接，并说明它解决了什么问题。
- **数据纠错**：报告日期、机构、链接、摘要或路线归属问题。
- **提议新领域**：说明领域边界、建议线路和可持续维护的数据来源。

### 2. 直接修改数据

小修改可以直接编辑 `datasets/` 中对应的 YAML；新增完整领域时复制 `datasets/_template/`。每篇论文至少需要：

- 可靠的论文来源；
- 原创的主要工作、问题和解决方案概括；
- 主导机构及必要的合作机构；
- 一条主线路、归类理由和置信度。

提交前请阅读 [贡献指南](CONTRIBUTING.md)，并发起 Pull Request。CI 会自动检查 Schema、引用完整性、测试和生产构建。

### 3. 成为领域维护者

如果你长期关注某个领域，可以在新领域提案中申请成为维护者。领域维护者负责核对事实来源、审查路线边界、处理归类争议并持续更新数据，具体职责见 [治理规则](GOVERNANCE.md)。

## 收录原则

路线图追求“解释研究演进”，不是尽可能收录所有论文。

通常收录满足以下至少一项的工作：

- 提出新的问题定义、任务设定或评测方式；
- 引入后来被持续使用的重要方法；
- 显著推进规模、泛化、效率或真实部署；
- 连接原本独立的两条研究线路；
- 对后续工作产生可验证的代表性影响。

不因为机构知名、论文热度或是否有开源代码而自动收录。论文的路线位置是编辑判断，不代表对工作质量进行排名。

## 数据结构

```text
datasets/<domain>/
├─ roadmap.yaml       # 领域边界、路线、持续问题与演进阶段
├─ papers.yaml        # 论文事实、原创概括、链接与归类依据
├─ papers/*.yaml      # 贡献向导生成的单篇论文文件
├─ institutions.yaml  # 机构名称、类型、网站与离线徽标
└─ references.yaml    # 领域级来源、筛选规则与排除标准
```

`schemas/` 定义 JSON Schema，`scripts/validate-data.mjs` 继续检查重复论文、无效路线、无效机构和来源完整性。

完整领域使用 `kind: full`；专题使用 `kind: view` 引用现有领域中的若干线路，因此不会复制论文事实。

## 本地开发

需要 Node.js 22 或更高版本。

```bash
git clone https://github.com/XiaoQiangSHI/research-roadmaps.git
cd research-roadmaps
npm install
npm run dev
```

提交前运行：

```bash
npm run check
npm run validate
npm test
npm run build
npm run test:e2e
npm run check:links
```

`check:links` 会访问外部论文来源，适合在网络可用时运行。构建后请使用 `npm run preview` 预览，不要直接双击 `dist/index.html`。

## 项目治理

- 项目发起人与总维护者：[@XiaoQiangSHI](https://github.com/XiaoQiangSHI)
- 每个领域在 `roadmap.yaml` 的 `editorial.maintainers` 中声明维护者。
- 数据修改至少需要一位相关领域维护者审核，并通过 CI 后才能合并。
- 事实争议以一手来源为准；路线争议优先保留可解释性，并在归类理由中记录判断依据。

完整决策方式见 [GOVERNANCE.md](GOVERNANCE.md)。

## 技术栈

Astro、TypeScript、YAML、JSON Schema、Ajv、Node Test、Playwright 和 GitHub Pages。站点是纯静态生成，不需要数据库或后端服务。

## 许可证与引用

- 源代码使用 [Apache License 2.0](LICENSE)。
- `datasets/` 中的原创路线数据与编辑内容使用 [CC BY 4.0](datasets/LICENSE)。
- 论文、商标和 Logo 的权利归原始权利人所有，本项目仅作引用和机构识别。
- 使用或改编路线数据时，请注明项目名称、仓库链接，并标记你的修改。

如果这个项目帮助了你的研究或学习，欢迎 Star、分享、提交论文或共同维护一个新领域。
