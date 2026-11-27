# Purpose: the tests' runner image: Playwright's browsers and Node, with Vitest and @playwright/test installed at / once, never at a run
FROM mcr.microsoft.com/playwright:v1.65.1-noble
ENV CI=1
COPY toolchain/package.json toolchain/package-lock.json /
RUN cd / && npm ci --no-audit --no-fund --ignore-scripts && rm -rf /root/.npm
