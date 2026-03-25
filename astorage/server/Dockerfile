FROM node:24

WORKDIR /

# Copy all package.json files (better caching)
COPY ./ts-shared/package*.json ./ts-shared/

# Install dependencies
WORKDIR /ts-shared
RUN npm install
COPY ./ts-shared ./
RUN npm run build

RUN apt-get update && \
    apt-get install -y clamav clamav-daemon netcat-openbsd && \
    freshclam && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create necessary directories and set permissions
RUN mkdir -p /var/run/clamav /var/log/clamav && \
    chown -R clamav:clamav /var/run/clamav /var/log/clamav && \
    chmod 755 /var/run/clamav

COPY ./astorage/server/clamd.conf /etc/clamav/
COPY ./astorage/server/freshclam.conf /etc/clamav/

WORKDIR /app/server

COPY ./astorage/server/package.json ./
COPY ./astorage/server/package-lock.json ./
RUN npm install

COPY ./astorage/server ./
RUN npm run build
RUN mkdir -p ./data

EXPOSE 3001 3310

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
