import { Comment } from './comments.model';
import { UserProfile } from '../profile/user-profile.model';

export interface BlogPost {
  _id: string;
  title: string;
  author: UserProfile;
  date: Date;
  headerImageFullRes: string;
  headerImageThumbnail: string;
  description: string;
  content: string;
  urlId: string;
  tags: string[];
  comments: Comment[];
}
