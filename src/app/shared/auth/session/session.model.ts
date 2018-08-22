import { Permission } from './permission.enum';
import { UserType } from './user-type.enum';


export interface JwtData {
  sub: string;
  uid: string;
  exp: number;
  nbf: number;
  jti: string;
  utype: string;
  tid: string;
  perm: string[];
}


/**
 * Contains session data which gets also persisted in sessionStore
 */
export class Session {
  /**
   * Creates a session based on the data as delivered by the JWT token
   */
  static fromJWT(jwt: JwtData): Session {
    const expiry: Date = new Date(0); // the 0 here is the key, which sets the date to the epoch
    expiry.setUTCSeconds(jwt.exp);

    const notBefore: Date = new Date(0);
    notBefore.setUTCSeconds(jwt.nbf);

    return new Session(jwt.sub, jwt.uid, jwt.tid, jwt.jti, expiry,
      // unfortunately this triple <any> cast is necessary ...
      <any>UserType[<any>UserType[<any>jwt.utype]],
      convertRoles(jwt.perm));
  }

  constructor(public user: string,
              public userId: string,
              public tenantId: string,
              public jti: string,
              public expiry: Date,
              public userType: UserType,
              public perm: Permission[]) {
  }
}

function convertRoles(roles: string[]): Permission[] {
  // use role as any, because if you would define it as string, TS would interpret it as the label of
  // the enum: Permission[Permission.READ] => "READ"
  return roles.map((role: any): Permission => {
    if (!Permission[role]) {
      console.error('Role-map error: Could not find corresponding enumeration for role: ' + role);
    }

    // double cast needed as this enum resolve with strings still does not work... :/
    return <any>Permission[<any>Permission[role]];
  });
}
