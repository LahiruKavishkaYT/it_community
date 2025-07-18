import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If user is not authenticated, simply return null so that routes can still be accessed publicly
    if (err || !user) {
      return null;
    }
    return user;
  }
} 