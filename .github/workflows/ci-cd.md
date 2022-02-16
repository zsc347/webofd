# CICD 流程设计

目标是开发过程尽可能的简单

## 持续集成

由于目前单人在 dev 分支上开发，所以只对 dev 分支添加了 ci 触发。

```
on:
    push:
        branches:
            - dev
```

当有 commit 推送到 dev 分支时，自动触发后续流程。

如果是多人开发，应该在本地完成基本的测试功能，然后以 PR 的方式 merge 到 dev 分支。

然后由 dev 的 push 事件触发 CI 流程，并只在通过时接受代码。

```
    build:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout
              uses: actions/checkout@v2
            - name: Set up environment
              uses: actions/setup-node@v2
              with:
                  node-version: "16"
            - name: Install dependency
              run: |
                  npm install
                  npm test --coverage
                  npm run build
```

## 持续部署

webofd 是一个纯前端项目，因此直接使用 github pages 作为持续部署的环境。

如果需要一个稳定的应用环境，应当自建 site.
