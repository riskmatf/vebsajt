import { Component, Input } from '@angular/core';
import { BlogPost } from '../blog-post.model';

@Component({
  selector: 'app-blog-post-card',
  templateUrl: './blog-post-card.component.html',
  styleUrls: ['./blog-post-card.component.css']
})
export class BlogPostCardComponent {

  @Input()
  public blogPost: BlogPost;

  constructor() { }

}
