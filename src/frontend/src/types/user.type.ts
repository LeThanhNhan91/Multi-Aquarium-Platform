export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  coverUrl: string | null;
}
