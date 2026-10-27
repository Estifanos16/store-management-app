export type Role = 'OWNER' | 'SELLER';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  memberships?: Array<{
    shopId: string;
    role: Role;
    shop?: {
      id: string;
      name: string;
      currency: string;
    };
  }>;
};
