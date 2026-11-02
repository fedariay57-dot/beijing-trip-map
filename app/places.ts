export type Place = {
  id: string;
  name: string;
  nameEn: string;
  nameZh: string;
  addressZh: string;
  description: string;
  price: string;
  day: string;
  days: string[];
  category: string;
  lat: number | null;
  lng: number | null;
  amapUrl: string;
  mapType: string;
  coordinateStatus: string;
};

