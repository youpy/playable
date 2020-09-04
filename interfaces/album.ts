export interface Artist {
  name: string;
}

export interface Track {
  uri: string;
}

export interface Tracks {
  items: Track[];
}

export interface Album {
  uri: string;
  addedAt: number;
  imageUrl: string;
  name: string;
  artist: Artist;
  tracks: Tracks;
}
