// Define the Journal Entry object used on both Journal Page and modal with the props
export type JournalEntry = {
  _id: string;
  uuid: string;
  gameId: string;
  gameName: string;
  coverImage?: string;
  title: string;
  displayDate: string;
  content: string;
  entryType: string;
  tags: string[];
};
