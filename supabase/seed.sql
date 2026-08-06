-- Realistic demo data for GetFluxGrowth.
--
-- Run this AFTER you have created your first Supabase Auth user (the
-- Supabase dashboard > Authentication > Users > Add user, or your own
-- sign-in flow). The script looks up the oldest auth.users row and
-- seeds all demo leads/audits/outreach/etc. under that account -- no
-- manual UUID substitution required.
--
-- Safe to re-run: it clears previously seeded demo rows for that owner
-- before inserting again (see "Reset" section below).

do $$
declare
  v_owner_id uuid;
begin
  -- Bulk-loading historical data directly; we don't want set_updated_at /
  -- handle_new_user / log_stage_change / log_lead_created firing with
  -- today's timestamp for backdated rows.
  set local session_replication_role = replica;

  select id into v_owner_id from auth.users order by created_at asc limit 1;

  if v_owner_id is null then
    raise exception
      'No auth.users row found. Create your first user in the Supabase dashboard (Authentication > Users) before running this seed script.';
  end if;

  -- ---------------------------------------------------------------------
  -- Reset: remove any previously seeded rows for this owner so the
  -- script is idempotent.
  -- ---------------------------------------------------------------------
  delete from public.leads where owner_id = v_owner_id;
  delete from public.api_key_placeholders where owner_id = v_owner_id;
  delete from public.company_settings where owner_id = v_owner_id;
  delete from public.integrations;

  -- ---------------------------------------------------------------------
  -- Profile + company settings
  -- ---------------------------------------------------------------------
  insert into public.profiles (id, full_name, company_name, company_website, role, timezone)
  values (v_owner_id, 'Jordan Lee', 'Flux Digital', 'https://fluxdigital.agency', 'owner', 'America/New_York')
  on conflict (id) do update set
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    company_name = coalesce(public.profiles.company_name, excluded.company_name),
    company_website = coalesce(public.profiles.company_website, excluded.company_website);

  insert into public.company_settings (owner_id, company_name, website, industry)
  values (v_owner_id, 'Flux Digital', 'https://fluxdigital.agency', 'Digital Marketing Agency');

  -- ---------------------------------------------------------------------
  -- Leads: 48 rows across the funnel, staggered over ~90 days
  -- ---------------------------------------------------------------------
  create temporary table tmp_lead_seed (
    company_name text,
    slug text,
    industry text,
    country text,
    status lead_status,
    pipeline_stage pipeline_stage,
    days_ago int
  ) on commit drop;

  insert into tmp_lead_seed (company_name, slug, industry, country, status, pipeline_stage, days_ago) values
    -- New (12)
    ('Brightleaf Dental', 'brightleafdental', 'Healthcare', 'United States', 'new', 'new', 1),
    ('Solstice Yoga Studio', 'solsticeyoga', 'Fitness', 'United States', 'new', 'new', 2),
    ('Kestrel Legal Group', 'kestrellegal', 'Legal', 'United Kingdom', 'new', 'new', 3),
    ('Marrow Coffee Roasters', 'marrowcoffee', 'E-commerce', 'United States', 'new', 'new', 4),
    ('Vantage Point Realty', 'vantagepointrealty', 'Real Estate', 'United States', 'new', 'new', 5),
    ('Nordholm Furniture Co', 'nordholmfurniture', 'E-commerce', 'Canada', 'new', 'new', 6),
    ('Pulseware Analytics', 'pulsewareanalytics', 'SaaS', 'United States', 'new', 'new', 7),
    ('Cedarline Home Services', 'cedarlinehome', 'Home Services', 'United States', 'new', 'new', 8),
    ('Aurelia Skincare', 'aureliaskincare', 'E-commerce', 'Australia', 'new', 'new', 9),
    ('Fennimore & Cole CPA', 'fennimorecole', 'Finance', 'United States', 'new', 'new', 10),
    ('Trailhead Outfitters', 'trailheadoutfitters', 'E-commerce', 'Canada', 'new', 'new', 12),
    ('Zephyr Cloud Kitchens', 'zephyrcloudkitchens', 'Hospitality', 'United Arab Emirates', 'new', 'new', 14),
    -- Qualified (8)
    ('Ironbridge Manufacturing', 'ironbridgemfg', 'Manufacturing', 'United Kingdom', 'qualified', 'qualified', 15),
    ('Willowmere Preschool', 'willowmerepreschool', 'Education', 'United States', 'qualified', 'qualified', 16),
    ('Sable & Finch Law', 'sablefinchlaw', 'Legal', 'United States', 'qualified', 'qualified', 17),
    ('Cobalt Fitness Collective', 'cobaltfitness', 'Fitness', 'United States', 'qualified', 'qualified', 18),
    ('Harborlight Marketing', 'harborlightmarketing', 'Marketing Agency', 'United States', 'qualified', 'qualified', 19),
    ('Driftwood Boutique Hotel', 'driftwoodhotel', 'Hospitality', 'Australia', 'qualified', 'qualified', 20),
    ('Meridian HVAC Services', 'meridianhvac', 'Home Services', 'United States', 'qualified', 'qualified', 22),
    ('Lumen Dental Group', 'lumendentalgroup', 'Healthcare', 'Canada', 'qualified', 'qualified', 24),
    -- Contacted (8)
    ('Northstar Realty Partners', 'northstarrealty', 'Real Estate', 'United States', 'contacted', 'contacted', 25),
    ('Copperfield Bakery Co', 'copperfieldbakery', 'E-commerce', 'United Kingdom', 'contacted', 'contacted', 26),
    ('Vireo Health Clinic', 'vireohealthclinic', 'Healthcare', 'United States', 'contacted', 'contacted', 27),
    ('Anchorpoint Legal', 'anchorpointlegal', 'Legal', 'Canada', 'contacted', 'contacted', 28),
    ('Bramblewood Landscaping', 'bramblewoodlandscaping', 'Home Services', 'United States', 'contacted', 'contacted', 29),
    ('Solace Wellness Spa', 'solacewellness', 'Fitness', 'United Arab Emirates', 'contacted', 'contacted', 30),
    ('Gridline SaaS Labs', 'gridlinesaas', 'SaaS', 'United States', 'contacted', 'contacted', 32),
    ('Talon Financial Advisors', 'talonfinancial', 'Finance', 'United States', 'contacted', 'contacted', 34),
    -- Replied (6)
    ('Emberly Real Estate Group', 'emberlyrealestate', 'Real Estate', 'United States', 'contacted', 'replied', 35),
    ('Foxglove Boutique', 'foxgloveboutique', 'E-commerce', 'United States', 'contacted', 'replied', 37),
    ('Wrenfield Academy', 'wrenfieldacademy', 'Education', 'United Kingdom', 'contacted', 'replied', 38),
    ('Cascade Physical Therapy', 'cascadephysicaltherapy', 'Healthcare', 'Canada', 'contacted', 'replied', 40),
    ('Stonegate Law Partners', 'stonegatelaw', 'Legal', 'United States', 'contacted', 'replied', 42),
    ('Marlowe Marketing Studio', 'marlowemarketing', 'Marketing Agency', 'Australia', 'contacted', 'replied', 44),
    -- Meeting (5)
    ('Halcyon Hospitality Group', 'halcyonhospitality', 'Hospitality', 'United States', 'qualified', 'meeting', 45),
    ('Ridgeback Fitness Co', 'ridgebackfitness', 'Fitness', 'United States', 'qualified', 'meeting', 47),
    ('Thornbury Manufacturing', 'thornburymfg', 'Manufacturing', 'United Kingdom', 'qualified', 'meeting', 49),
    ('Everline SaaS Solutions', 'everlinesaas', 'SaaS', 'United States', 'qualified', 'meeting', 51),
    ('Windmere Dental Care', 'windmeredental', 'Healthcare', 'Canada', 'qualified', 'meeting', 53),
    -- Proposal (4)
    ('Palisade Legal Advisors', 'palisadelegal', 'Legal', 'United States', 'qualified', 'proposal', 55),
    ('Crestwood Home Services', 'crestwoodhome', 'Home Services', 'United States', 'qualified', 'proposal', 58),
    ('Amberglow E-commerce Co', 'ambergloweco', 'E-commerce', 'Australia', 'qualified', 'proposal', 61),
    ('Nautilus Finance Group', 'nautilusfinance', 'Finance', 'United Arab Emirates', 'qualified', 'proposal', 64),
    -- Won (3)
    ('Silverline Realty Co', 'silverlinerealty', 'Real Estate', 'United States', 'converted', 'won', 68),
    ('Brackenfield Marketing', 'brackenfieldmarketing', 'Marketing Agency', 'United States', 'converted', 'won', 72),
    ('Glasswing SaaS Studio', 'glasswingsaas', 'SaaS', 'Canada', 'converted', 'won', 76),
    -- Lost (2)
    ('Thistlewood Hospitality', 'thistlewoodhospitality', 'Hospitality', 'United Kingdom', 'lost', 'lost', 80),
    ('Redshale Manufacturing', 'redshalemfg', 'Manufacturing', 'United States', 'unqualified', 'lost', 85);

  create temporary table tmp_leads (
    id uuid,
    company_name text,
    pipeline_stage pipeline_stage,
    created_at timestamptz
  ) on commit drop;

  with inserted as (
    insert into public.leads (
      owner_id, company_name, website, industry, country, email, linkedin_url,
      status, pipeline_stage, source, created_at, updated_at
    )
    select
      v_owner_id,
      s.company_name,
      'https://' || s.slug || '.com',
      s.industry,
      s.country,
      'hello@' || s.slug || '.com',
      'https://www.linkedin.com/company/' || s.slug,
      s.status,
      s.pipeline_stage,
      'manual',
      now() - (s.days_ago || ' days')::interval,
      now() - (s.days_ago || ' days')::interval
    from tmp_lead_seed s
    returning id, company_name, pipeline_stage, created_at
  )
  insert into tmp_leads (id, company_name, pipeline_stage, created_at)
  select id, company_name, pipeline_stage, created_at from inserted;

  -- ---------------------------------------------------------------------
  -- Activities: lead_created for every lead, plus a plausible stage
  -- progression trail for leads past "new".
  -- ---------------------------------------------------------------------
  insert into public.activities (lead_id, actor_id, type, description, created_at)
  select id, v_owner_id, 'lead_created', company_name || ' was added as a lead', created_at
  from tmp_leads;

  insert into public.activities (lead_id, actor_id, type, description, metadata, created_at)
  select
    id, v_owner_id, 'stage_changed',
    'Stage changed from ' || prev_stage || ' to ' || pipeline_stage,
    jsonb_build_object('from', prev_stage, 'to', pipeline_stage),
    created_at + interval '1 day'
  from (
    select id, company_name, pipeline_stage, created_at,
      case pipeline_stage
        when 'qualified' then 'new'
        when 'contacted' then 'qualified'
        when 'replied' then 'contacted'
        when 'meeting' then 'replied'
        when 'proposal' then 'meeting'
        when 'won' then 'proposal'
        when 'lost' then 'contacted'
        else null
      end as prev_stage
    from tmp_leads
  ) t
  where prev_stage is not null;

  insert into public.activities (lead_id, actor_id, type, description, created_at)
  select id, v_owner_id, 'email_sent', 'Outreach email sent to ' || company_name, created_at + interval '2 days'
  from tmp_leads
  where pipeline_stage in ('contacted', 'replied', 'meeting', 'proposal', 'won');

  insert into public.activities (lead_id, actor_id, type, description, created_at)
  select id, v_owner_id, 'reply_received', company_name || ' replied to outreach', created_at + interval '4 days'
  from tmp_leads
  where pipeline_stage in ('replied', 'meeting', 'proposal', 'won');

  insert into public.activities (lead_id, actor_id, type, description, created_at)
  select id, v_owner_id, 'meeting_booked', 'Discovery call booked with ' || company_name, created_at + interval '6 days'
  from tmp_leads
  where pipeline_stage in ('meeting', 'proposal', 'won');

  -- ---------------------------------------------------------------------
  -- Website audits + SEO audits for leads past "new" (28 leads)
  -- ---------------------------------------------------------------------
  insert into public.audits (lead_id, category, score, status, summary, created_at, updated_at)
  select
    tl.id,
    c.category,
    score,
    (case when score >= 80 then 'good' when score >= 50 then 'needs_improvement' else 'poor' end)::score_status,
    initcap(replace(c.category::text, '_', ' ')) || ' for ' || tl.company_name || ': ' ||
      case
        when score >= 80 then 'strong performance, no major issues found.'
        when score >= 50 then 'a few improvements recommended to lift results.'
        else 'significant issues need attention soon.'
      end,
    tl.created_at + interval '3 days',
    tl.created_at + interval '3 days'
  from tmp_leads tl
  cross join unnest(enum_range(null::audit_category)) as c(category)
  cross join lateral (
    select 40 + (abs(hashtext(tl.id::text || c.category::text)) % 56) as score
  ) scored
  where tl.pipeline_stage in ('contacted', 'replied', 'meeting', 'proposal', 'won', 'lost');

  insert into public.seo_audits (lead_id, category, score, status, summary, created_at, updated_at)
  select
    tl.id,
    c.category,
    score,
    (case when score >= 80 then 'good' when score >= 50 then 'needs_improvement' else 'poor' end)::score_status,
    initcap(replace(c.category::text, '_', ' ')) || ' for ' || tl.company_name || ': ' ||
      case
        when score >= 80 then 'strong performance, no major issues found.'
        when score >= 50 then 'a few improvements recommended to lift results.'
        else 'significant issues need attention soon.'
      end,
    tl.created_at + interval '3 days',
    tl.created_at + interval '3 days'
  from tmp_leads tl
  cross join unnest(enum_range(null::seo_audit_category)) as c(category)
  cross join lateral (
    select 40 + (abs(hashtext(tl.id::text || 'seo' || c.category::text)) % 56) as score
  ) scored
  where tl.pipeline_stage in ('contacted', 'replied', 'meeting', 'proposal', 'won', 'lost');

  -- ---------------------------------------------------------------------
  -- AI opportunities: 1-3 per lead for qualified-and-beyond leads
  -- ---------------------------------------------------------------------
  create temporary table tmp_opportunity_templates (
    type ai_opportunity_type,
    title text,
    description text,
    impact opportunity_impact,
    estimated_value text
  ) on commit drop;

  insert into tmp_opportunity_templates (type, title, description, impact, estimated_value) values
    ('chatbot', 'AI website chatbot', 'Deploy a chatbot to answer common questions and capture visitor details after hours.', 'high', '$800-1,500/mo'),
    ('email', 'Automated email nurture sequence', 'Replace manual follow-ups with a triggered email sequence for new inquiries.', 'medium', '$400-900/mo'),
    ('crm', 'CRM pipeline automation', 'Automate lead routing and stage updates so nothing falls through the cracks.', 'medium', '$300-700/mo'),
    ('whatsapp', 'WhatsApp inquiry automation', 'Auto-respond to WhatsApp inquiries and hand off qualified leads to the team.', 'high', '$500-1,200/mo'),
    ('lead_capture', 'Smart lead capture forms', 'Replace static contact forms with progressive, higher-converting capture forms.', 'medium', '$200-500/mo'),
    ('automation', 'Booking & scheduling automation', 'Automate appointment scheduling to cut no-shows and admin time.', 'low', '$150-400/mo');

  -- Postgres has no QUALIFY, so pick 1-3 templates per lead via a
  -- row_number() subquery instead.
  insert into public.ai_opportunities (lead_id, type, title, description, impact, estimated_value, created_at, updated_at)
  select id, type, title, description, impact, estimated_value, created_at, updated_at
  from (
    select
      tl.id,
      t.type,
      t.title,
      t.description,
      t.impact,
      t.estimated_value,
      tl.created_at + interval '5 days' as created_at,
      tl.created_at + interval '5 days' as updated_at,
      row_number() over (
        partition by tl.id
        order by hashtext(tl.id::text || t.type::text)
      ) as rn,
      1 + (abs(hashtext(tl.id::text)) % 3) as opp_count
    from tmp_leads tl
    join tmp_opportunity_templates t on true
    where tl.pipeline_stage in ('qualified', 'contacted', 'replied', 'meeting', 'proposal', 'won')
  ) ranked
  where rn <= opp_count;

  -- ---------------------------------------------------------------------
  -- Outreach: 1-3 messages per lead at Contacted+ (26 leads)
  -- ---------------------------------------------------------------------
  create temporary table tmp_outreach_templates (
    type outreach_type,
    subject text,
    body text
  ) on commit drop;

  insert into tmp_outreach_templates (type, subject, body) values
    ('email_generator', 'Quick idea for {{company}}''s website', 'Hi there, I took a look at {{company}}''s site and noticed a few quick wins that could help bring in more clients. Would you be open to a short call this week?'),
    ('linkedin_message', null, 'Hi -- I help businesses like {{company}} turn more website visitors into booked calls. Open to connecting?'),
    ('follow_up_1', 'Following up: {{company}}', 'Just following up on my last note -- happy to send over a short audit of what I found on {{company}}''s site, no strings attached.'),
    ('follow_up_2', 'One more try: {{company}}', 'I know inboxes get busy -- wanted to bump this up in case it got buried. Let me know if a quick call makes sense.'),
    ('proposal', 'Proposal for {{company}}', 'Attached is a proposal outlining the website, SEO, and automation improvements we discussed for {{company}}, along with projected impact and pricing.');

  insert into public.outreach (lead_id, owner_id, type, subject, body, status, sent_at, created_at, updated_at)
  select
    id,
    v_owner_id,
    type,
    replace(subject, '{{company}}', company_name),
    replace(body, '{{company}}', company_name),
    status,
    case when status = 'sent' then created_at else null end,
    created_at,
    created_at
  from (
    select
      tl.id,
      tl.company_name,
      t.type,
      t.subject,
      t.body,
      (case when hashtext(tl.id::text || t.type::text || 'status') % 3 = 0 then 'draft' else 'sent' end)::outreach_status as status,
      tl.created_at + interval '4 days' as created_at,
      row_number() over (
        partition by tl.id
        order by hashtext(tl.id::text || t.type::text)
      ) as rn,
      1 + (abs(hashtext(tl.id::text || 'outreach')) % 3) as msg_count
    from tmp_leads tl
    join tmp_outreach_templates t on true
    where tl.pipeline_stage in ('contacted', 'replied', 'meeting', 'proposal', 'won')
  ) ranked
  where rn <= msg_count;

  -- ---------------------------------------------------------------------
  -- Notes: 1-2 per lead on ~40% of leads
  -- ---------------------------------------------------------------------
  insert into public.notes (lead_id, author_id, body, created_at, updated_at)
  select tl.id, v_owner_id,
    case (abs(hashtext(tl.id::text || 'note')) % 4)
      when 0 then 'Spoke briefly -- decision maker is out until next week, following up then.'
      when 1 then 'Site is on an old template, big opportunity for a redesign + SEO refresh.'
      when 2 then 'Referred by an existing client, warm lead -- prioritize outreach.'
      else 'Budget conscious, may need a phased proposal.'
    end,
    tl.created_at + interval '3 days',
    tl.created_at + interval '3 days'
  from tmp_leads tl
  where abs(hashtext(tl.id::text)) % 5 < 2;

  -- ---------------------------------------------------------------------
  -- Settings: API key placeholders + global integrations reference data
  -- ---------------------------------------------------------------------
  insert into public.api_key_placeholders (owner_id, provider, label, is_connected) values
    (v_owner_id, 'openai', 'OpenAI', false),
    (v_owner_id, 'apollo', 'Apollo.io', false),
    (v_owner_id, 'clearbit', 'Clearbit', false),
    (v_owner_id, 'twilio', 'Twilio (WhatsApp)', false);

  insert into public.integrations (slug, name, description, status, icon_name) values
    ('ai-website-scraper', 'AI Website Scraper', 'Automatically audit prospect websites the moment a lead is added.', 'coming_soon', 'Globe'),
    ('auto-seo-audit', 'Automated SEO Audit', 'Run a full technical SEO scan on demand or on a schedule.', 'coming_soon', 'Search'),
    ('ai-email-writer', 'AI Email Writer', 'Generate personalized outreach emails from a single prompt.', 'coming_soon', 'Mail'),
    ('whatsapp-automation', 'WhatsApp Automation', 'Auto-respond to inbound WhatsApp inquiries and qualify leads.', 'coming_soon', 'MessageCircle'),
    ('chatbot-builder', 'Chatbot Builder', 'Embed an AI chatbot trained on your services and pricing.', 'coming_soon', 'Bot');

end $$;
