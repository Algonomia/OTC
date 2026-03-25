# ODD

## Prerequired
You can skip this part if you already have `docker` in your machine.
 
1) Set up Docker's apt repository.
```bash
# Add Docker's official GPG key:
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
```

2) Install the [Docker](https://docs.docker.com/engine/install/ubuntu/) packages.
```bash
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## Get Started
On different terminal you will need to launch.\
For more information on about the available options please use:
```bash
./build.sh -h
```

### Dependencies and services
To install all dependencies and starts all services (database, file, OCR and scraper)
```bash
./build.sh -s
```
---
If you're only working on the frontend, you can use the following command and simply run the [frontend](#run-the-frontend)
```bash
./build.sh
```
> By changing branches you may have to rerun the [installation](#run-the-project) to get the new dependencies.\
> And [reset](./otc/orm/readme.md#reset-database) and [refeed](./otc/orm/readme.md#feed-database) your database.

### Run the frontend
To launch the frontend ([click here](otc/front/README.md) for more information)
```bash
cd front
npm start
```

### Run the backend
To launch the backend ([click here](otc/back/README.md) for more information)
```bash
cd back
npm start
```


The project is reachable via http://localhost:4200
> NOTE: The `./build.sh` script will install all dependencies and build all needed images.\
> If you already have all build up-to-date you can directly start the docker compose.
>```bash
>docker compose up -f docker-compose/docker-compose.yaml up
>```