// ─── Shared API shapes ─────────────────────────────────────────────────────

export type ApiListResponse<T> = {
  status?: string;
  count: number;
  total_pages?: number;
  current_page?: number;
  page_size?: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// ─── Staff members (for author dropdowns) ─────────────────────────────────

export type StaffMember = {
  id: string | number;
  email?: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  slug?: string;
};

// ─── Taxonomy ──────────────────────────────────────────────────────────────

export type CategorySummary = {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  og_image_url?: string;
  section?: number | null;
  article_count?: number;
  section_name?: string | null;
  section_slug?: string | null;
};

export type TagSummary = {
  id: string | number;
  name: string;
  slug: string;
  article_count?: number;
};

export type SectionSummary = {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  og_image_url?: string;
  display_order?: number;
  is_active?: boolean;
  is_primary?: boolean;
  featured_article?: number | null;
  article_count?: number;
  category_count?: number;
};

export type SectionDetail = SectionSummary & {
  hero_article: ArticleSummary | null;
  categories: CategorySummary[];
  articles: ArticleSummary[];
};

export type SectionListResponse = {
  status?: string;
  count: number;
  results: SectionSummary[];
};

export type SectionArticlesResponse = ApiListResponse<ArticleSummary> & {
  status?: string;
};

export type SectionWritePayload = {
  name: string;
  slug?: string;
  description?: string;
  og_image_url?: string;
  display_order?: number;
  is_active?: boolean;
  is_primary?: boolean;
  featured_article?: number | null;
};

export type CategoryWritePayload = {
  name: string;
  description?: string;
  og_image_url?: string;
  section?: number | null;
};

export type TagWritePayload = {
  name: string;
};

export type ApiDetailResponse = {
  detail: string;
};

// ─── Articles ──────────────────────────────────────────────────────────────

export type ArticleSummary = {
  id: string | number;
  title: string;
  slug: string;
  excerpt?: string;
  status?: string;
  author_name?: string;
  author_slug?: string;
  /** Nested author object (returned by staff endpoints) */
  author?: { id: string | number; display_name?: string; slug?: string } | null;
  category?: CategorySummary | null;
  tags?: TagSummary[];
  is_breaking?: boolean;
  is_premium?: boolean;
  top_story_rank?: number | null;
  is_top_story?: boolean;
  is_featured?: boolean;
  featured_rank?: number | null;
  is_live?: boolean;
  needs_banner?: boolean;
  image_url?: string;
  image_alt?: string;
  published_at?: string | null;
  updated_at?: string;
  created_at?: string;
  view_count?: number;
};

export type ArticleDetail = ArticleSummary & {
  body?: string;
  image_caption?: string;
  image_credit?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  canonical_url?: string;
  seo_title?: string;
  seo_description?: string;
  resolved_og_image?: string;
  scheduled_at?: string | null;
  updated_at?: string;
  section?: SectionSummary | null;
  related_articles?: ArticleSummary[];
  latest_articles?: ArticleSummary[];
  more_from_author?: ArticleSummary[];
};

export type TopStorySlot = {
  rank: number;
  article: ArticleSummary | null;
};

// ─── Taxonomy detail pages ─────────────────────────────────────────────────

export type CategoryDetailResponse = {
  category: CategorySummary;
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  articles: ArticleSummary[];
};

export type TagDetailResponse = {
  tag: TagSummary;
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  articles: ArticleSummary[];
};

// ─── Search ────────────────────────────────────────────────────────────────

export type SearchResult = {
  rank: number;
  headline: string;
  article: ArticleSummary;
};

export type SearchResponse = {
  status: string;
  query: string;
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: SearchResult[];
};

// ─── Analytics / trending ──────────────────────────────────────────────────

export type TrendingArticle = {
  rank: number;
  view_count: number;
  article: ArticleSummary;
};

export type DailyView = {
  date: string;   // ISO date string "YYYY-MM-DD"
  views: number;
};

export type ArticleStats = {
  slug: string;
  title?: string;
  total_views: number;
  daily_views: DailyView[];
};

// ─── Users / authors ──────────────────────────────────────────────────────

export type UserProfile = {
  id: string | number;
  byline: string;
  slug: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  beat?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  email_public?: string;
  article_count?: number;
};

export type UserDetailResponse = {
  user: UserProfile;
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  articles: ArticleSummary[];
};

// ─── Reader auth ──────────────────────────────────────────────────────────

export type ReaderProfile = {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  public_name?: string;
  avatar_url?: string;
  bio?: string;
  is_email_verified: boolean;
  date_joined?: string;
  last_login?: string | null;
  bookmark_count?: number;
  subscription_status?: string;
};

/** Shape returned by GET /api/v1/accounts/me/ */
export type ReaderMeResponse = {
  id: string | number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  reader_profile?: ReaderProfile;
};

export type ReaderAuthResponse = {
  access: string;
  refresh: string;
  reader: ReaderProfile;
};

// ─── Staff auth ───────────────────────────────────────────────────────────

export type StaffProfile = {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  byline?: string;
  display_name?: string;
  slug?: string;
  role: string;
  role_display?: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  beat?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  email_public?: string;
  can_publish?: boolean;
  can_edit_any_article?: boolean;
  can_manage_staff?: boolean;
  is_editorial_admin?: boolean;
};

export type StaffAuthResponse = {
  access: string;
  refresh: string;
  user: StaffProfile;
};

// ─── Subscriptions ────────────────────────────────────────────────────────

export type SubscriptionPlan = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_usd: string;
  billing_period: "monthly" | "annual";
  billing_period_label: string;
  features: string | string[];
  article_access: "free_only" | "premium" | "all";
  article_access_label: string;
};

