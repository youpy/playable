import { Album, Artist, Tracks } from '../interfaces/album';

interface Image {
  url: string;
}

interface Item {
  album: AlbumItem;
}

interface AlbumItem {
  uri: string;
  external_ids: {
    upc: string;
  };
  added_at: string;
  images: Image[];
  name: string;
  artists: Artist[];
  external_urls: {
    spotify: string;
  };
  tracks: Tracks;
}

class AlbumImpl {
  #item: AlbumItem;

  constructor(item: AlbumItem) {
    this.#item = item;
  }

  get uri() {
    return this.#item.uri;
  }
  get addedAt() {
    return Date.parse(this.#item.added_at);
  }
  get imageUrl() {
    return this.#item.images[1].url;
  }
  get name() {
    return this.#item.name;
  }
  get artist() {
    return this.#item.artists[0];
  }
  get tracks() {
    return this.#item.tracks;
  }
}

interface Result {
  albums: Album[];
  total: number;
}

export class AlbumService {
  async get({ page }: { page: number }): Promise<Result> {
    const res = await fetch(`/api/albums?page=${page}`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error);
    } else {
      return {
        albums: (json.items as Item[]).map((item) => new AlbumImpl(item.album)),
        total: json.total,
      };
    }
  }
}
