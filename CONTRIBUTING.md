# 贡献指南

感谢你帮助完善 Open Research Roadmaps。本项目既接受代码贡献，也接受论文推荐、事实纠错、路线讨论和新领域维护。

## 选择贡献方式

| 你想做什么 | 推荐方式 |
| --- | --- |
| 推荐一篇论文 | 从对应领域页点击“贡献论文”，或使用[网页贡献向导](https://xiaoqiangshi.github.io/research-roadmaps/contribute/) |
| 为已有论文补充讲解 | 从论文详情点击“贡献讲解”，只提交讲解标题与链接 |
| 修正机构、日期、链接或文字 | 使用“数据纠错”Issue，或直接提交 PR |
| 调整论文路线归属 | 提交 Issue 讨论，或在 PR 中给出明确理由 |
| 新建一个研究领域 | 先使用“新领域提案”Issue 对齐范围，再提交数据 |
| 改进页面、Schema 或工具 | 直接提交 PR，并说明行为变化 |

Issue 入口：<https://github.com/XiaoQiangSHI/research-roadmaps/issues/new/choose>

网页贡献向导：<https://xiaoqiangshi.github.io/research-roadmaps/contribute/>

网页向导会根据当前选择的领域，把每篇新论文保存为 `datasets/<domain>/papers/<paper-id>.yaml`。这种独立文件与领域原有的 `papers.yaml` 同时加载，减少合并冲突，也方便单独审核和回退。每个领域页面都有带领域参数的入口，优先从那里开始贡献。

## 开始之前

1. 搜索已有 Issues 和 Pull Requests，避免重复工作。
2. 小型事实修正可以直接提交 PR。
3. 新领域、删除线路或大范围重新归类，应先开 Issue 讨论。
4. 不要在一个 PR 中混合无关领域或同时做大规模页面重构。

## 本地开发流程

1. Fork 仓库并克隆自己的 Fork。
2. 从最新 `main` 创建分支。
3. 修改数据或代码并执行验证。
4. 推送分支，向本仓库的 `main` 发起 Pull Request。

```bash
git clone https://github.com/<your-id>/research-roadmaps.git
cd research-roadmaps
git switch -c data/add-example-paper
npm install
```

推荐分支名：

- `data/add-<paper>`
- `data/fix-<topic>`
- `domain/add-<domain>`
- `feat/<feature>`
- `fix/<bug>`

## 推荐或新增论文

### 先选择主领域

领域之间允许交叉，但同一篇论文只在一个主领域保存一份事实记录，不要复制到多个 `datasets/<domain>/` 目录。选择主领域时依次判断：

1. 论文首先在解决什么研究对象或长期问题；
2. 论文最核心、最可复用的新贡献是什么；
3. 主要实验和结论由哪类指标验证。

每个领域页面都列出“收录”“不收录”和“相邻领域”。如果论文同时涉及多个方向，选择最能解释核心贡献的主领域，并在归类理由中记录交叉关系。CI 会检查跨领域重复 arXiv 编号。

### 收录判断

一篇论文不需要“足够热门”，但应当有助于解释路线演进。请至少回答：

1. 它在解决什么长期问题？
2. 它相对已有工作改变了什么？
3. 它为什么属于当前主线路？

新增论文写入对应领域的 `papers.yaml`。格式参考 `datasets/_template/papers.yaml`。

```yaml
- id: example-paper
  title: Example Paper
  date: 2024-01-01
  arxiv: "2401.00001"
  track: example-track
  relatedTracks:
    - another-track
  summary: 用自己的语言概括论文主要工作。
  problem: 说明具体问题及其重要性。
  solution: 说明核心机制，而不是只列模型名称。
  institutions:
    primary:
      - example-university
    collaborators:
      - example-company
  links:
    paper: https://arxiv.org/abs/2401.00001
    project: https://example.org/project
    code: https://github.com/example/project
    explanations:
      - title: Example Author · 论文深入讲解
        url: https://example.org/explanation
  classification:
    confidence: high
    rationale: 解释这篇论文的主要贡献为什么属于该线路。
  sources:
    - type: paper
      url: https://arxiv.org/abs/2401.00001
    - type: explanation
      url: https://example.org/explanation
```

### 字段要求

- `id`：领域内唯一，小写连字符格式，后续不要随意修改。
- `date`：优先使用论文首次公开日期，采用 `YYYY-MM-DD`。
- `arxiv`：只填编号，不带版本号；没有 arXiv 时请先开 Issue 讨论标识方式。
- `track`：一条主线路，代表论文最核心的贡献。
- `relatedTracks`：可选，只表达重要的次要关联。
- `summary`：这项工作做了什么。
- `problem`：它具体要解决什么困难。
- `solution`：它通过什么关键机制解决。
- `institutions.primary`：论文主要完成机构，可以有多个。
- `institutions.collaborators`：其他明确参与机构，可选。
- `links.explanations`：可选列表，每条包含显示标题和 URL；标题建议标明作者或网站，链接应公开、稳定并包含实质性论文解释。
- `classification.rationale`：路线归属的可审查依据，不能只写“与该路线相关”。

### 置信度

- `high`：论文核心问题和方案与该线路直接一致。
- `medium`：涉及多条线路，但主贡献仍能明确判断。
- `low`：暂时归入最接近的线路，欢迎进一步讨论。
- `editorial`：迁移数据或维护者编辑判断，后续应尽量补充更明确的置信度。

## 机构归属规则

机构必须依据论文作者单位、论文正文、项目主页或官方仓库判断。

- 联合工作应保留联合机构，不把高校合作论文笼统归为某家公司。
- `primary` 表示主要完成机构，不等于“第一作者单位”。
- 公司提供资金、硬件或 API 不自动构成论文完成机构。
- Logo 只用于识别；优先复用 `src/lib/brand-icons.ts` 已有品牌图标，否则使用文字徽标。
- 通用机构优先加入 `datasets/_shared/institutions.yaml`；只有领域专属机构才加入对应领域的 `institutions.yaml`，然后在论文中引用其 `id`。

若机构归属存在歧义，请在 PR 中附论文作者列表或官方页面，并明确说明判断过程。

## 为已有论文贡献讲解

论文详情弹窗中的“贡献讲解”会打开轻量向导，并生成：

```text
datasets/<domain>/explanations/<paper-id>/<explanation-id>.yaml
```

每条讲解独立保存，因此不同贡献者可以并行追加链接而不修改原论文文件。讲解需要满足：

- 链接公开可访问，并实际解释论文方法、问题或实验；
- 标题能区分作者或来源，例如“作者名 · 文章标题”；
- 不重复已有 URL，不收录只有摘要搬运、广告或无实质内容的页面；
- 讲解内容的观点属于原作者，本项目只做索引，不代表维护者背书。

## 新增完整领域

新领域应先创建提案 Issue，说明：

- 所属层级：任务与研究对象、方法与系统，或横向与应用领域；
- 领域收录范围、不收录范围和相邻领域；
- 建议的 3–8 条主线路；
- 每条线路持续解决的问题；
- 初始代表论文及可靠来源；
- 至少一位愿意持续维护的领域维护者。

提案达成共识后：

1. 复制 `datasets/_template/` 为 `datasets/<domain-id>/`。
2. 在 `roadmap.yaml` 定义领域、时间范围、线路与演进阶段。
3. 可以暂时不添加论文；项目明确接受“路线骨架已建立、0 篇论文”的待共建领域。
4. 如有首批论文，可写入 `papers.yaml` 或 `papers/<paper-id>.yaml`；通用机构直接复用共享目录。
5. 在 `references.yaml` 记录筛选标准、排除标准和领域级来源。
6. 在 `editorial.maintainers` 填写 GitHub 用户名。

一个新领域不要求一开始就有论文，但应提供清晰的领域边界、至少 2 条可讨论的初始线路和持续问题。空领域页面会明确标记为“待社区共建”，路线划分可以随首批论文贡献继续修订。

## 新增专题视图

当现有完整领域已经包含所需论文时，使用 `kind: view`，不要复制论文数据：

```yaml
id: example-view
name: 示例专题
description: 说明该专题为什么值得单独查看。
kind: view
source: embodied-ai
includeTracks:
  - policy
  - world
editorial:
  note: 本视图引用源领域数据。
  maintainers:
    - your-github-id
```

## 编辑原则

- 论文日期、机构、链接属于事实层，必须提供可靠来源。
- 路线、阶段和问题演进属于编辑层，必须允许讨论与修订。
- 摘要、问题和解决方案必须原创概括，禁止复制大段论文摘要或博客内容。
- 使用中性、具体的语言，不使用“碾压”“革命性”等宣传性表述。
- 不用论文数量、机构声誉或主观影响力进行排名。
- 对争议判断保留不确定性，不为了路线整齐而隐藏交叉关系。

## 提交前检查

```bash
npm run check
npm run validate
npm test
npm run build
npm run test:e2e
npm run check:links
```

- `check`：Astro 与 TypeScript 检查。
- `validate`：Schema、重复 ID、路线和机构引用检查。
- `test`：数据回归测试。
- `build`：生产构建。
- `test:e2e`：桌面交互、专题视图和移动端布局测试。
- `check:links`：外部来源可访问性检查；网络不稳定时可在 PR 中说明。

## Pull Request 要求

PR 描述需要说明：

- 修改了什么；
- 影响哪个领域和线路；
- 事实信息来自哪里；
- 如有路线调整，为什么新归类更合理；
- 已执行哪些检查。

维护者可能要求拆分过大的 PR、补充一手来源、修改宣传性描述或进一步解释路线判断。这是数据审查的一部分，不代表否定论文或贡献者。

## 审核与合并

- 所有 PR 必须通过 CI。
- 数据 PR 至少需要一位相关领域维护者批准。
- 影响多个领域时，应邀请对应领域维护者共同审核。
- 事实争议优先采用论文、官方项目页和官方仓库等一手来源。
- 路线归属无法形成唯一答案时，由领域维护者记录理由，总维护者负责最终一致性决策。

维护者职责和争议处理见 [GOVERNANCE.md](GOVERNANCE.md)。

## 版权

提交代码即表示你同意代码按 Apache-2.0 发布；提交到 `datasets/` 的原创编辑内容即表示你同意其按 CC BY 4.0 发布。不要提交无权再分发的大段文本、图片或第三方 Logo 文件。
