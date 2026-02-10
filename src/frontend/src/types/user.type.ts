export type UserRole = "Customer" | "StoreOwner" | "Admin";

export type UserStatus = "Active" | "Inactive" | "Banned";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string | null;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string | null;
  coverUrl: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

export interface UpdateImageResponse {
  message: string;
}
