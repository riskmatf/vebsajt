import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BlogPost } from '../blog/blog-post.model';
import { BlogService } from '../blog/blog.service';
import { MeetingsService } from '../meetings/meetings.service';
import { AuthenticationService } from '../services/authentication.service';
import { map, mergeMap, take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css', '../app.component.css']
})

export class HomeComponent implements OnInit {

  public latestPost$: Observable<BlogPost>;
  public followingBlogPosts$: Observable<BlogPost[]>;

  constructor(private blogService: BlogService,
              public meetingService: MeetingsService,
              public auth: AuthenticationService,
              public dialog: MatDialog) { }

  ngOnInit(): void {

    this.latestPost$ = this.blogService.blogPosts$
      .pipe(
        take(1),
        map(posts => posts[posts.length - 1])
      );

    this.followingBlogPosts$ = this.auth.user$.pipe(
      mergeMap(user => user ? this.blogService.getBlogPostsByFollowing(user) : of([]))
    );
  }

  openRegisterDialog() {
    this.dialog.open(RegisterComponent);
  }
}
