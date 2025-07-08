#!/bin/bash

# Development iOS script - ensures Metro bundler is running before iOS build
set -e

echo "🚀 Starting Alorian Saddlery iOS Development Setup..."

# Function to check if Metro is running
check_metro() {
    if lsof -i :8081 >/dev/null 2>&1; then
        echo "✅ Metro bundler is already running on port 8081"
        return 0
    else
        echo "❌ Metro bundler is not running"
        return 1
    fi
}

# Function to start Metro bundler
start_metro() {
    echo "🏃 Starting Metro bundler..."
    
    # Clear any existing Metro cache
    npx expo start --clear --dev-client &
    METRO_PID=$!
    
    echo "⏳ Waiting for Metro bundler to start..."
    
    # Wait up to 30 seconds for Metro to be ready
    for i in {1..30}; do
        if lsof -i :8081 >/dev/null 2>&1; then
            echo "✅ Metro bundler is ready!"
            return 0
        fi
        sleep 1
        echo "   ... waiting ($i/30)"
    done
    
    echo "❌ Metro bundler failed to start within 30 seconds"
    return 1
}

# Function to kill Metro if needed
kill_metro() {
    if lsof -i :8081 >/dev/null 2>&1; then
        echo "🛑 Killing existing Metro process..."
        lsof -ti :8081 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Check if --reset flag is provided
if [[ "$1" == "--reset" ]]; then
    echo "🔄 Resetting Metro bundler..."
    kill_metro
    rm -rf ios/main.jsbundle ios/assets 2>/dev/null || true
    echo "✅ Reset complete"
fi

# Check if Metro is running, if not start it
if ! check_metro; then
    # Kill any stuck Metro processes
    kill_metro
    
    # Start Metro bundler
    if ! start_metro; then
        echo "❌ Failed to start Metro bundler"
        exit 1
    fi
fi

# Now run the iOS app
echo "📱 Launching iOS app..."
expo run:ios

echo "🎉 iOS development setup complete!" 