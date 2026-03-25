# Stage 1, based on Node.js, to build the Angular app
FROM node:24 AS node

# Install dependencies and build the ts-shared library
WORKDIR /ts-shared
COPY ./ts-shared/package*.json ./
RUN npm install
COPY ./ts-shared ./
RUN npm run build

# Install dependencies and build the otc/domain library
WORKDIR /otc/domain
COPY ./otc/domain/package*.json ./
RUN npm install
COPY ./otc/domain ./
RUN npm run build

# Install dependencies and build the angular-sdk library
WORKDIR /angular-sdk
COPY ./angular-sdk/package*.json ./
RUN npm install
COPY ./angular-sdk ./
RUN npm run build

# Install dependencies, build and compile Angular
WORKDIR /otc/front
COPY ./otc/front/package*.json ./
RUN npm install
COPY ./otc/front ./
ARG BUILD_ENV=production
ARG BASE_HREF="/"
RUN npm run build -- --configuration=$BUILD_ENV --base-href=$BASE_HREF

# Stage 2, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.27-alpine
COPY --from=node /otc/front/dist/obligation-due-dates/browser /usr/share/nginx/html
RUN chmod -R a+r /usr/share/nginx/html
COPY ./otc/front/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./otc/front/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
