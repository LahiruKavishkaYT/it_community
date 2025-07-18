import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get('GITHUB_CLIENT_ID');
    const clientSecret = configService.get('GITHUB_CLIENT_SECRET');
    
    console.log('GitHub OAuth Configuration:', {
      clientID: clientID ? 'Set' : 'Not set',
      clientSecret: clientSecret ? 'Set' : 'Not set',
    });
    
    super({
      clientID: clientID || '',
      clientSecret: clientSecret || '',
      callbackURL: '/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const { username, emails, photos, id } = profile;
    
    const oauthUser = {
      githubId: id,
      email: emails[0]?.value,
      name: profile.displayName || username,
      avatar: photos[0]?.value,
      provider: 'github',
    };

    try {
      const user = await this.authService.validateOAuthUser(oauthUser);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
