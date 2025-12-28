#! /bin/bash

###########################################################
# This script downloads the files for the digital sign.   #
# It also sets the sign to run at startup with a service. #
# It downloads Bun if not already installed.              #
###########################################################

# Get authentication for sudo commands
echo "Requesting sudo permissions..."
echo "Enter your password if prompted."
sudo -v

# Download Bun if not already installed

if [ -f "$HOME/.bun/bin/bun" ]
then
    echo "Bun is already installed."
else
    echo "Bun not found, installing Bun..."
    curl -fsSL https://bun.sh/install | bash
fi


# Create a directory for the digital sign if it doesn't exist

if [ -d "$HOME/.digital-sign" ]
then
    echo "~/.digital-sign directory already exists."
else
    mkdir -p "$HOME/.digital-sign/edit"
    mkdir -p "$HOME/.digital-sign/index"
    echo "Created ~/.digital-sign directory."
fi


# Download the digital sign files from GitHub

REPO_URL="https://raw.githubusercontent.com/Jubillion/Digital-Sign/refs/heads/main/"
FILES=("edit/edit.html" "edit/edit.js" "edit/edit.css" "index/index.html" "index/index.js" "index/index.css" "db.json" "serve.js")

for FILE in "${FILES[@]}"
do
    curl -o "$HOME/.digital-sign/$FILE" "$REPO_URL$FILE"
    echo "Downloaded $(basename $FILE) to ~/.digital-sign/"
done

mkdir -p "$HOME/.digital-sign/images/flyers"

echo "Digital sign files downloaded successfully."


# Create a systemd service to run the digital sign at startup

SERVICE_FILE="/etc/systemd/system/digital-sign.service"
USER=$(whoami)

if [ -f "$SERVICE_FILE" ]
then
    echo "digital-sign.service already exists."
else
    echo "Creating digital-sign.service..."
    sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=Digital Sign
After=network-online.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/.digital-sign
ExecStart=$HOME/.bun/bin/bun run serve.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
    sudo systemctl daemon-reload
    sudo systemctl enable digital-sign.service
    echo "digital-sign.service created and enabled."
fi


# Start the digital sign service

sudo systemctl start digital-sign.service
echo "Digital sign service started."
echo "Setup complete. The digital sign should now be running."
echo ""
echo "To view the sign, go to http://[your-computer-ip]:8080/view/"
echo "To edit the sign, go to http://[your-computer-ip]:8080/"
echo ""
