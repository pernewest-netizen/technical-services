import { create } from 'zustand';
import { Season, Category, Product, Service, Machine, Material, Template, Tag } from '@/types';

interface DataState {
  seasons: Season[];
  categories: Category[];
  products: Product[];
  services: Service[];
  machines: Machine[];
  materials: Material[];
  tags: Tag[];
  templates: Template[];

  setSeasons: (seasons: Season[]) => void;
  setCategories: (categories: Category[]) => void;
  setProducts: (products: Product[]) => void;
  setServices: (services: Service[]) => void;
  setMachines: (machines: Machine[]) => void;
  setMaterials: (materials: Material[]) => void;
  setTags: (tags: Tag[]) => void;
  setTemplates: (templates: Template[]) => void;

  refreshAll: () => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  seasons: [],
  categories: [],
  products: [],
  services: [],
  machines: [],
  materials: [],
  tags: [],
  templates: [],

  setSeasons: (seasons) => set({ seasons }),
  setCategories: (categories) => set({ categories }),
  setProducts: (products) => set({ products }),
  setServices: (services) => set({ services }),
  setMachines: (machines) => set({ machines }),
  setMaterials: (materials) => set({ materials }),
  setTags: (tags) => set({ tags }),
  setTemplates: (templates) => set({ templates }),

  refreshAll: async () => {
    // Will be populated by API calls
  },
}));
