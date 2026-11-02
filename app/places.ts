export type Place = {
  id: string;
  name: string;
  nameEn: string;
  nameZh: string;
  addressZh: string;
  description: string;
  price: string;
  day: string;
  category: string;
  lat: number | null;
  lng: number | null;
  amapUrl: string;
};

export const places: Place[] = [];