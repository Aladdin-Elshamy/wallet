interface Transcation {
  note?: string;
  amount: string;
  reference: string;
  date: string;
}
// canonical model
interface NormalizeTranscation {
  references: string[];
  byReferences: {
    [key: string]: Transcation;
  };
}

interface InputTransaction {
  reference: string;
  amount: string;
  date: string;
  currency: string;
  paymentType: number;
  chargeDetails: string;
  senderAccountNumber: string;
  bankCode: string;
  beneficiaryName: string;
  recieverAccountNumber: string;
  notes?: string[];
}

interface OutputTransaction {}
