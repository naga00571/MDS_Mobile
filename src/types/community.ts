export interface Community {
  id: number;
  community_name: string;
  address: string;
  address2: string | null;
  latitude: number | null;
  longitude: number | null;
  poc_name: string;
  poc_number: string;
}