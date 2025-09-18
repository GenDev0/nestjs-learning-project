import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/users/entities/user.entity';

export interface UserEvent {
  user: { id: number; username: string; email: string };
  timestamp: Date;
}

@Injectable()
export class UserEventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  // Emit an event when a user is created
  emitUserRegisteredEvent(user: User): void {
    const userRegisteredEventData: UserEvent = {
      user: { id: user.id, username: user.username, email: user.email },
      timestamp: new Date(),
    };
    this.eventEmitter.emit('user.registered', userRegisteredEventData);
  }

  // Emit an event when a user is updated
  emitUserUpdatedEvent(user: User) {
    const updatedUserData: UserEvent = {
      user: { id: user.id, username: user.username, email: user.email },
      timestamp: new Date(),
    };
    this.eventEmitter.emit('user.updated', updatedUserData);
  }

  // Emit an event when a user is deleted
  emitUserDeletedEvent(user: User) {
    const deletedUserData: UserEvent = {
      user: { id: user.id, username: user.username, email: user.email },
      timestamp: new Date(),
    };
    this.eventEmitter.emit('user.deleted', deletedUserData);
  }

  // Emit an event when a user logs in
  emitUserLoggedInEvent(user: User) {
    const userLoggedInEventData: UserEvent = {
      user: { id: user.id, username: user.username, email: user.email },
      timestamp: new Date(),
    };
    this.eventEmitter.emit('user.loggedIn', userLoggedInEventData);
  }
}
