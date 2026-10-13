export type PlaySession = {
  _id: string;
  gameId: string;
  gameName: string;
  coverImage?: string;
  date: string;
  duration: number;
  notes: string;
  sessionType: string[];
  mood?: string[];
  platform?: string;
};
