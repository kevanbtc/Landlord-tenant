#!/bin/bash

# Digital Giant L1 Network Setup Script

set -e

echo "🚀 Setting up Digital Giant L1 Blockchain Network"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi

    # Check Go
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed. Please install Go 1.19+ first."
        exit 1
    fi

    # Check Java
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed. Please install Java 11+ first."
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."

    # Build Besu
    if [ -d "besu-fork" ]; then
        cd besu-fork
        print_status "Building Besu..."
        ./gradlew dockerBuild -x test
        cd ..
    fi

    # Build Chainlink
    if [ -d "chainlink" ]; then
        cd chainlink
        print_status "Building Chainlink..."
        go mod download
        make docker-build
        cd ..
    fi

    # Build BlockScout
    if [ -d "blockscout-fork" ]; then
        cd blockscout-fork
        print_status "Building BlockScout..."
        docker build -t blockscout .
        cd ..
    fi

    # Build The Graph
    if [ -d "graph-node-fork" ]; then
        cd graph-node-fork
        print_status "Building The Graph..."
        cargo build --release
        docker build -t graph-node .
        cd ..
    fi

    # Build Orion
    if [ -d "orion-fork" ]; then
        cd orion-fork
        print_status "Building Orion..."
        ./gradlew build -x test
        docker build -t orion .
        cd ..
    fi

    # Build Remix
    if [ -d "remix-fork" ]; then
        cd remix-fork
        print_status "Building Remix..."
        npm install
        npm run build
        docker build -t remix .
        cd ..
    fi

    print_success "Docker images built successfully"
}

# Start the network
start_network() {
    print_status "Starting Digital Giant L1 network..."

    # Create necessary directories
    mkdir -p configs/besu configs/orion configs/chainlink configs/prometheus

    # Start services
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d
    else
        docker compose up -d
    fi

    print_success "Network started successfully"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."

    # Wait for services to be ready
    sleep 30

    # Setup Grafana dashboards
    print_status "Grafana will be available at http://localhost:3000 (admin/admin)"

    print_success "Monitoring setup complete"
}

# Display access information
display_info() {
    echo ""
    echo "🎉 Digital Giant L1 Network is running!"
    echo ""
    echo "Access URLs:"
    echo "  - Besu RPC: http://localhost:8545"
    echo "  - Besu WebSocket: ws://localhost:8546"
    echo "  - Chainlink: http://localhost:6688"
    echo "  - BlockScout: http://localhost:4000"
    echo "  - The Graph: http://localhost:8000"
    echo "  - Remix IDE: http://localhost:8080"
    echo "  - Prometheus: http://localhost:9090"
    echo "  - Grafana: http://localhost:3000 (admin/admin)"
    echo ""
    echo "Network Information:"
    echo "  - Chain ID: 2023"
    echo "  - Consensus: QBFT"
    echo "  - Privacy: Orion enabled"
    echo ""
    echo "Next steps:"
    echo "  1. Access Remix IDE to deploy smart contracts"
    echo "  2. Use BlockScout to explore the blockchain"
    echo "  3. Configure Chainlink for oracle services"
    echo "  4. Setup The Graph for data indexing"
    echo ""
}

# Main execution
main() {
    echo "Digital Giant L1 Blockchain Setup"
    echo "=================================="

    check_prerequisites
    build_images
    start_network
    setup_monitoring
    display_info

    print_success "Setup complete! Your Digital Giant L1 blockchain is ready."
}

# Run main function
main "$@"
