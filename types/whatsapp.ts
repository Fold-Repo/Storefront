// WhatsApp Commerce TypeScript Types

export interface WhatsAppNumber {
  id: number;
  waba_id: string;
  phone_number_id: string;
  display_phone_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppSettings {
  business_id: number;
  multi_store_routing: boolean;
  default_store_id: number | null;
  default_store_name?: string;
  pickup_enabled: boolean;
  delivery_enabled: boolean;
  payment_required_for_delivery: boolean;
  auto_welcome_message: boolean;
  welcome_message_template: string | null;
}

export type SessionStep = 
  | 'WELCOME' 
  | 'SELECT_STORE' 
  | 'SELECT_CATEGORY' 
  | 'SELECT_PRODUCT' 
  | 'SELECT_QTY' 
  | 'REVIEW_CART' 
  | 'SELECT_FULFILLMENT' 
  | 'COLLECT_ADDRESS' 
  | 'PAYMENT_LINK_SENT' 
  | 'CONFIRMED' 
  | 'CLOSED';

export type PaymentStatus = 'unpaid' | 'awaiting_payment' | 'paid';
export type FulfillmentType = 'pickup' | 'delivery';
export type SubscriberStatus = 'pending' | 'opted_in' | 'opted_out';
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';

export interface WhatsAppSession {
  session_id: string;
  business_id: number;
  phone_number_id: string;
  from_phone: string;
  store_id: number | null;
  store_name?: string;
  step: SessionStep;
  cart_items: CartItem[];
  cart_items_count?: number;
  cart_total?: number;
  fulfillment_type: FulfillmentType | null;
  address: Address | null;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  payment_link_url: string | null;
  sale_id: number | null;
  last_message_id: string | null;
  customer_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: number;
  variation_id: number | null;
  name?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  tax: number;
  subtotal?: number;
  line_tax?: number;
}

export interface Address {
  line1: string;
  city: string;
  postcode: string;
}

export interface CartDetails {
  items: CartItem[];
  subtotal: number;
  tax: number;
  grand_total: number;
}

export interface MarketingSubscriber {
  id: number;
  phone_number: string;
  name: string | null;
  status: SubscriberStatus;
  opt_in_source: string;
  tags: string[];
  metadata?: Record<string, any>;
  customer_id: number | null;
  opted_in_at: string | null;
  opted_out_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingCampaign {
  id: number;
  business_id: number;
  name: string;
  description: string | null;
  template_name: string;
  template_language: string;
  template_components: any[];
  status: CampaignStatus;
  target_filters: { tags?: string[] };
  target_count: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  batch_size: number;
  delay_ms: number;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignStats {
  total_recipients: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  opt_outs: number;
}

export interface ServiceToken {
  id: number;
  name: string;
  token?: string; // Only on creation
  scopes: string[];
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface WhatsAppOverview {
  connected_number: {
    phone_number_id: string;
    display_phone: string;
    is_active: boolean;
  } | null;
  is_connected: boolean;
  stats: {
    active_sessions: number;
    sessions_today: number;
    sales_today: number;
    revenue_today: number;
  };
  recent_conversations: Array<{
    session_id: string;
    from_phone: string;
    step: SessionStep;
    store_name: string | null;
    cart_total: number;
    payment_status: PaymentStatus;
    updated_at: string;
  }>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  items?: T[];
  sessions?: T[];
  campaigns?: T[];
  pagination: Pagination;
}

// Request/Input Types
export interface ConnectNumberInput {
  waba_id: string;
  phone_number_id: string;
  display_phone_number: string;
  access_token: string;
  verify_token?: string;
}

export interface UpdateSettingsInput {
  multi_store_routing?: boolean;
  default_store_id?: number | null;
  pickup_enabled?: boolean;
  delivery_enabled?: boolean;
  payment_required_for_delivery?: boolean;
  auto_welcome_message?: boolean;
  welcome_message_template?: string | null;
}

export interface SessionFilters {
  page?: number;
  limit?: number;
  step?: SessionStep;
  search?: string;
  from_date?: string;
  to_date?: string;
  payment_status?: PaymentStatus;
}

export interface SubscriberFilters {
  business_id: number;
  status?: SubscriberStatus;
  tags?: string[];
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateSubscriberInput {
  business_id: number;
  phone_number: string;
  name?: string;
  status?: SubscriberStatus;
  tags?: string[];
}

export interface ImportSubscribersInput {
  business_id: number;
  subscribers: Array<{
    phone_number: string;
    name?: string;
    tags?: string[];
  }>;
  default_status?: SubscriberStatus;
  default_tags?: string[];
  skip_duplicates?: boolean;
}

export interface CampaignFilters {
  business_id: number;
  status?: CampaignStatus;
  page?: number;
  limit?: number;
}

export interface CreateCampaignInput {
  business_id: number;
  name: string;
  description?: string;
  template_name: string;
  template_language?: string;
  template_components?: any[];
  target_filters?: { tags?: string[] };
  scheduled_at?: string | null;
  batch_size?: number;
  delay_ms?: number;
}

export interface RunCampaignInput {
  phone_number_id: string;
}

// API Response Types
export interface ApiResponse<T> {
  status: number;
  message?: string;
  data: T;
}

export interface ApiError {
  status: number;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}
