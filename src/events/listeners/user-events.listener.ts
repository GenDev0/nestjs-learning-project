import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserEvent } from './user-events.service';

@Injectable()
export class UserEventsListener {
  private readonly logger = new Logger(UserEventsListener.name);

  @OnEvent('user.loggedIn')
  handleUserLoggedInEvent(event: UserEvent) {
    const { user, timestamp } = event;
    this.logger.log(
      `User logged in: ${user.username}: ${user.email} at ${timestamp.toISOString()}`,
    );
  }

  @OnEvent('user.registered')
  handleUserRegisteredEvent(event: UserEvent) {
    const { user, timestamp } = event;
    this.logger.log(
      `New user registered: ${user.username}: ${user.email} at ${timestamp.toISOString()}`,
    );
  }

  @OnEvent('user.updated')
  handleUserUpdatedEvent(event: UserEvent) {
    const { user, timestamp } = event;
    this.logger.log(
      `Welcome back, ${user.username}: ${user.email}! Your profile was updated at ${timestamp.toISOString()}`,
    );
  }

  @OnEvent('user.deleted')
  handleUserDeletedEvent(event: UserEvent) {
    const { user, timestamp } = event;
    this.logger.log(
      `User deleted: ${user.username}: ${user.email} at ${timestamp.toISOString()}`,
    );
  }
}
