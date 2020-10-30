import { Component, OnInit } from '@angular/core';
import { BlogService } from '../blog.service';
import { BlogPost } from '../blog-post.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  public blogPosts$: Observable<BlogPost[]>;

  constructor(private blogService: BlogService) { }

  ngOnInit() {
    this.blogPosts$ = this.blogService.getBlogPosts();
  }
}
