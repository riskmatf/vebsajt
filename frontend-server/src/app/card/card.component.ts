import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {

  @Input()
  public routerLink: string;

  @Input()
  public headerImage: string;

  @Input()
  public avatarImage: string;

  @Input()
  public title: string;

  @Input()
  public subtitle: string;

  @Input()
  public content: string;

  constructor() { }
}
