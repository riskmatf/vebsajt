import { Injectable } from '@angular/core';
import { HttpErrorHandler } from '../utils/http-error-handler.model';
import { Observable, of } from 'rxjs';
import { BlogPost } from './blog-post.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { UserProfile } from '../profile/user-profile.model';

export enum ApiError {
  URL_NOT_UNIQUE
}

@Injectable({
  providedIn: 'root'
})
export class BlogService extends HttpErrorHandler {
  public readonly blogPosts$: Observable<BlogPost[]>;
  private readonly blogPostsUrl = '/api/blogPosts/';

  constructor(private http: HttpClient, router: Router) {
    super(router);

    this.blogPosts$ = this.http.get<BlogPost[]>(this.blogPostsUrl)
      .pipe(
        catchError(super.handleError())
      );
  }

  // TODO migrate this to a backend API call.
  public getBlogPostsByFollowing(user: UserProfile): Observable<BlogPost[]> {
    return this.blogPosts$.pipe(
      map(posts =>
        posts.filter(post => user.following.includes(post.author._id) || user._id === post.author._id)
      )
    );
  }

  public getBlogPostById(id: string): Observable<BlogPost> {
    return this.http
      .get<BlogPost>(this.blogPostsUrl + id)
      .pipe(catchError(super.handleError()));
  }

  public async getBlogPostsByAuthorId(id: string) {
    return await this.blogPosts$.pipe(map(
      posts => posts.filter(post => post.author._id === id)
    )).toPromise();
  }

  public createBlogPost(data): Observable<BlogPost | ApiError> {
    return this.http
      .post<BlogPost>(this.blogPostsUrl, data)
      .pipe(catchError((errorResponse: HttpErrorResponse) => {
          if (errorResponse.error.message === 'Post with a similar title already exists') {
            return of(ApiError.URL_NOT_UNIQUE);
          }
      }));
  }
}
