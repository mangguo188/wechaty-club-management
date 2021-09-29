import TypedEventEmitter from 'typed-emitter';
import { Contact, Friendship, Message } from '../user/mod';
export declare type ContactMessageEventListener = (this: Contact, message: Message, date?: Date) => void;
export declare type ContactFriendshipEventListener = (friendship: Friendship) => void;
interface ContactEvents {
    friendship: ContactFriendshipEventListener;
    message: ContactMessageEventListener;
}
export declare const ContactEventEmitter: new () => TypedEventEmitter<ContactEvents>;
export {};
//# sourceMappingURL=contact-events.d.ts.map