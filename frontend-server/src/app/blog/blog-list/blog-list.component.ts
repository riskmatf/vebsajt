import { Component, Input, OnInit } from '@angular/core';
import { BlogPost } from '../blog-post.model';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css', '../../app.component.css']
})

export class BlogListComponent implements OnInit {
  @Input()
  public blogPosts: BlogPost[];

  @Input()
  public context: 'profile' | 'homepage' | 'blog';

  public isProfile: boolean;

  constructor(public auth: AuthenticationService) {}

  ngOnInit(): void {
    this.isProfile = this.context === 'profile';
  }

}
