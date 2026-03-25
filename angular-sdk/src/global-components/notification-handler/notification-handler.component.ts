import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Params, AlgoNotification, NotificationListWithParams} from './notification-handler.service';
import {Subject} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import {AlgoIconComponent} from '../../design-elements/algo-icon/algo-icon/algo-icon.component';
import {apparitionAnimations} from "../../css/animations";
import {TimeUnit, TimeUtils} from '@algonomia/ts-shared';
import {ATemplateWithResizablesComponent} from "../../templates/template-resize-observer-component.abstract";

interface NotificationWithId {
    notification: AlgoNotification;
    id: string;
}

@Component({
    selector: 'app-notification-handler',
    templateUrl: './notification-handler.component.html',
    styleUrls: ['./notification-handler.component.scss'],
    standalone: true,
    imports: [
        TranslatePipe,
        AlgoIconComponent
    ],
    animations: apparitionAnimations,
})
export class NotificationHandlerComponent extends ATemplateWithResizablesComponent implements OnInit, OnDestroy {
    private stopSubject = new Subject<void>();

    public static regularMessageSubject = new Subject<NotificationListWithParams>();
    public static displayNotification = true;
    public notificationsStacks: DisplayNotificationsByStack[] = [];

    get displayNotification() {
        return NotificationHandlerComponent.displayNotification;
    }

    ngOnInit() {
        this.pipeTakeUntil(NotificationHandlerComponent.regularMessageSubject).subscribe((notificationListWithParams) => {
            const newStack = new DisplayNotificationsByStack(notificationListWithParams);
            this.notificationsStacks.push(newStack);

            this.pipeTakeUntil(newStack.completeSubject).subscribe((e) => {
                this.notificationsStacks = this.notificationsStacks.filter(x => x.uuid !== newStack.uuid);
            });
        });
    }
}

class DisplayNotificationsByStack {
    public params: Params;
    public readonly uuid = crypto.randomUUID();
    private waitingListNotifs: NotificationWithId[] = [];
    public displayedListNotifs: NotificationWithId[] = [];
    public completeSubject = new Subject<void>();

    public timeDisplay!: string;
    public timeOut!: NodeJS.Timeout;

    constructor(notificationListWithParams: NotificationListWithParams) {
        const identifiedNotifs = notificationListWithParams.notifications.map(x => {
            return { notification: x, id: crypto.randomUUID() };
        });

        this.params = notificationListWithParams.params;
        this.waitingListNotifs = identifiedNotifs;
        this.displayedListNotifs = [];

        for (let i = 0; i < notificationListWithParams.params.maxByStack; ++i) {
            this.addNotification();
        }

        this.countdown(this.params.timeout);
    }

    private addNotification() {
        if (this.waitingListNotifs.length === 0) {
            return;
        }

        const waitingNotification: NotificationWithId = this.waitingListNotifs.shift()!;
        this.displayedListNotifs.push(waitingNotification);

        if (this.displayedListNotifs.length > this.params.maxByStack) {
            this.displayedListNotifs.shift();
        }

        const waitingMessageTimeout = setTimeout(() => {
            if (this.displayedListNotifs.every(x => x.id !== waitingNotification.id)) {
                return;
            }

            if (!this.params.isPersistent) {
                this.deleteNotification(waitingNotification.id);
            }
        }, this.params.timeout);
    }

    deleteNotification(idOfNotification: string) {
        const idx = this.displayedListNotifs.findIndex(notif => notif.id === idOfNotification);
        this.displayedListNotifs.splice(idx, 1);
        this.addNotification();

        if (this.displayedListNotifs.length === 0 && this.waitingListNotifs.length === 0) {
            this.completeSubject.next();
        }
    }

    countdown(timeRemainingMS: number): void {
        const { minutes, seconds } = TimeUtils.toMinutesAndSeconds(timeRemainingMS);

        this.timeDisplay = minutes + '\'' + (seconds.toString().length === 1 ? '0' : '') + seconds;

        timeRemainingMS -= 1000;

        if (timeRemainingMS > 0) {
            this.timeOut = setTimeout(() => {
                this.countdown(timeRemainingMS);
            }, 1000);
        } else {
            clearTimeout(this.timeOut);
        }
    }
}
