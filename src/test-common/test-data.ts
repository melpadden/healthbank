/**
 * Test settings and constants used or needed for the application. This is used by the karma unit/integration tests
 */
import {SessionUser} from '../app/shared/user/user-session';
import {User} from '../app/shared/user/user-data';
import {UserService} from '../app/shared/user/user.service';
import {CryptoService} from '../app/shared/crypto/crypto.service';
import {TimeLineItem} from '../app/shared/timeline/models/timeline';
import {ItemType} from '../app/shared/timeline/models/enums/item-type.enum';
import {extractDate, extractTime, toDateTime} from '../app/shared/date/date.type';

/* tslint:disable:max-line-length */
const DEFAULT_PWD = 'asdfasdf';


export const testAuthConfig = {

  preparedUserForEnrollment: {
    nationality: 'AUT',
    firstName: 'Hans',
    lastName: 'Muster',
  } as User,

  sessionUser: {
    user: {
      email: 'user@demo',
      nationality: 'AUT',
      firstName: 'Hans',
      lastName: 'Muster',
    } as User,

    userId: '32ab9fe1-9efe-4487-ad8b-d3c5f27f9e60',
    keyStore: 'eyJhbGciOiJkaXIiLCJraWQiOiJrSXpJYS1Ga0xhNFZNOS14OUxSYzc1SVk4M3pLNWRFTkNKYjJabUlfTWpzIiwiY3R5IjoiandrLXNldCtqc29uIiwiZW5jIjoiQTI1NkdDTSIsInBhc3N3b3Jkc2FsdCI6ImNkMGRiMTZjOTQ3MGYwMTRmMDFjZmZjODI1OTcwY2NjNzQ2YTJhYmRiOTUwODViZjg3YWYzNTc3NjU4YWZlNjQifQ..Se_-zScTSTJ15_kx.LNSBl7ca2bzpEpYFt4_D_SBWuU2ndzC6ma-eWM8-e2IPLtuNMfXonGB7WnQuJib94tNM16yc6hcYx0bpe0BzrGjITbX1rcpc_YbUPOI0vzXSzLVhajAfSQKY4FOCytRfpRM398Tq_txUmty2TGuyFDIsgZdd_TCalBNZoxYfCh1_otTfGbsPbjpb4NGRVpgXEQlUNx_rILiMDqd2BsmYZerd313Thnm7QpQrBVLfjAGblhGgl8hofzdZHGMQJgZykvUKo3RcpZw32Rt0rijX5d_yxvIR9IwAM4gt88SwN6dFd8fw_n8qFbx-GDQhyRRtRGqsoiVcvlXu7Z35inVcc28SLb24S7MJ9mFL9-qDymsych0CD_SGo9QFKFmUGi0GgIFuozMG0hRzfmhS1SAPhYkWbDlVADaWjVnf9hxhghIZsaodHZOx_8m6FFghHTqM2B-9IyJ29PsoEclwShie-V1RLXzogOSxkex617KzklPfqOQItz244s_mp8T3qllgU7YhkCpLgCM7_gr10-4MZU7Bfj3INbz4KQI0OSyH7yJwlNW118Ple3rMazlpBJkAMDQWsjKcm0l5q6Z_pZZ8DJiNG8H9-Z0bbpAVaQL29uZvG73jDXaRpovaqtyHVyWPREMPFXMuT7XAhugvW6qlFJnLvb0gLQMIbpegmQJncmp5g0_6HfQEks_A17MuwGprP822d48N1ivFfWijmbhdSjZcjYwgqY4nmhUMgUm6EDf9ecYYZhMZqsEqu1c37V_lzGvlbucPgTU3hoBxMn6-paJL3vGCWU36_VzXrmFsd70ZcysFXIv1OTIEWdp8i12H8RTxeYKYls5ruyRHaWabZxOuzmG_ExHErjSaf_2COHXuin9qQyviU9om4avJMg8e8JiEkbcy1lzQtAvRDKh356MKSdJMZkM-rIn-p6R5kBUPlVbo-d-Y39BUAYA2Iaq9aPZC9fzB7nY_Nvn0Crew5yQHWo4bV0M-uoFDdY-F4OhKPmhuoJljRddkxwy5V9vP7atcugbQ5nCFWGGkQDDTChu8xl1vA0edjoFBaKMJPf61oc7c_iYlEsZzF8F9MG1eha_x4yaYjU-jB9qmKlzIySfkf9wy8cliRZM7ACuIv_reFfR9gdcma1TtBfD7MspI_gHTwKGwCPqFz1qt0e8wyAUEqiKURK-G-yKbJPj21Ile2e8Aomvz08xsd8vgiV7qgxd3bKQzvTy_CjURbQ9GnKlbiKjQvVINS5HgDPfUE1HsNjyiaM4muTy3tVlY3D7ZGMjKKr-WFyj8KocJ8063USEjXeBruEydjHhAgxic0JwxSm7IaeqL2GqfScnxql4nbimgz0XXdBMNWnbUvIYO8M3vBMpiDUXsO-lqxz5O_K3mu0QnSM7sW1aaonQX2c9P0ATzYU_avgOhnWMIF7sHHDj1zH6B-FV-b_qXevxBB2Ppy9yiiho8eE8Llu8vFqKndW5zN5igwUObBWt7AGv-n_xdR3wgVj19c81R1VeFRo81a-_5n4gj7wudpBelha-uMEw0ZDAnTwO8k_tnk3kt8z-hbLHOxRZh24rJBg.rFp3DSstV3Zsc6w-3KkoVw'
  } as SessionUser,

  DEFAULT_PWD,

  testSessionUser: 'testSessionUser',
  EXPIRED_TOKEN: 'eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiJzeXN0ZW1AZGVtbyIsImp0aSI6IlowTGNmd3lwNlhQWiIsIm5iZiI6MTQ3ODUxNjMyMywidXR5cGUiOiJTWVNURU0iLCJ1aWQiOiItMSIsImV4cCI6MTQ3ODU0NTEyMywicGVybSI6WyJVU0VSX1ZJRVciLCJVU0VSX01BTkFHRSJdfQ.MEYCIQCeZCm9VdUmU8srlfDs9HNXV0rrgo4v-4-I3wNaZ1riWgIhAMnwjoKRtoScLS33D-0PUrGv9CJPa_ZirQwH_-KkbPzS'
};

export function enrollUser(userService: UserService, cryptoService: CryptoService, sessionUser: SessionUser): Promise<SessionUser> {

  return cryptoService.generateKeypairs()
    .then(value => {
      return userService.enrollUser(sessionUser, 'asdfasdf');
    })
    .then((keystore: string) => {
      sessionUser.keyStore = keystore;
      return keystore;
    })
    .then(value => {
      return userService.addUserToDb(sessionUser).toPromise();
    })
    .then(value2 => {
      return userService.confirmIdentity(value2, testAuthConfig.DEFAULT_PWD.toUpperCase()).toPromise();
    });
}

/**
 * TimeLineItemModel for tests
 */
export const TimeLineItemTD: TimeLineItem = {
  id: 'id',
  reference: 'reference',
  owner: 'owner',
  itemType: ItemType.IMAGE,
  time: toDateTime(new Date()),
  uploadTime: toDateTime(new Date()),
  metadata: {
    title: 'title',
    creationDate: extractDate(toDateTime(new Date())),
    creationTime: extractTime(toDateTime(new Date())),
    tags: ['tag1'],
  },
  fileMetadata: {
    name: 'filename',
    size: '100kb',
    type: 'image/png'
  },
  contentReference: null,
  thumbnailReference: null,
  // users: {owner: {key: 'key'}}
};
