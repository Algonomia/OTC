import {animate, style, transition, trigger} from '@angular/animations';

export const apparitionAnimations = [
    trigger(
        'transformRight',
        [
            transition(
                ':enter',
                [
                    style({ transform: 'translateX(100%)' }),
                    animate('0.3s ease-out', style({ transform: 'translateX(0)' }))
                ]
            ),
            transition(
                ':leave',
                [
                    animate('0.3s ease-out', style({ transform: 'translateX(100%)' }))
                ]
            )
        ]
    ),
    trigger(
        'fromLeftAnim',
        [
            transition(
                ':enter',
                [
                    style({ width: 0, overflow: 'hidden'}),
                    animate('0.3s ease-out', style({ width: '*' }))
                ]
            ),
            transition(
                ':leave',
                [
                    style({ width: '*', overflow: 'hidden'}),
                    animate('0.3s ease-in', style({ width: 0 }))
                ]
            )
        ]
    ),
    trigger(
        'opacity',
        [
            transition(
                ':enter',
                [
                    style({ opacity: 0, overflow: 'hidden'}),
                    animate('0.3s ease-out', style({ opacity: 1 }))
                ]
            ),
            transition(
                ':leave',
                [
                    style({ opacity: 1, overflow: 'hidden'}),
                    animate('0.3s ease-in', style({ opacity: 0 }))
                ]
            )
        ]
    ),
    trigger(
        'transformLeft',
        [
            transition(
                ':enter',
                [
                    style({ transform: 'translateX(-100%)', opacity: 0 }),
                    animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
                ]
            ),
            transition(
                ':leave',
                [
                    animate('300ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
                ]
            )
        ]
    ),
    trigger(
        'expandCollapse',
        [
            transition(
                ':enter',
                [
                    style({ height: 0, opacity: 0, overflow: 'hidden' }),
                    animate('300ms ease-in-out', style({ height: '*', opacity: 1 }))
                ]
            ),
            transition(
                ':leave',
                [
                    style({ height: '*', opacity: 1, overflow: 'hidden' }),
                    animate('300ms ease-in-out', style({ height: 0,  opacity: 0 }))
                ]
            )
        ]
    )
];
