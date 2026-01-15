export interface UserRole {
  role_id: number;
  name: string;
  description: string;
}

export interface UserPermission {
  permission_id: number;
  name: string;
  description: string;
}

export interface UserBusiness {
  business_id: number;
  businessname: string;
  businesstype: string;
  tin: string;
  website: string;
  business_registration_number: string;
  product_service: string;
  product_description: string;
  created_at: string;
}

export interface UserStore {
  store_id: number;
  name: string;
  description: string;
  business_id: number;
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  address_id: number;
  addressline1: string;
  addressline2: string | null;
  addressline3: string | null;
  city: string;
  country: string;
  postcode: string;
}

export interface UserData {
  user_id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  altphone: string | null;
  position: string;
  isVerify: boolean;
  created_at: string;
  role: UserRole;
  permissions: UserPermission[];
  business: UserBusiness;
  stores: UserStore[];
  address: UserAddress;
  role_id: number;
  business_id: number;
  store_id: number;
}

export interface AuthResponse {
  status: number;
  data: {
    token: string;
    refreshToken: string;
    user: UserData;
  };
}
