"use client";

import { useEffect, useState } from "react";
import FormField from "../components/FormField";
import { adapter } from "@/adapter";

export default function Form() {
  const [formData, setFormData] = useState<InputTransaction>({
    reference: "",
    amount: "",
    date: "",
    currency: "",
    paymentType: 99,
    chargeDetails: "SHA",
    senderAccountNumber: "",
    bankCode: "",
    beneficiaryName: "",
    recieverAccountNumber: "",
  });
  const [output, setOutput] = useState<OutputTransaction>();
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ text: string; id: string }[]>([]);
  const [errors, setErrors] = useState({
    reference: "",
    amount: "",
    date: "",
    currency: "",
    senderAccountNumber: "",
    bankCode: "",
    beneficiaryName: "",
    recieverAccountNumber: "",
  });
  const [success, setSuccess] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };
  const handleAddNote = () => {
    if (!note) return;
    const newNotes = [...notes, { text: note, id: Date.now().toString() }];
    setNotes(newNotes);
    setNote("");
  };
  const handleRemoveNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };
  useEffect(() => {
    const convertedData = adapter.convertToPayload({
      ...formData,
      notes: notes.map((n) => n.text),
    });
    setOutput(convertedData);
  }, [formData, notes]);
  const handleValidation = (
    data: Omit<InputTransaction, "chargeDetails" | "paymentType">,
  ) => {
    const newErrors = {
      reference: !data.reference ? "Reference is Required" : "",
      amount: !data.amount || isNaN(+data.amount) ? "Amount is Required" : "",
      date: !data.date ? "Date is Required" : "",
      currency: !data.currency ? "Currency is Required" : "",
      senderAccountNumber: !data.senderAccountNumber
        ? "Sender Account Number is Required"
        : "",
      bankCode: !data.bankCode ? "Bank Code is Required" : "",
      beneficiaryName: !data.beneficiaryName
        ? "Beneficiary Name is Required"
        : "",
      recieverAccountNumber: !data.recieverAccountNumber
        ? "Receiver Account Number is Required"
        : "",
    };

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => !error);
  };
  const handleSubmit = () => {
    const { paymentType, chargeDetails, ...reset } = formData;
    const isValid = handleValidation(reset);
    if (isValid) {
      setSuccess(true);
      setFormData({
        reference: "",
        amount: "",
        date: "",
        currency: "",
        paymentType: 99,
        chargeDetails: "SHA",
        senderAccountNumber: "",
        bankCode: "",
        beneficiaryName: "",
        recieverAccountNumber: "",
      });
      setNotes([]);
    } else {
      setSuccess(false);
    }
  };
  return (
    <div>
      <h1 className="text-center text-2xl">Form</h1>
      <form action="" className="border rounded-2xl mb-4">
        <div className="grid grid-cols-2 justify-center p-4 gap-4">
          <FormField
            required
            title="Reference"
            id="reference"
            error={errors.reference}
          >
            <input
              className="border-2"
              type="text"
              id="reference"
              name="reference"
              placeholder="Enter your reference"
              value={formData.reference}
              onChange={handleChange}
            />
          </FormField>
          <FormField required title="Amount" id="amount" error={errors.amount}>
            <input
              className="border-2"
              type="text"
              id="amount"
              name="amount"
              placeholder="Enter your amount"
              value={formData.amount}
              onChange={handleChange}
            />
          </FormField>

          <FormField title="Note" id="notes">
            <div className="flex gap-2">
              <input
                className="border-2"
                type="text"
                id="notes"
                name="notes"
                placeholder="Enter your notes"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button
                className="border-2"
                type="button"
                onClick={() => handleAddNote()}
              >
                Add
              </button>
            </div>
            {notes.map((note) => (
              <div key={note.id} className="flex gap-2">
                <span>{note.text}</span>
                <button
                  className="border-2"
                  onClick={() => handleRemoveNote(note.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </FormField>
          <FormField required title="Date" id="date" error={errors.date}>
            <input
              className="border-2"
              type="date"
              id="date"
              name="date"
              placeholder="Enter your date"
              value={formData.date}
              onChange={handleChange}
            />
          </FormField>
          <FormField
            required
            title="Currency"
            id="date"
            error={errors.currency}
          >
            <select
              className="border-2"
              id="currency"
              name="currency"
              onChange={handleChange}
              value={formData.currency}
            >
              <option value={""}>Select Currency</option>
              <option value={"SAR"}>SAR</option>
              <option value={"EGP"}>EGP</option>
            </select>
          </FormField>
          <FormField
            title="Payment Type"
            id="paymentType"
            helperText="default value is 99"
          >
            <input
              className="border-2"
              type="text"
              id="paymentType"
              name="paymentType"
              placeholder="Enter your payment type"
              value={formData.paymentType}
              onChange={handleChange}
            />
          </FormField>
          <FormField
            title="Charge Details"
            id="chargeDetails"
            helperText="default value is SHA"
          >
            <select
              className="border-2"
              id="chargeDetails"
              name="chargeDetails"
              onChange={handleChange}
              value={formData.chargeDetails}
            >
              <option value={"SHA"}>SHA</option>
              <option value={"RB"}>RB</option>
            </select>
          </FormField>
          <FormField
            required
            title="Sender Account Number"
            id="senderAccountNumber"
            error={errors.senderAccountNumber}
          >
            <input
              className="border-2"
              type="text"
              id="senderAccountNumber"
              name="senderAccountNumber"
              placeholder="Enter sender account number"
              value={formData.senderAccountNumber}
              onChange={handleChange}
            />
          </FormField>
          <hr className="col-span-3" />
          <fieldset className="contents">
            <legend className="col-span-3 underline underline-offset-2">
              Reciever Info
            </legend>
            <FormField required title="Bank Code" id="bankCode" error={errors.bankCode}>
              <input
                className="border-2"
                type="text"
                id="bankCode"
                name="bankCode"
                placeholder="Enter bank code"
                value={formData.bankCode}
                onChange={handleChange}
              />
            </FormField>
            <FormField
              required
              title="Reciever Account Number"
              id="recieverAccountNumber"
              error={errors.recieverAccountNumber}
            >
              <input
                className="border-2"
                type="text"
                id="recieverAccountNumber"
                name="recieverAccountNumber"
                placeholder="Enter reciever account number"
                value={formData.recieverAccountNumber}
                onChange={handleChange}
              />
            </FormField>
            <FormField required title="Beneficiary Name" id="beneficiaryName" error={errors.beneficiaryName}>
              <input
                className="border-2"
                type="text"
                id="beneficiaryName"
                name="beneficiaryName"
                placeholder="Enter Beneficiary Name"
                value={formData.beneficiaryName}
                onChange={handleChange}
              />
            </FormField>
          </fieldset>
        </div>
        <div className="text-center my-4">
          <button type="button" onClick={handleSubmit} className="border-2 p-4">
            Submit
          </button>
        </div>
        {success && (
          <p className="text-green-500 text-center mb-2">Form Submitted Successfully</p>
        )}
      </form>

      <pre className="bg-gray-700 text-white whitespace-pre-wrap ">
        <code>{JSON.stringify(output, null, 2)}</code>
      </pre>
    </div>
  );
}
