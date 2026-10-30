// Define the Game object used on components that uses game object to get info
export type Game = {
  _id: string;
  userId: string;
  gameId: string;
  title: string;
  genre: string[];
  availablePlatforms?: string[];
  platform?: string;
  coverImage: string;
  releaseDate: string;
  dateAdded?: string;
  status: string;
  platinum?: boolean;
  wishlist?: boolean;
  rating?: number;
  hoursPlayed?: number;
  startingDate?: string;
  completionDate?: string;
  notes?: string;
  hours?: number;
};
