import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BlogPost } from '../blog/blog-post.model';
import { BlogService } from '../blog/blog.service';
import { MeetingsService } from '../meetings/meetings.service';
import { AuthenticationService } from '../services/authentication.service';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css', '../app.component.css']
})

export class HomeComponent implements OnInit {

  public latestPost: BlogPost;
  public followingBlogPosts$: Observable<BlogPost[]>;

  constructor(private blogService: BlogService,
              public meetingService: MeetingsService,
              public auth: AuthenticationService) { }

  ngOnInit(): void {

    this.blogService.getBlogPosts()
      .pipe(take(1))
      .subscribe(posts => this.latestPost = posts[posts.length - 1]);

    const profile = this.auth.getUserProfile();

    if (profile) {
      this.followingBlogPosts$ = this.blogService.getBlogPostsByFollowing(profile).pipe(
        map(posts => posts.reverse())
      );
    }
  }
}
