
export enum ViewState {
  HOME = 'HOME',
  PHOTOS = 'PHOTOS',
  VIDEOS = 'VIDEOS',
  STORE = 'STORE',
  CHAT = 'CHAT',
  COMMENTS = 'COMMENTS',
  SUPPORT = 'SUPPORT',
  PROFILE = 'PROFILE',
  AUTH = 'AUTH',
  PRODUCT_DETAILS = 'PRODUCT_DETAILS',
  SEARCH = 'SEARCH',
  NOTIFICATIONS = 'NOTIFICATIONS',
  QR_SCANNER = 'QR_SCANNER',
  LEGAL = 'LEGAL',
  ADVISOR = 'ADVISOR'
}

export enum UserRole {
  USER = 'USER',
  PROXY = 'PROXY',
  INSTITUTION = 'INSTITUTION',
  ADMIN = 'ADMIN'
}

export type SubscriptionPlan = 'FREE' | 'STARTER' | 'ECONOMY' | 'PREMIUM' | 'ELITE';
export type SubscriptionPeriod = 'DAILY' | 'MONTHLY' | 'YEARLY';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  role: UserRole;
  points: number;
  isVerified: boolean;
  location: string;
  currency: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionPeriod?: SubscriptionPeriod;
  subscriptionExpiry?: number;
  bio?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: 'WHEELCHAIR' | 'SERVICE' | 'OTHER';
  priceType: 'FREE' | 'PAID';
  price: number;
  currency: string;
  location: string;
  ownerId: string;
  ownerName?: string;
  qrCode: string;
  status: 'AVAILABLE' | 'SOLD' | 'DONATED';
  mediaType: 'IMAGE' | 'VIDEO';
  timestamp: number;
  paymentMethods?: ('CASH' | 'CRYPTO')[];
}

export interface CryptoWallet {
  name: string;
  address: string;
  symbol: string;
  icon?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  type: 'TEXT' | 'LOCATION' | 'VIDEO' | 'AUDIO';
  mediaUrl?: string;
}

export interface ChatSession {
  id: string;
  participantId: string;
  participantName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'HELP' | 'SUCCESS_STORY';
  likes: number;
  commentsCount: number;
  timestamp: number;
}
