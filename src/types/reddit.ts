export interface RedditResults {
    kind: string;
    data : RedditData 
}

export interface RedditData {
    after: string;
    dist: number;
    mdohash: string;
    geo_filter: string | null;
    before: string | null;
    children: RedditPost[];
}

export interface RedditPost {
    kind: string;
    data: RedditPostData;
}

export interface RedditPostData {
    approved_at_utc: number | null;
    subreddit: string;
    selftext: string;
    author_fullname: string;
    title: string;
    post_hint: string;
    url: string;
    author: string;
    is_video: boolean;
    created_utc: number;
}