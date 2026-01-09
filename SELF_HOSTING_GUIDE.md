# Zonoir Self-Hosting Guide

This guide will help you set up Zonoir on your own server with your own database and file storage.

---

## 📋 Prerequisites

- Node.js 18+ installed
- A domain name (optional but recommended)
- A Supabase account (free tier available)

---

## 🚀 Step 1: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **"New Project"**
3. Choose your organization and set:
   - **Project name**: `zonoir` (or your preferred name)
   - **Database password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait ~2 minutes

---

## 🔑 Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIs...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIs...` (keep this secret!)

---

## 🗄️ Step 3: Set Up Database

### Option A: Quick Setup (Recommended)

1. In Supabase dashboard, go to **SQL Editor**
2. Download our database schema file (contact support)
3. Paste and run the SQL to create all tables

### Option B: Manual Setup

Run these SQL commands in order:

```sql
-- 1. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  city TEXT,
  gender TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

> **Note**: Contact us for the complete database schema SQL file.

---

## 📁 Step 4: Set Up File Storage

1. In Supabase dashboard, go to **Storage**
2. Click **"New bucket"** and create:
   - **Bucket name**: `medical-documents`
   - **Public**: No (keep private for patient documents)
3. Create another bucket:
   - **Bucket name**: `avatars`
   - **Public**: Yes (for profile pictures)

### Storage Policies

Run this SQL to set up storage permissions:

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Medical documents - only owner can access
CREATE POLICY "Users can access own documents"
ON storage.objects FOR ALL
USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## ⚙️ Step 5: Configure Your Application

### Create Environment File

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### Update Supabase Client

Edit `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

## 🌐 Step 6: Deploy Your Application

### Option A: Deploy to VPS (Recommended)

1. **Get a VPS** from providers like:
   - DigitalOcean ($5/month)
   - Vultr ($5/month)
   - Linode ($5/month)
   - AWS Lightsail ($3.50/month)

2. **Install required software**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install -y nginx
```

3. **Clone and build your project**:
```bash
# Clone your code
git clone https://github.com/your-username/zonoir.git
cd zonoir

# Install dependencies
npm install

# Build for production
npm run build
```

4. **Start with PM2**:
```bash
# Start the application
pm2 start ecosystem.config.cjs --name zonoir

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

5. **Configure Nginx**:
```nginx
# /etc/nginx/sites-available/zonoir
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3035;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Enable the site**:
```bash
sudo ln -s /etc/nginx/sites-available/zonoir /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

7. **Add SSL (HTTPS)**:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option B: Deploy to Vercel/Netlify (Easiest)

1. Push your code to GitHub
2. Connect to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
3. Add environment variables in dashboard
4. Deploy automatically on git push

---

## 🔐 Step 7: Configure Authentication

1. In Supabase dashboard, go to **Authentication → Providers**
2. Enable **Email** authentication
3. Go to **Authentication → Email Templates**
4. Customize your email templates if needed
5. Go to **Authentication → URL Configuration**
6. Set your **Site URL**: `https://yourdomain.com`
7. Add **Redirect URLs**: `https://yourdomain.com/*`

---

## 👤 Step 8: Create Admin Account

1. Go to **Authentication → Users** in Supabase
2. Click **"Add user"**
3. Enter admin email and password
4. After creation, run this SQL to make them admin:

```sql
-- Replace 'admin-user-id' with the actual user ID from Authentication → Users
INSERT INTO public.user_roles (user_id, role)
VALUES ('admin-user-id', 'admin');
```

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Database tables created
- [ ] Storage buckets configured
- [ ] Environment variables set
- [ ] Application deployed
- [ ] SSL/HTTPS enabled
- [ ] Admin account created
- [ ] Test login working

---

## 🆘 Troubleshooting

### Can't log in?
- Check Supabase URL and API key in `.env`
- Verify email confirmation is disabled (for testing)

### Data not saving?
- Check RLS policies in Supabase
- Verify user is authenticated

### Images not uploading?
- Check storage bucket exists
- Verify storage policies are set

### Site not loading?
- Check PM2 status: `pm2 status`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

## 📞 Support

For assistance with setup:
- Email: support@zonoir.com
- Documentation: https://docs.zonoir.com

---

## 💰 Estimated Costs

| Service | Cost |
|---------|------|
| Supabase (Free tier) | $0/month |
| VPS (Basic) | $5-10/month |
| Domain | $10-15/year |
| SSL | Free (Let's Encrypt) |

**Total: ~$5-10/month**

---

*Last updated: January 2026*
