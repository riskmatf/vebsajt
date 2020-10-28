import { UserProfile } from '../profile/user-profile.model';

export interface Comment {
  author: UserProfile;
  date: Date;
  content: string;
}
