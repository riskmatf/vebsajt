import { Component, OnInit, Input, Output } from '@angular/core';
import { Meeting } from '../meeting.model';
import { Button } from './button.model';
import { EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})
export class MeetingComponent implements OnInit {

  @Input() 
  public meeting: Meeting;
  public buttons: Button[] = [];

  @Output()
  public emitMeetingToDelete: EventEmitter<string> = new EventEmitter<string>();

  constructor(private router: Router, public auth: AuthenticationService) { }

  ngOnInit(): void {
    if (!this.meeting.authorImage) {
      this.meeting.authorImage = 'assets/generic_user.jpeg';
    }

    const urls = [[this.meeting.githubRepoUrl, 'githubRepoUrl'],
                  [this.meeting.surveyUrl, 'surveyUrl'],
                  [this.meeting.videoUrl, 'videoUrl'],
                  [this.meeting.presentationUrl, 'presentationUrl']];
                  
    this.buttons = urls.filter((url) => { if (url[0] !== null) return true; })
                       .map((url) => { return new Button(url[0], url[1]); });
  }

  public goToAuthorPage() {
    if (this.meeting.authorID) {
      this.router.navigate(['/profil', this.meeting.authorID]);
    }
  }

  public onDeleteMeeting() {
    this.emitMeetingToDelete.emit(this.meeting._id);
  }
}
