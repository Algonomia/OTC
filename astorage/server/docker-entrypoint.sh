#!/bin/bash
set -e

echo "Starting ClamAV daemon..."

# Run freshclam as daemon: auto-updates virus definitions every 2h and notifies clamd
su -s /bin/sh clamav -c "freshclam --config-file=/etc/clamav/freshclam.conf --daemon" &

# Start ClamAV daemon in background
clamd &

# Wait for ClamAV daemon to be ready
echo "Waiting for ClamAV daemon to start..."
timeout=60
counter=0
until nc -z 127.0.0.1 3310; do 
    sleep 1
    counter=$((counter + 1))
    if [ $counter -ge $timeout ]; then
        echo "ERROR: ClamAV daemon failed to start within $timeout seconds"
        exit 1
    fi
done

echo "ClamAV daemon is ready!"

# Execute the main command
exec "$@"