import { HttpService } from "./services";
// adapter pattern
class Adapter {
  async adaptFeed(dependency: HttpService) {
    try {
      const res = await dependency.getFeed();
      const references = res.data.map((t: Transcation) => t.reference);
      const reduceObj = res.data.reduce(
        (acc: Record<string, Transcation>, t: Transcation) => {
          acc[t.reference] = t;
          return acc;
        },
        {},
      );
      return {
        references: [...new Set(references)],
        byReferences: {
          ...reduceObj,
        },
      } as NormalizeTranscation;
    } catch (error) {
      console.error("Error fetching feed:", error);
      return null;
    }
  }
  adaptSocket(data: string) {
    const [date, amount, reference, metadata] = data.split("|");
    const note = metadata.split(";")[0].split(":")[1];
    const transcation: Transcation = {
      date,
      amount,
      reference,
      note,
    };
    return {
      references: [transcation.reference],
      byReferences: {
        [transcation.reference]: transcation,
      },
    } as NormalizeTranscation;
  }

  convertToPayload(data: InputTransaction): OutputTransaction {
    return {
      reference: data.reference,
      date: data.date,
      amount: data.amount,
      currency: data.currency,
      sender: { accountNumber: data.senderAccountNumber },
      receiver: {
        bankCode: data.bankCode,
        accountNumber: data.recieverAccountNumber,
        beneficiaryName: data.beneficiaryName,
      },
      ...(data.notes && data.notes?.length > 0 && { notes: data.notes }),
      paymentType: data.paymentType || 99,
      chargeDetails: data.chargeDetails || "SHA",
    };
  }
}

export const adapter = new Adapter();
