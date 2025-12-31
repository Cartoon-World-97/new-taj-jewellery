# Deployment Guide

This guide covers deploying the Jewelry Store Admin Panel to various platforms.

## Pre-Deployment Checklist

- [ ] Test application locally
- [ ] Build passes without errors: `npm run build`
- [ ] All environment variables documented
- [ ] Database migrations completed
- [ ] Security audit completed
- [ ] Change default passwords
- [ ] Generate strong secrets

## Environment Variables

Create these in your deployment platform:

```env
MONGODB_URI=your_production_mongodb_uri
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate_strong_secret_here
JWT_SECRET=generate_different_strong_secret_here
```

### Generating Secrets

```bash
# Generate secure random secrets
openssl rand -base64 32
```

## Deployment Platforms

### Vercel (Recommended)

#### Prerequisites
- Vercel account
- MongoDB Atlas account (or other hosted MongoDB)

#### Steps

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Set Environment Variables**
   - Go to your project settings on Vercel
   - Add all environment variables
   - Redeploy

5. **Configure Domain**
   - Add custom domain in Vercel settings
   - Update NEXTAUTH_URL

#### Vercel Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["bom1"]
}
```

### Netlify

1. **Connect Repository**
   - Link your Git repository to Netlify

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**
   - Add all required variables in Netlify dashboard

4. **Deploy**
   - Push to main branch or click deploy

### DigitalOcean App Platform

1. **Create App**
   - Choose GitHub/GitLab repo
   - Select Next.js as framework

2. **Configure**
   - Add environment variables
   - Select region

3. **Deploy**
   - Review and launch

### AWS (EC2 + PM2)

#### Server Setup

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro or larger
   - Configure security groups (80, 443, 22)

2. **Connect to Server**
```bash
ssh -i your-key.pem ubuntu@your-server-ip
```

3. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2
```

4. **Deploy Application**
```bash
# Clone repository
git clone your-repo-url
cd jewelry-admin-panel

# Install dependencies
npm install

# Create .env.local
nano .env.local
# Add your environment variables

# Build
npm run build

# Start with PM2
pm2 start npm --name "jewelry-admin" -- start
pm2 save
pm2 startup
```

5. **Configure Nginx**
```bash
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/jewelry-admin

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/jewelry-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **SSL with Certbot**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Docker Deployment

#### Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/jewelry-store
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your_secret
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

#### Deploy with Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## MongoDB Atlas Setup

1. **Create Cluster**
   - Go to mongodb.com/cloud/atlas
   - Create free tier cluster

2. **Configure Access**
   - Add IP whitelist (0.0.0.0/0 for all IPs)
   - Create database user

3. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace password in connection string

4. **Initialize Database**
```bash
MONGODB_URI="your_atlas_connection_string" node scripts/init-db.js
```

## Post-Deployment

### 1. Initialize Database
```bash
# Connect to your server/container
node scripts/init-db.js
```

### 2. Change Default Passwords
- Login as admin
- Go to Employees
- Update admin password

### 3. Test Functionality
- [ ] Login works
- [ ] Create transaction
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] PDF download
- [ ] Search functionality
- [ ] Employee management

### 4. Monitoring

#### PM2 Monitoring
```bash
pm2 monit
pm2 logs jewelry-admin
```

#### Server Monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error logging (Sentry)
- Set up database backups

## Backups

### MongoDB Backup Script

Create `scripts/backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out=/backups/backup_$DATE
```

### Automated Backups
```bash
# Add to crontab
crontab -e

# Add line for daily backup at 2 AM
0 2 * * * /path/to/scripts/backup.sh
```

## Updating Application

### Vercel/Netlify
- Push to main branch
- Automatic deployment

### Manual Server
```bash
# Connect to server
ssh your-server

# Pull latest changes
cd jewelry-admin-panel
git pull

# Install dependencies
npm install

# Build
npm run build

# Restart PM2
pm2 restart jewelry-admin
```

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs jewelry-admin

# Check environment variables
pm2 env 0

# Restart
pm2 restart jewelry-admin
```

### Database Connection Issues
- Verify MONGODB_URI is correct
- Check IP whitelist in MongoDB Atlas
- Test connection: `mongosh "your_connection_string"`

### 502 Bad Gateway
- Check if application is running: `pm2 status`
- Check Nginx configuration: `sudo nginx -t`
- Restart Nginx: `sudo systemctl restart nginx`

## Security Best Practices

1. **Always Use HTTPS**
   - Configure SSL certificates
   - Redirect HTTP to HTTPS

2. **Strong Secrets**
   - Use long, random strings
   - Never commit secrets to Git

3. **Database Security**
   - Use strong passwords
   - Enable authentication
   - Restrict IP access

4. **Regular Updates**
   ```bash
   npm audit
   npm update
   ```

5. **Firewall Configuration**
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connection
4. Review security groups/firewall rules
