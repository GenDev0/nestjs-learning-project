import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserEventsService } from './listeners/user-events.service';
import { UserEventsListener } from './listeners/user-events.listener';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      global: true,
      wildcard: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
  ],
  providers: [UserEventsService, UserEventsListener],
  exports: [UserEventsService],
})
export class EventsModule {}
