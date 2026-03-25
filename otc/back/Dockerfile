# Stage 1, based on Node.js, to build and launch the backend
FROM node:20-alpine AS builder

WORKDIR /

# Copy all package.json files (better caching)
COPY ./ts-shared/package*.json ./ts-shared/
COPY ./otc/domain/package*.json ./otc/domain/
COPY ./otc/orm/package*.json ./otc/orm/
COPY ./astorage/ts-client/package*.json ./astorage/ts-client/
COPY ./otc/back/package*.json ./otc/back/

# Install dependencies
WORKDIR /ts-shared
RUN npm install

WORKDIR /otc/domain
RUN npm install

WORKDIR /astorage/ts-client
RUN npm install

WORKDIR /otc/orm
RUN npm install

WORKDIR /otc/back
RUN npm install

# Copy source code and build
WORKDIR /ts-shared
COPY ./ts-shared ./
RUN npm run build

WORKDIR /otc/domain
COPY ./otc/domain ./
RUN npm run build

WORKDIR /astorage/ts-client
COPY ./astorage/ts-client ./
RUN npm run build

WORKDIR /otc/orm
COPY ./otc/orm ./

WORKDIR /otc/back
COPY ./otc/back ./
RUN npm run build
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "-r", "./dist/telemetry/tracing.js", "dist/main.js"]
