# VPS Migration Guide - Qurion Tech

This guide details how to move your entire application (Code, Database, and Images) from your current VPS to a new one.

## Phase 1: Backup (On Current VPS)

**1. Backup the Database**
Use `pg_dump` to save your entire database to a file.
```bash
# Run on OLD VPS
pg_dump -U postgres circuithub > backup_circuithub.sql
```

**2. Compress Uploads & Env**
Zip multiple files into one archive for easy transfer.
```bash
# Run on OLD VPS
cd ~
tar -czvf migration_backup.tar.gz shop/server/uploads shop/server/.env shop/web/.env backup_circuithub.sql
```

**3. Download the Backup**
On your **Local Computer** (Windows), download this file from the VPS.
```powershell
# Run on YOUR PC (PowerShell)
scp root@<OLD_VPS_IP>:~/migration_backup.tar.gz .
```

---

## Phase 2: Setup New VPS

**1. Provision the Server**
Install the necessary software on your **NEW VPS** (UBUNTU).
```bash
# Run on NEW VPS
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx postgresql postgresql-contrib git certbot python3-certbot-nginx
sudo npm install -g pm2
```

**2. Setup Database**
```bash
# Switch to postgres user
sudo -i -u postgres

# Enter Postgres Console
psql

# Create User and DB (Change 'completed' to your actual password from .env)
CREATE DATABASE circuithub;
CREATE USER samir WITH ENCRYPTED PASSWORD 'completed';
GRANT ALL PRIVILEGES ON DATABASE circuithub TO samir;
\q

# Exit postgres user
exit
```

**3. Clone the Code**
```bash
# Create user (optional, or use root)
git clone https://github.com/samirkumar13/shop.git
cd shop/server
npm install
npm run build
cd ../web
npm install
npm run build
```

---

## Phase 3: Restore Data (On New VPS)

**1. Upload Backup**
From your **Local Computer**:
```powershell
# Run on YOUR PC
scp migration_backup.tar.gz root@<NEW_VPS_IP>:~
```

**2. Extract Files**
```bash
# Run on NEW VPS
tar -xzvf migration_backup.tar.gz
```
*This extracts `shop/server/uploads`, `.env` files, and the SQL dump.*

**3. Move Files to Correct Places**
```bash
# Restore Uploads
rm -rf ~/shop/server/uploads
mv shop/server/uploads ~/shop/server/

# Restore Env Files
mv shop/server/.env ~/shop/server/
mv shop/web/.env ~/shop/web/
```

**4. Restore Database**
```bash
# Run on NEW VPS
psql -U samir -d circuithub < backup_circuithub.sql
```

---

## Phase 4: Go Live!

**1. Start the App**
```bash
cd ~/shop/server
pm2 start dist/server.js --name app
pm2 save
pm2 startup
```

**2. Configure Nginx**
Copy your old Nginx config (use the `VPS_GUIDE.txt` reference) to `/etc/nginx/sites-available/quriontech.in`.
Remember to update the `root` path if your username changed!

**3. Switch DNS**
Go to Cloudflare (or your Domain Registrar) and update the **A Record** to point to the **NEW VPS IP**.
Wait 5 minutes, and your site is migrated!
