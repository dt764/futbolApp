import { GeoLocation } from './player.models';

export interface Comment {
  _id: string;
  author: string;
  text: string;
  rating: number;
  createdAt: string;
  location?: Pick<GeoLocation, 'lat' | 'lng'>;
}

export interface CommentsResponse {
  comments: Comment[];
}
