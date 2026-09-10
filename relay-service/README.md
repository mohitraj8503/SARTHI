# Standalone Live Streaming Relay Service

This service relays raw WebM stream chunks sent from the teacher's browser over a WebSocket connection to the YouTube RTMP ingestion endpoint using `ffmpeg`.

## Prerequisites

Ensure `ffmpeg` is installed on the VPS:
```bash
sudo apt update
sudo apt install ffmpeg -y
```

## Running with PM2 (Recommended)

1. Install PM2 globally if not already installed:
   ```bash
   sudo npm install pm2 -g
   ```

2. Start the relay service:
   ```bash
   pm2 start server.js --name "sarthi-live-relay" --env RELAY_PORT=5001
   ```

3. Ensure it starts on system boot:
   ```bash
   pm2 startup
   pm2 save
   ```

## Running with Systemd

1. Create a service file: `/etc/systemd/system/sarthi-live-relay.service`
   ```ini
   [Unit]
   Description=SARTHI Live Ingest Relay Service
   After=network.target

   [Service]
   Type=simple
   User=mohit8503
   WorkingDirectory=/home/mohit8503/Documents/sarthi-main/relay-service
   Environment=RELAY_PORT=5001
   ExecStart=/usr/bin/node server.js
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

2. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable sarthi-live-relay
   sudo systemctl start sarthi-live-relay
   ```
