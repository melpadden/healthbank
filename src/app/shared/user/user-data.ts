import {DateTime} from '../date/date.type';

export class User {
  firstName: string;
  lastName: string;
  nationality: string;
  email: string;
  phone: string;
  birthday: DateTime;
  enrolled: DateTime;
  storage: string;

  constructor(init?: boolean) {
    if (init) {
      this.firstName = '';
      this.lastName = '';
      this.nationality = '';
      this.email = '';
      this.phone = '';
    }
  }
}
