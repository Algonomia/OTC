export interface ILinkedInUser {
    firstname: string;
    lastname: string;
    email: string;
    email_verified: boolean;
    country: string;
    language: string;
    picture: string;
}

export interface IUserManualUpdate {
    job: string | null;
    company: string | null;
    phone: string | null;
    pro_email: string | null;
}

export type TPartialUserManualUpdate = Partial<IUserManualUpdate>;

export interface IUserCGU {
    cgu: boolean;
}

export type TUser = ILinkedInUser & IUserManualUpdate & IUserCGU & { id: string };

export namespace UserUtils {
    export function getUserFullName(user: {firstname?: string, lastname?: string}) {
        if (!user?.lastname) {
            return user?.firstname ?? '';
        } else if (!user?.firstname) {
            return user?.lastname ?? '';
        }
        return [
            user?.firstname?.charAt(0)?.toUpperCase(),
            [
                user?.lastname?.charAt(0)?.toUpperCase() ?? '',
                user?.lastname?.slice(1) ?? ''
            ].join('')
        ].join('.');
    }
}
