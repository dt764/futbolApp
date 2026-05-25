import { EventEmitter } from '../../stencil-public-runtime';
export interface Player {
    _id: string;
    name: string;
    firstname?: string;
    lastname?: string;
    nationality?: string;
    position?: string;
    birthDate?: string;
    height?: string;
    weight?: string;
    photo?: string;
    team?: string;
    league?: string;
    location?: {
        lat: number;
        lng: number;
        address?: string;
    };
}
export interface Comment {
    _id: string;
    author: string;
    text: string;
    rating: number;
    createdAt: string;
    location?: {
        lat: number;
        lng: number;
    };
}
export declare class PlayerDetail {
    player?: Player | null;
    comments: Comment[];
    isAdmin: boolean;
    loading: boolean;
    commentLoading: boolean;
    error: string;
    loggedInUser?: string;
    addComment: EventEmitter<{
        author: string;
        text: string;
        rating: number;
        location?: {
            lat: number;
            lng: number;
        };
    }>;
    deleteComment: EventEmitter<string>;
    editPlayer: EventEmitter<void>;
    deletePlayer: EventEmitter<void>;
    commentAuthor: string;
    commentText: string;
    commentRating: number;
    hoverRating: number;
    commentLocation: {
        lat: number;
        lng: number;
    } | null;
    locationLoading: boolean;
    commentTextError: string;
    commentAuthorError: string;
    get averageRating(): number;
    get playerName(): string;
    stars(rating: number): number[];
    hasValidLocation(loc?: {
        lat: number;
        lng: number;
    } | null): boolean;
    mapsUrl(lat: number, lng: number): string;
    useCurrentLocation(): void;
    handleSubmit(e: Event): void;
    handleDelete(commentId: string): void;
    render(): any;
}
