import { JwtData, Session } from './session.model';
import { Permission } from './permission.enum';
import { UserType } from './user-type.enum';

describe('Session Model', () => {

  it('should parse a token and create a Session object', () => {
    const exampleToken: JwtData = {
      sub: 'program@demo',
      uid: '33',
      jti: 'n6rhKcIJn4Wk',
      nbf: 1455119895,
      exp: 1455123495,
      utype: UserType.DEFAULT,
      tid: '666',
      perm: [Permission.TEST]
    };

    const session: Session = Session.fromJWT(exampleToken);

    expect(session).toBeDefined();
    expect(session.expiry instanceof Date).toBeTruthy();
    expect(session.user).toBe('program@demo');
    expect(session.userId).toBe('33');
    expect(session.jti).toBe('n6rhKcIJn4Wk');
    expect(session.userType).toBe(UserType.DEFAULT);
    expect(session.tenantId).toBe('666');
    expect(session.perm).toContain(Permission.TEST);
  });

  it('should log an unknown role and continue silently', () => {
    const exampleToken: JwtData = {
      sub: 'program@demo',
      uid: '33',
      jti: 'n6rhKcIJn4Wk',
      nbf: 1455119895,
      exp: 1455123495,
      utype: UserType.DEFAULT,
      tid: '666',
      perm: [Permission.TEST, 'unknown_perm']
    };
    spyOn(console, 'error');

    const session: Session = Session.fromJWT(exampleToken);

    expect(session).toBeDefined();
    expect(session.perm).toContain(Permission.TEST);
    expect(console.error).toHaveBeenCalled();
  });

  it('should parse token (including customerId) and create a Session object', () => {
    const exampleToken: JwtData = {
      sub: 'program@demo',
      uid: '33',
      jti: 'n6rhKcIJn4Wk',
      nbf: 1455119895,
      exp: 1455123495,
      utype: UserType.DEFAULT,
      tid: '666',
      perm: [Permission.TEST]
    };

    const session: Session = Session.fromJWT(exampleToken);

    expect(session).toBeDefined();
    expect(session.expiry instanceof Date).toBeTruthy();
    expect(session.user).toBe('program@demo');
    expect(session.perm).toContain(Permission.TEST);
  });
});
