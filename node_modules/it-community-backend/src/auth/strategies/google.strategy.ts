import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');
    
    console.log('Google OAuth Configuration:', {
      clientID: clientID ? 'Set' : 'Not set',
      clientSecret: clientSecret ? 'Set' : 'Not set',
    });
    
    super({
      clientID: clientID || '',
      clientSecret: clientSecret || '',
      callbackURL: '/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    
    const oauthUser = {
      googleId: id,
      email: emails[0]?.value,
      name: `${name.givenName} ${name.familyName}`,
      avatar: photos[0]?.value,
      provider: 'google',
    };

    try {
      const user = await this.authService.validateOAuthUser(oauthUser);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