export type SubscriptionStatus = "active" | "cancelled" | "expired" | "past_due" | "trialing";

export type Subscription = {
  id: string;
  plan: SubscriptionPlan;
  user?: { id: string | number; email: string; username?: string };
  status: SubscriptionStatus;
  status_label: string;
  started_at: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  cancel_at_period_end: boolean;
  is_active_subscription: boolean;
  days_remaining: number;
  created_at: string;
  /** Only present during checkout flow */
  redirect_url?: string;
  poll_url?: string;
};

export type PaymentRecord = {
  id: string;
  amount: string;
  amount_usd: string;
  currency: string;
  payment_method: string;
  payment_method_label?: string;
  status: string;
  status_label?: string;
  paynow_reference?: string;
  created_at?: string;
  updated_at?: string;
};

// ─── Reader engagement ────────────────────────────────────────────────────

export type BookmarkRecord = {
  id: string;
  article: Pick<ArticleSummary, "id" | "title" | "slug" | "excerpt" | "image_url" | "published_at">;
  created_at: string;
};

export type ReadingHistoryRecord = {
  id: string;
  article: Pick<ArticleSummary, "id" | "title" | "slug" | "excerpt" | "image_url" | "published_at">;
  read_at: string;
  read_count: number;
};

// ─── Comments ─────────────────────────────────────────────────────────────

export type CommentRecord = {
  id: number;
  author_name: string;
  author_email?: string;
  body: string;
  status?: string;
  created_at: string;
  is_reply: boolean;
  parent: number | null;
  replies: CommentRecord[];
  /** Present on staff/moderation endpoints */
  article_title?: string;
  article_slug?: string;
  ip_hash?: string;
};

export type CommentListResponse = {
  count: number;
  results: CommentRecord[];
};

// ─── Newsletter ───────────────────────────────────────────────────────────

export type NewsletterResponse = {
  detail: string;
};

// ─── Advertising ──────────────────────────────────────────────────────────

export type AdCampaignPublic = {
  id: string;
  name: string;
  advertiser_name: string;
  creative_url: string;
  alt_text: string;
  click_tracking_url: string;
  impression_tracking_url: string;
};

export type AdZone = {
  id: string;
  name: string;
  slug: string;
  zone_type: string;
  description?: string;
  width: number;
  height: number;
  max_ads: number;
  campaigns: AdCampaignPublic[];
};

// ─── Staff dashboard ──────────────────────────────────────────────────────

export type RevenueReport = {
  total_active_subscribers: number;
  total_revenue_usd_month: string;
  total_revenue_usd_all_time: string;
  currency: string;
  report_month: string;
  breakdown_by_plan: Array<{
    plan_name: string;
    plan_slug: string;
    price_usd: string;
    active_count: number;
    currency: string;
  }>;
};

export type ModerationComment = {
  id: number;
  article_title: string;
  article_slug: string;
  parent: number | null;
  author_name: string;
  author_email: string;
  body: string;
  status: string;
  ip_hash: string;
  created_at: string;
  updated_at: string;
};

export type NotificationRecord = {
  id: number;
  title: string;
  body: string;
  url: string;
  article_slug: string;
  sent_count: number;
  success_count: number;
  failed_count: number;
  sent_at: string;
};

export type StaffSubscriptionRecord = {
  id: string;
  reader_email: string;
  reader_username: string;
  plan_name: string;
  plan_price_usd: string;
  status: string;
  status_label?: string;
  started_at?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  is_active_subscription?: boolean;
  days_remaining?: number;
  created_at?: string;
};
