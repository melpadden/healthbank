
export class ObjectWithPermission {
  users?: { [index: string]: UserPermission };
}

export class UserPermission {
  key: string;
  permittedFrom?: any;
  permittedUntil?: any;
}
