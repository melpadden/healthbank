  export class Patient {
    firstName: string;
    lastName: string;
    birthdate: Date;
    address: string;
    gender: string;
  }

  export class Article {
    pharmacode: number;
    gtin: string;
    quantity: number;
    quantityUnit: string;
  }

  export class Product {
    productNumber: number;
    description: string;
    pillPictureUrl: string;
    packagePictureUrl: string;
    articles: Article[];
    patientInformationUrl: string;
  }

  export class Medicament {
    product: Product;
    dateFrom: Date;
    idType: number;
    id: string;
    doseMorning: number;
    doseMidday: number;
    doseEvening: number;
    doseNight: number;
    doseUnit: string;
    savingOpportunityText: string;
    savingOpportunityStatus: string;
    takingReason: string;
    applicationInstructions: string;
  }

  export class Metadata {
    patient: Patient;
    id: string;
    remark: string;
    createDate: Date;
    medicaments: Medicament[];
  }
