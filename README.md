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
- 每篇论文由哪些机构完成，有哪些社区讲解？

这个项目将论文事实与路线判断分开记录，再用统一渲染器生成可搜索、可筛选、可点击的时间轴。点击论文后，可以查看主要工作、待解决问题、核心方案、机构、归类依据以及论文、代码、项目主页和多条社区讲解链接。

## 当前路线图

项目当前包含 15 个研究领域。具身智能与 3D AIGC 已经有首批论文和技术文章并持续维护，其余领域先开放路线骨架并接受社区贡献；“0 篇论文”是明确支持的共建状态，不表示该领域没有研究工作。

领域按三层组织，而不是假设它们互斥：

- **任务与研究对象**：自然语言处理、计算机视觉、语音与音频、多模态、机器人学、3D AIGC；
- **方法与系统**：大语言模型、生成模型、强化学习、图机器学习、AI 智能体、机器学习系统；
- **横向与应用领域**：可信人工智能、具身智能、AI for Science。

同一篇论文只选择一个主领域保存事实记录，跨领域关系写入归类依据，CI 会阻止相同 arXiv 在不同领域重复收录。

| 状态 | 领域 |
| --- | --- |
| 持续维护 | [具身智能](https://xiaoqiangshi.github.io/research-roadmaps/roadmaps/embodied-ai/)（60 篇论文、7 条发展线路） |
| 持续维护 | [3D AIGC](https://xiaoqiangshi.github.io/research-roadmaps/roadmaps/3d-aigc/)（26 篇论文 / 技术文章、6 条发展线路；讲解来自作者博客的 3D-AIGC 分类） |
| 待社区共建 | 大语言模型、自然语言处理、计算机视觉、多模态人工智能、生成模型、强化学习、AI 智能体、语音与音频智能、图机器学习、机器学习系统、可信人工智能、AI for Science、机器人学 |

每个领域页面都提供“贡献论文”按钮，并自动预选当前领域；贡献者选择合适的路线后，网页向导会生成对应的提交文件和路径。

## 这个项目与普通论文列表的区别

- **按问题组织**：每条线路先说明持续问题，再展示方案如何演进。
- **事实与观点分层**：日期、机构、链接必须有来源；路线归属必须写明理由和置信度。
- **数据驱动**：路线图存为 YAML，同一套页面可以渲染不同研究领域。
- **可审查**：每一篇论文、每一次归类和每一个机构都能通过 Pull Request 讨论修订。
- **可复用**：专题视图引用已有领域数据，不重复维护论文事实。
- **面向阅读**：支持搜索、路线筛选、机构标识、论文详情和多条社区讲解链接。

## 如何参与

不需要会写代码也可以参与。先根据你想做的事情选择入口：

| 你想做什么 | 推荐入口 |
| --- | --- |
| 新增一篇论文 | 从对应领域页面点击“贡献论文”，或打开[论文贡献向导](https://xiaoqiangshi.github.io/research-roadmaps/contribute/) |
| 为已有论文补充讲解 | 从论文详情点击“贡献讲解”，或打开[讲解贡献向导](https://xiaoqiangshi.github.io/research-roadmaps/contribute/explanation/) |
| 纠正日期、机构、链接或文字 | 创建[数据纠错 Issue](https://github.com/XiaoQiangSHI/research-roadmaps/issues/new?template=correction.yml) |
| 不确定论文属于哪个领域或路线 | 创建[论文推荐 Issue](https://github.com/XiaoQiangSHI/research-roadmaps/issues/new?template=paper.yml) |
| 提议一个新研究领域 | 创建[新领域提案](https://github.com/XiaoQiangSHI/research-roadmaps/issues/new?template=domain.yml) |
| 修改页面、数据或工具代码 | Fork 仓库并提交 Pull Request，具体要求见[贡献指南](CONTRIBUTING.md) |

### 使用网页向导提交

论文和讲解向导会实时校验内容并生成 YAML，不需要本地安装环境，也不需要手写数据文件。填写完成后：

1. 点击“在 GitHub 提交”，登录 GitHub 后进入新文件页面；
2. 点击 **Propose changes** 保存到自己的分支或 Fork；
3. 按 GitHub 提示点击 **Create pull request**，等待 CI 与维护者审核。

如果只想推荐一篇论文、暂时无法填写完整资料，使用 Issue 即可，不必创建 Pull Request。

### 直接修改数据或代码

先 Fork 仓库，再修改 `datasets/`、页面或工具代码，最后向本仓库的 `main` 分支发起 Pull Request。论文内容至少需要可靠来源、原创概括、机构信息、主线路和归类理由。提交前请阅读[贡献指南](CONTRIBUTING.md)；CI 会自动检查数据格式、引用完整性、测试和生产构建。

### 成为领域维护者

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
├─ roadmap.yaml       # 领域层级、收录边界、相邻领域、路线与演进阶段
├─ papers.yaml        # 可选；聚合的论文事实、原创概括、链接与归类依据
├─ papers/*.yaml      # 贡献向导生成的单篇论文文件
├─ explanations/<paper-id>/*.yaml  # 社区为已有论文独立追加的讲解链接
├─ institutions.yaml  # 可选；领域专属机构，会覆盖同 ID 的共享机构
└─ references.yaml    # 领域级来源、筛选规则与排除标准

datasets/_shared/institutions.yaml  # 各领域共用的机构名称与徽标
```

同一篇论文可以包含多条讲解链接。新增论文时可以一次添加多条；论文已经收录后，可从详情弹窗点击“贡献讲解”，为它提交一个独立的小文件，不需要修改原论文记录。

`schemas/` 定义 JSON Schema，`scripts/validate-data.mjs` 继续检查重复论文、无效路线、无效机构和来源完整性。

完整领域使用 `kind: full`；专题使用 `kind: view` 引用现有领域中的若干线路，因此不会复制论文事实。

## 项目治理

- 项目发起人与总维护者：[@XiaoQiangSHI](https://github.com/XiaoQiangSHI)
- 每个领域在 `roadmap.yaml` 的 `editorial.maintainers` 中声明维护者。
- 数据修改至少需要一位相关领域维护者审核，并通过 CI 后才能合并。
- 事实争议以一手来源为准；路线争议优先保留可解释性，并在归类理由中记录判断依据。

完整决策方式见 [GOVERNANCE.md](GOVERNANCE.md)。

## 许可证与引用

- 源代码使用 [Apache License 2.0](LICENSE)。
- `datasets/` 中的原创路线数据与编辑内容使用 [CC BY 4.0](datasets/LICENSE)。
- 论文、商标和 Logo 的权利归原始权利人所有，本项目仅作引用和机构识别。
- 使用或改编路线数据时，请注明项目名称、仓库链接，并标记你的修改。

如果这个项目帮助了你的研究或学习，欢迎 Star、分享、提交论文或共同维护一个新领域。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=XiaoQiangSHI/research-roadmaps&type=Date)](https://www.star-history.com/#XiaoQiangSHI/research-roadmaps&Date)
