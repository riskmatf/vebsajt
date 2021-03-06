import { Comment } from '../blog/comments.model';

export class Meeting {

    constructor(public _id: string,
                public title: string,
                public authorName: string,
                public authorID: string,
                public authorImage: string,
                public date: string,
                public description: string,
                public githubRepoUrl: string,
                public posterUrl: string,
                public presentationUrl: string,
                public photosUrl: string,
                public videoUrl: string,
                public surveyUrl: string,
                public tags: [string],
                public comments: [Comment]) {}

}