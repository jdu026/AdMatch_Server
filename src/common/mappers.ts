import { CampaignEntity } from '../campaigns/entities/campaign.entity';
import { OfferEntity } from '../offers/entities/offer.entity';
import { ModelProfileEntity } from '../profiles/entities/model-profile.entity';
import { ReviewEntity } from '../reviews/entities/review.entity';
import { User } from '../user/entities/user.entity';

export type ModelProfileDto = {
  id: string;
  email: string;
  type: 'MODEL';
  name: string;
  age: number;
  height: number;
  category: string[];
  region: string;
  price: string;
  rating: number;
  reviewCount: number;
  avatar: string;
  images: string[];
  description: string;
  style: string;
};

export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export function toModelProfileDto(
  profile: ModelProfileEntity,
  user: User,
): ModelProfileDto {
  const images =
    profile.images.length > 0
      ? profile.images
      : [avatarUrl(user.username)];
  return {
    id: String(user.id),
    email: `${user.username}@local`,
    type: 'MODEL',
    name: profile.name,
    age: profile.age ?? 0,
    height: profile.height ?? 0,
    category: profile.category ?? [],
    region: profile.region ?? '',
    price: profile.price ?? '',
    rating: profile.rating,
    reviewCount: profile.reviewCount,
    avatar: images[0],
    images,
    description: profile.description ?? '',
    style: profile.style ?? '',
  };
}

export function toCampaignDto(c: CampaignEntity) {
  return {
    id: c.id,
    advertiserId: c.advertiserId,
    title: c.title,
    brand: c.brand,
    budget: c.budget,
    requirements: c.requirements,
    goals: c.goals ?? undefined,
    contentStyle: c.contentStyle ?? undefined,
    brandGuidelines: c.brandGuidelines ?? undefined,
    productDetails: c.productDetails ?? undefined,
    benefits: c.benefits ?? undefined,
    status: c.status,
    type: c.type,
    createdAt: c.createdAt.toISOString().split('T')[0],
  };
}

export function toOfferDto(o: OfferEntity) {
  return {
    id: o.id,
    campaignId: o.campaignId,
    advertiserId: o.advertiserId,
    modelId: o.modelId,
    price: o.price,
    status: o.status,
    createdAt: o.createdAt.toISOString().split('T')[0],
  };
}

export function toReviewDto(r: ReviewEntity) {
  return {
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    authorname: r.authorName,
    date: r.createdAt.toISOString().split('T')[0],
  };
}
