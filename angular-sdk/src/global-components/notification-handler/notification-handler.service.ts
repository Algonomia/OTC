import {TranslateService} from '@ngx-translate/core';
import {NotificationHandlerComponent} from './notification-handler.component';
import {AppInjector} from '../../injector';

export interface AlgoNotification {
    title?: string;
    message: string;
    warnLevel: WarnLevel;
    actions?: {
        actionName: string;
        callback: (comp: any) => void
    }[];
    actionClose?: boolean;
}

export interface Params {
    timeout: number;
    maxByStack: number;
    isClosable: boolean;
    isPersistent?: boolean;
    isTimer?: boolean;
}

export interface NotificationListWithParams {
    notifications: AlgoNotification[];
    params: Params;
}

export interface NotifsFormatter {
    format: (a: any) => AlgoNotification[];
}

interface NotifBroadcasterAbstract {
    send: Function;
}

export class WarnLevel {
    static readonly simpleWarnLevel: WarnLevel = new WarnLevel('simple', '', 'neutral');
    static readonly warningWarnLevel: WarnLevel = new WarnLevel('warning', 'assets/images/Warning.png', 'warning');
    static readonly errorWarnLevel: WarnLevel = new WarnLevel('error', 'assets/images/Error.png', 'error');
    static readonly sendableErrorWarnLevel: WarnLevel = new WarnLevel('sendableError', 'assets/images/Error.png', 'error');
    private constructor(public readonly id: string, public readonly image: string, public readonly theme: string) {}
}

export class BasicFormatterWithTranslate implements NotifsFormatter {
    constructor(private _translate: TranslateService) {}
    format(notifications: AlgoNotification[]): AlgoNotification[] {
        return notifications.map(content => ({
            title: content.title && this._translate.instant(content.title),
            message: content.message !== '' ? this._translate.instant(content.message) : content.message,
            warnLevel: content.warnLevel,
            actions: content.actions,
            actionClose: content.actionClose
        }));
    }
}

export class SimpleNotifBroadcaster implements NotifBroadcasterAbstract {
    private static _defaultSimpleNotifBroadcaster?: SimpleNotifBroadcaster;

    private static get defaultSimpleNotifBroadcaster(): SimpleNotifBroadcaster {
        if (!this._defaultSimpleNotifBroadcaster) {
            this._defaultSimpleNotifBroadcaster = new SimpleNotifBroadcaster(
                new BasicFormatterWithTranslate(AppInjector.get(TranslateService))
            );
        }
        return this._defaultSimpleNotifBroadcaster;
    }

    static sendMessageOnDefaultChannel(message: string, warnLevel: WarnLevel, title?: string, actions: AlgoNotification['actions'] = []) {
        this.defaultSimpleNotifBroadcaster.send([{
            message: message,
            title: title,
            warnLevel: warnLevel,
            actions: actions
        }]);
    }

    constructor(
        public formatter: NotifsFormatter, public params: Params = { timeout: 10000, isClosable: true, maxByStack: 1 }
    ) {}

    send(messageList: AlgoNotification[]) {
        const formattedMessageList = this.formatter.format(messageList);
        const messagesWithParams = {
            params: this.params,
            notifications: formattedMessageList
        };
        NotificationHandlerComponent.regularMessageSubject.next(messagesWithParams);
    }
}
