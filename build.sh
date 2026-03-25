usage() {
    echo "Requirements:"
    echo "    - Docker"
    echo "    - Docker Compose"
    echo "    - NodeJS >= v18"
    echo
    echo "Usage:"
    echo "    sh $0 [OPTIONS]..."
    echo
    echo "Options:"
    echo "    -h, --help         Show this help message"
    echo "    -s, --service      Build and launch all services (microservices, database)"
    echo "    -b, --back         Build and launch the back project (default)"
    echo "    -i, --install      Install all projects dependencies"
    echo
    echo "Examples:"
    echo "    sh $0"
    echo "    sh $0 -i"
    echo
    exit 1
}

build_shared() {
    set -e  # Exit immediately on error
    echo "Installing dependencies in ./ts-shared"
    cd ts-shared
    npm install
    npm run build
    cd -
}

build_otc_domain() {
    set -e  # Exit immediately on error
    echo "Installing dependencies in ./otc/domain"
    cd otc/domain
    npm install
    npm run build
    cd -
}

build_angular_sdk() {
    set -e  # Exit immediately on error
    echo "Building ./angular-sdk"
    cd angular-sdk
    npm install
    npm run build
    cd -
}

install_front() {
    set -e  # Exit immediately on error
    echo "Installing dependencies in ./otc/front"
    cd otc/front
    npm install
    npm run clear:angular
    cd -
}

install_back() {
    set -e  # Exit immediately on error
    echo "Installing dependencies in ./otc/back"
    cd otc/back
    npm install
    cd -
}

install_astorage() {
    set -e  # Exit immediately on error
    echo "Installing dependencies in ./astorage/ts-client"
    cd astorage/ts-client
    npm install
    npm run build
    cd -
    echo "Installing dependencies in ./astorage/server"
    cd astorage/server
    npm install
    cd -
}

build_front() {
    echo "Building front project"
    docker build -t tax-calendar:latest -f otc/front/Dockerfile --build-arg BUILD_ENV=development .
}

build_back() {
    echo "Building back project"
    docker build -t tax-calendar-back:latest -f otc/back/Dockerfile .
}

build_astorage() {
    echo "Building astorage project"
    docker build -t astorage:latest -f astorage/server/Dockerfile .
}

launch() {
    build_shared
    build_otc_domain
    build_angular_sdk
    build_astorage
    echo "Launching project services"
    docker compose -f docker-compose/docker-compose.yaml up
    exit 0
}

launch_back() {
    build_shared
    build_otc_domain;
    build_angular_sdk
    install_front
    build_back
    build_astorage
    echo "Launching the back project"
    docker compose -f docker-compose/docker-compose.back.no_registry.yaml up
    exit 0
}

install() {
    echo "Starting full build process..."
    build_shared
    build_otc_domain
    build_angular_sdk
    install_front
    install_back
    install_astorage
    echo "✅ Full build completed successfully."
    exit 0
}

if [ $# -eq 0 ]; then
    echo "No arguments provided. Launching back project by default. Use -h or --help for help."
    launch_back
fi

while [ $# -gt 0 ]; do
    case "$1" in
        -h | --help) usage ;;
        -s | --service) launch ;;
        -b | --back) launch_back ;;
        -i | --install) install ;;
        *) echo "Unknown option: $1"; usage ;;
    esac
    shift
done
