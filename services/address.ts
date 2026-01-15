import axios, { AxiosError } from "axios";

const GETADDRESS_API_KEY = "SI16mDNPB0KtCQBa5hZn6Q49043";
const GETADDRESS_API_URL = "https://api.getaddress.io";

// Create a separate axios instance for getaddress.io API
const addressApiClient = axios.create({
  baseURL: GETADDRESS_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface AddressSuggestion {
  formatted_address: string[];
  thoroughfare: string;
  building_name: string;
  sub_building_name: string;
  sub_building_number: string;
  building_number: string;
  line_1: string;
  line_2: string;
  line_3: string;
  line_4: string;
  locality: string;
  town_or_city: string;
  county: string;
  district: string;
  country: string;
  postcode: string;
}

export interface AddressResponse {
  postcode: string;
  latitude: number;
  longitude: number;
  addresses: AddressSuggestion[];
}

export const searchAddressByPostcode = async (
  postcode: string
): Promise<AddressResponse> => {
  const cleanPostcode = postcode.replace(/\s+/g, "").toUpperCase();
  
  try {
    const response = await addressApiClient.get<AddressResponse>(
      `/find/${cleanPostcode}?api-key=${GETADDRESS_API_KEY}`
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.Message || 
                          error.response?.data?.message || 
                          error.message || 
                          "Address lookup failed";
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const autocompleteAddress = async (
  searchTerm: string
): Promise<AddressSuggestion[]> => {
  try {
    const response = await addressApiClient.get<{ suggestions: AddressSuggestion[] }>(
      `/autocomplete/${encodeURIComponent(searchTerm)}?api-key=${GETADDRESS_API_KEY}`
    );
    return response.data.suggestions || [];
  } catch (error: any) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.Message || 
                          error.response?.data?.message || 
                          error.message || 
                          "Address autocomplete failed";
      throw new Error(errorMessage);
    }
    throw error;
  }
};
