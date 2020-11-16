import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { UserProfile } from '../profile/user-profile.model';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  private readonly usersUrl = '/api/users/';

  public readonly user$ = new BehaviorSubject<UserProfile>(null);
  private token: string;

  constructor(private http: HttpClient, private router: Router) {
    this.user$.next(JSON.parse(localStorage.getItem('user-profile')));
  }

  private static extractUserIdFromJwtToken(token: string): string {
    const encodedPayload = token.split('.')[1];
    const rawPayload = atob(encodedPayload);
    const payload = JSON.parse(rawPayload);
    return payload.id;
  }

  private saveToken(token: string) {
    localStorage.setItem('auth-token', token);
    this.token = token;
  }

  public getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('auth-token');
    }
    return this.token;
  }

  private saveUserProfile(profile: UserProfile) {
    localStorage.setItem('user-profile', JSON.stringify(profile));
    this.user$.next(profile);
  }

  public async logout() {
    this.token = undefined;
    this.user$.next(null);
    window.localStorage.removeItem('auth-token');
    window.localStorage.removeItem('user-profile');

    await this.router.navigateByUrl('/');
  }

  public refreshProfile() {
    this.fetchProfile(this.user$.value._id);
  }

  private fetchProfile(id: string): void {
    this.http.get<UserProfile>(
      `api/users/${id}`,
    ).subscribe((profile) => {
      this.saveUserProfile(profile);
      this.user$.next(profile);
    });
  }

  public register(newUser: FormData): Promise<boolean> {
    const success = this.http.post(this.usersUrl + 'register', newUser, {observe: 'response'}).pipe(
      map((response: any) => {
        if (response.status === 200) {
          if (response.body.token) {
            const token = response.body.token;
            this.saveToken(token);
            const id = AuthenticationService.extractUserIdFromJwtToken(token);
            this.fetchProfile(id);

            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }),
      catchError(() => {
        return of(false);
      }));

    return success.toPromise();
  }

  /**
   * Upon successful login, returns true, saves the JWT token and attempts to fetch the user profile as a side-effect.
   *
   * @returns true upon successful login, false otherwise.
   */
  public login(email: string, password: string): Promise<boolean> {

    const credentialsPayload = {email, password};

    // TODO error appears in the console when the server returns status 400, we should look into suppressing
    //  that error to avoid noise in the console.
    const observable = this.http.post(this.usersUrl + 'login', credentialsPayload, {observe: 'response'}).pipe(
      map((response: any) => {
        if (response.status === 200) {
          const body: any = response.body;
          if (body.token) {
            this.saveToken(body.token);
            const id = AuthenticationService.extractUserIdFromJwtToken(body.token);
            this.fetchProfile(id);

            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }),
      catchError(() => {
        return of(false);
      })
    );

    return observable.toPromise();
  }

  public update(newUser: FormData): Promise<boolean> {
    const success = this.http.put(this.usersUrl + this.user$.value._id, newUser, {observe: 'response'}).pipe(
      map((response: any) => response.status === 200),
      catchError(() => {
        return of(false);
      }));

    return success.toPromise();
  }

  public async followUser(id: string) {
    const currentUserId = this.user$.value._id;

    await this.http.put(this.usersUrl + 'follow/' + id, {currentUserId}).toPromise();
  }

  public async unfollowUser(id: string) {
    const currentUserId = this.user$.value._id;

    await this.http.put(this.usersUrl + 'unfollow/' + id, {currentUserId}).toPromise();
  }

  public resetPassword(email: string): Promise<boolean> {
    const success = this.http.post(this.usersUrl + 'reset-password', { email }, {observe: 'response'}).pipe(
      map( response => response.status === 200),
      catchError(() => {
        return of(false);
      }));

    return success.toPromise();
  }

  public validPasswordToken(token: string): Promise<boolean> {
    const success = this.http.post(this.usersUrl + 'validate-password-token/' + token, '', {observe: 'response'}).pipe(
      map( response => response.status === 200),
      catchError(() => {
        return of(false);
      }));

    return success.toPromise();
  }

  public newPassword(newPassword: string, resetToken: string): Promise<boolean> {
    const success = this.http.post(this.usersUrl + 'set-new-password', {newPassword, resetToken}, {observe: 'response'}).pipe(
      map( response => response.status === 200),
      catchError(() => {
        return of(false);
      }));

    return success.toPromise();
  }

  public changePassword(newPassword: string, oldPassword: string) {
    const success = this.http.post(this.usersUrl + 'change-password/' + this.user$.value._id, {newPassword, oldPassword}, {observe: 'response'}).pipe(
      map( response => response.status === 200),
      catchError(() => {
        return of(false);
      }));

    return success.toPromise();
  }
}
