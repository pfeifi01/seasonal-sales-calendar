# The reminder job needs the dataset with every date already resolved, and
# that comes from the TypeScript engine in the frontend -- so the image is
# built in two stages: node generates data/events.json, then the runtime
# stage copies it in alongside the server. This is what keeps the date rules
# from being reimplemented (and drifting) in a second language.
FROM node:20-alpine AS data
WORKDIR /repo
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY scripts ./scripts
COPY src ./src
RUN npm run export:events

FROM node:20-alpine
WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ ./
COPY --from=data /repo/backend/catalog/events.json ./catalog/events.json

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["node", "server.js"]
