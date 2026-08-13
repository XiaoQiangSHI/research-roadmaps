# 贡献指南

## 新增一个领域

1. 复制 `datasets/_template`，把目录名改成小写连字符格式。
2. 在 `roadmap.yaml` 定义领域边界、时间范围和发展线路。
3. 在 `papers.yaml` 添加论文事实、原创总结、主线路、归类理由和来源。
4. 在 `institutions.yaml` 添加论文使用到的机构。
5. 在 `editorial.maintainers` 列出负责路线判断的领域维护者。
6. 运行 `npm run check`、`npm run validate`、`npm test` 和 `npm run build`。

## 编辑原则

- 论文日期、机构、链接属于事实层，必须提供可靠来源。
- 路线和阶段属于编辑层，必须填写 `classification.rationale`。
- 每篇论文选择一条主线路，可用 `relatedTracks` 表示次要联系。
- 机构使用论文作者单位或官方项目维护方；不要把高校合作论文简单标成公司工作。
- 摘要、问题和解决方案必须原创概括，避免复制论文摘要。

## 审核标准

维护者会检查事实来源、路线边界、是否存在重复论文、是否遗漏联合机构，以及页面是否在桌面和移动端正常显示。

涉及 `datasets/<domain>/` 的 Pull Request 应由该领域 `roadmap.yaml` 中至少一位维护者审核。仓库启用分支保护后，将“至少 1 个批准”和 CI 通过设为合并条件；若维护者已有稳定 GitHub 用户名或团队，再把对应路径写入 `.github/CODEOWNERS`，GitHub 就会自动请求审核。
