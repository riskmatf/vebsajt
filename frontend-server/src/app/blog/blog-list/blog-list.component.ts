import { Component, Input, OnInit } from '@angular/core';
import { BlogPost } from '../blog-post.model';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css', '../../app.component.css']
})

export class BlogListComponent {
  @Input()
  public blogPosts: BlogPost[];

  @Input()
  public layout: 'row wrap' | 'column';

  constructor(public auth: AuthenticationService) {}
}
