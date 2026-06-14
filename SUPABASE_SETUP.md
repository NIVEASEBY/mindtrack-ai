# Supabase Setup Guide

## Getting Supabase Credentials

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in
4. Click "New Project"
5. Fill in:
   - **Name**: MindTrack AI (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

### Step 2: Get Your Credentials
1. Once your project is created, go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: Found under "Project Configuration"
   - **anon public**: Found under "Project API keys"

### Step 3: Run the Database Migration
1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

### Step 4: Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and replace the placeholder values:
   ```
   VITE_SUPABASE_URL=your-actual-supabase-url
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

### Step 5: Enable Email Auth (Optional but Recommended)
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates if needed
4. For production, consider using a custom SMTP server or Resend

## Database Schema Overview

The migration creates the following tables:

### `user_profiles`
- Extends Supabase auth.users
- Stores: email, full_name, student_id, institution, is_admin
- RLS: Users can only see/edit their own profile; admins can see all

### `assessments`
- Stores burnout assessments
- Fields: user_id, date, inputs (JSONB), score, level, factors (JSONB)
- RLS: Users can only see their own assessments; admins can see all

### `check_ins`
- Stores daily mood check-ins
- Fields: user_id, date, mood (1-5), notes
- RLS: Users can only see their own check-ins; admins can see all

### `study_plans`
- Stores personalized study plans
- Fields: user_id, subjects, exam_date, hours_per_day, days (JSONB)
- RLS: Users can only see their own plans; admins can see all

## Email Service Recommendation: Resend

I recommend **Resend** for email functionality because:

### Why Resend?
- **Generous Free Tier**: 3,000 emails/month
- **Excellent Deliverability**: Built-in reputation management
- **Simple API**: Easy to integrate with Supabase Edge Functions
- **Modern Developer Experience**: Great documentation and SDKs
- **Perfect for Transactional Emails**: Ideal for admin alerts, notifications
- **Templates**: Built-in email template support

### Setting Up Resend

1. Go to [https://resend.com](https://resend.com)
2. Sign up for an account
3. Go to **API Keys** → **Create API Key**
4. Copy the API key
5. Add to your `.env`:
   ```
   VITE_RESEND_API_KEY=your-resend-api-key
   ```
6. Verify your domain in Resend settings

### Alternative Email Services
- **SendGrid**: More established, but complex free tier
- **Postmark**: Excellent deliverability, but paid only
- **Supabase Email**: Built-in, but limited customization
- **AWS SES**: Cheap, but complex setup

## Next Steps

After setting up Supabase:
1. Update `lib/api/store.ts` to use Supabase instead of localStorage
2. Update authentication flow to use Supabase Auth
3. Implement email sending with Resend
4. Update admin panel to fetch real data from Supabase
