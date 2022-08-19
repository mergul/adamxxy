import {Identifier} from './Identifier.model';
export class NewsPayload {
    private _newsId: string;
    private _newsOwner: string;
    private _tags: string[];
    private _topics: string[];
    private _clean: boolean;
    private _newsOwnerId: string;
    private _ownerUrl: string;
    private _topic: string;
    private _thumb: string;
    private _date: number;
    private _count: number;
    constructor(newsId: string, newsOwner: string, tags: string[], topics: string[], clean: boolean, newsOwnerId: string, ownerUrl: string,
                topic: string, thumb: string, count: number, date: number) {
        this._newsId = newsId;
        this._newsOwner = newsOwner;
        this._tags = tags;
        this._topics = topics;
        this._clean = clean;
        this._date = date;
        this._newsOwnerId = newsOwnerId;
        this._ownerUrl = ownerUrl;
        this._thumb = thumb;
        this._topic = topic;
        this._count = count;
    }
    get newsId(): string {
        return this._newsId;
    }

    set newsId(value: string) {
        this._newsId = value;
    }
    get count(): number {
        return this._count;
    }
    get topics(): string[] {
        return this._topics;
    }

    set topics(value: string[]) {
        this._topics = value;
    }

    get newsOwner(): string {
        return this._newsOwner;
    }

    set newsOwner(value: string) {
        this._newsOwner = value;
    }

    get tags(): string[] {
        return this._tags;
    }

    set tags(value: string[]) {
        this._tags = value;
    }
    get clean(): boolean {
        return this._clean;
    }

    set clean(value: boolean) {
        this._clean = value;
    }
    get newsOwnerId(): string {
        return this._newsOwnerId;
    }
    get ownerUrl(): string {
        return this._ownerUrl;
    }
    get topic(): string {
        return this._topic;
    }

    get thumb(): string {
        return this._thumb;
    }

    get date(): number {
        return this._date;
    }
}
export interface News {
    id: string;
    ownerId: string;
    owner: string;
    ownerUrl: string;
    topic: string;
   // thumbnails: Array<ThumbModel>;
    summary: string;
    mediaParts: Array<Identifier>;
    mediaReviews: Array<Review>;
    tags: Array<string>;
   // highlights: string;
    count: string;
    date: number;
    clean: boolean;
}

export class Review {
    public file_name: string;
    private doc_description: string;
    private doc_name: string;
    private file_type: string;
    private has_medium: boolean;

    constructor(fileName: string = '', desc: string = '', docName: string = '', fileType: string = '', hasMedium: boolean = false) {
        this.file_name = fileName;
        this.doc_description = desc;
        this.doc_name = docName;
        this.file_type = fileType;
        this.has_medium = hasMedium;
    }
}

export class NewsFeed {

    private mediaReviews: Array<Review>;
    private summary: string;
    private topic: string;
    private tags: Array<string>;
    private mediaParts: Array<string>;
  //  private _thumbnails: Array<ThumbModel>;
    private date: number;

    constructor(summary: string, topic: string, tags: string[], mediaReviews: Review[], mediaParts: string[], date: number) {
        this.mediaReviews = mediaReviews;
        this.summary = summary;
        this.topic = topic;
      //  this._thumbnails = thumbnails;
        this.date = date;
        this.mediaParts = mediaParts;
        this.tags = tags == null ? [''] : tags.map(function (item) {
            return item.trim(); // .replace('#', '');
         });
    }

}
