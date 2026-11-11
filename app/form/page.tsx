"use client";

import { useEffect, useRef, useState } from "react";
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
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({
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

  const formRef = useRef<HTMLFormElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

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
    if (!note.trim()) return;
    const newNotes = [...notes, { text: note.trim(), id: Date.now().toString() }];
    setNotes(newNotes);
    setLiveAnnouncement(`Note "${note.trim()}" added.`);
    setNote("");
  };

  const handleRemoveNote = (id: string, index: number) => {
    const removedNote = notes.find((n) => n.id === id);
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);

    // Announce deletion to screen readers
    setLiveAnnouncement(`Note "${removedNote?.text}" removed.`);

    // Shift focus smoothly without dropping to document.body
    setTimeout(() => {
      if (remaining.length === 0) {
        noteInputRef.current?.focus();
      } else {
        const nextIndex = Math.min(index, remaining.length - 1);
        const nextBtn = document.getElementById(
          `remove-note-${remaining[nextIndex].id}`,
        );
        nextBtn?.focus();
      }
    }, 0);
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

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { paymentType, chargeDetails, ...rest } = formData;
    const validationErrors = handleValidation(rest);
    const hasErrors = Object.values(validationErrors).some((err) => !!err);

    if (!hasErrors) {
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
      setLiveAnnouncement("Form submitted successfully.");
    } else {
      setSuccess(false);
      // Focus management: move focus directly to the Error Summary Banner
      setTimeout(() => {
        errorSummaryRef.current?.focus();
      }, 0);
    }
  };

  const activeErrors = Object.entries(errors).filter(([_, msg]) => Boolean(msg));
  const hasErrors = activeErrors.length > 0;

  const inputClass =
    "border-2 border-gray-300 rounded px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent";

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 id="form-heading" className="text-center text-2xl font-bold mb-6">
        Transaction Form
      </h1>

      {/* Screen reader live announcements for async updates */}
      <div className="sr-only" role="status">
        {liveAnnouncement}
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        aria-labelledby="form-heading"
        noValidate
        className="border border-gray-300 rounded-2xl p-6 shadow-sm mb-6"
      >
        {/* Error Summary Banner (WCAG Technique G199) */}
        {hasErrors && (
          <div
            ref={errorSummaryRef}
            tabIndex={-1}
            role="alert"
            aria-labelledby="error-summary-title"
            className="mb-6 p-4 border-2 border-red-600 bg-red-50 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
        <h2
              id="error-summary-title"
              className="text-base font-bold text-red-900"
            >
              There is a problem with your submission
            </h2>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {activeErrors.map(([fieldKey, errorMsg]) => (
                <li key={fieldKey}>
                  <a
                    href={`#${fieldKey}`}
                    className="text-red-700 underline font-medium hover:text-red-900 focus-visible:ring-2 focus-visible:ring-blue-600"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(fieldKey)?.focus();
                    }}  
                  >
                    {errorMsg}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            required
            title="Reference"
            id="reference"
            error={errors.reference}
          >
            <input
              className={inputClass}
              type="text"
              name="reference"
              placeholder="Enter your reference"
              value={formData.reference}
              onChange={handleChange}
            />
          </FormField>

          <FormField
            required
            title="Amount"
            id="amount"
            error={errors.amount}
          >
            <input
              className={inputClass}
              type="text"
              inputMode="decimal"
              name="amount"
              placeholder="Enter your amount"
              value={formData.amount}
              onChange={handleChange}
            />
          </FormField>

          <FormField
            required
            title="Date"
            id="date"
            error={errors.date}
          >
            <input
              className={inputClass}
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </FormField>

          <FormField
            required
            title="Currency"
            id="currency"
            error={errors.currency}
          >
            <select
              className={inputClass}
              name="currency"
              onChange={handleChange}
              value={formData.currency}
            >
              <option value="">Select Currency</option>
              <option value="SAR">SAR</option>
              <option value="EGP">EGP</option>
            </select>
          </FormField>

          <FormField
            title="Payment Type"
            id="paymentType"
            helperText="Default value is 99"
          >
            <input
              className={inputClass}
              type="number"
              name="paymentType"
              placeholder="Enter your payment type"
              value={formData.paymentType}
              onChange={handleChange}
            />
          </FormField>

          <FormField
            title="Charge Details"
            id="chargeDetails"
            helperText="Default value is SHA"
          >
            <select
              className={inputClass}
              name="chargeDetails"
              onChange={handleChange}
              value={formData.chargeDetails}
            >
              <option value="SHA">SHA</option>
              <option value="RB">RB</option>
            </select>
          </FormField>

          <FormField
            required
            title="Sender Account Number"
            id="senderAccountNumber"
            error={errors.senderAccountNumber}
          >
            <input
              className={inputClass}
              type="text"
              inputMode="numeric"
              name="senderAccountNumber"
              placeholder="Enter sender account number"
              value={formData.senderAccountNumber}
              onChange={handleChange}
            />
          </FormField>

          {/* Notes section with accessible list, focus restoration, and contextual buttons */}
          <div className="flex flex-col gap-2">
            <FormField title="Notes" id="notes">
              <div className="flex gap-2">
                <input
                  ref={noteInputRef}
                  className={`${inputClass} flex-1`}
                  type="text"
                  name="notes"
                  placeholder="Enter your notes"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                />
                <button
                  className="px-4 py-2 border-2 border-gray-300 hover:bg-gray-100 rounded text-sm font-medium focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none min-h-[40px]"
                  type="button"
                  onClick={handleAddNote}
                >
                  Add
                </button>
              </div>
            </FormField>

            {notes.length > 0 && (
              <ul aria-label="Added notes" className="space-y-2 mt-1">
                {notes.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center bg-gray-50 border p-2 rounded text-sm"
                  >
                    <span>{item.text}</span>
                    <button
                      id={`remove-note-${item.id}`}
                      type="button"
                      className="px-3 py-1 border border-red-300 text-red-700 hover:bg-red-50 rounded text-xs focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none min-h-[32px]"
                      onClick={() => handleRemoveNote(item.id, index)}
                      aria-label={`Remove note: ${item.text}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <hr className="col-span-1 md:col-span-2 my-2 border-gray-200" />

          {/* Semantic Fieldset without display:contents bug */}
          <fieldset className="col-span-1 md:col-span-2 border border-gray-300 rounded-xl p-4">
            <legend className="px-2 font-semibold text-gray-800">
              Receiver Info
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <FormField
                required
                title="Bank Code"
                id="bankCode"
                error={errors.bankCode}
              >
                <input
                  className={inputClass}
                  type="text"
                  name="bankCode"
                  placeholder="Enter bank code"
                  value={formData.bankCode}
                  onChange={handleChange}
                />
              </FormField>

              <FormField
                required
                title="Receiver Account Number"
                id="recieverAccountNumber"
                error={errors.recieverAccountNumber}
              >
                <input
                  className={inputClass}
                  type="text"
                  inputMode="numeric"
                  name="recieverAccountNumber"
                  placeholder="Enter receiver account number"
                  value={formData.recieverAccountNumber}
                  onChange={handleChange}
                />
              </FormField>

              <FormField
                required
                title="Beneficiary Name"
                id="beneficiaryName"
                error={errors.beneficiaryName}
              >
                <input
                  className={inputClass}
                  type="text"
                  name="beneficiaryName"
                  placeholder="Enter Beneficiary Name"
                  value={formData.beneficiaryName}
                  onChange={handleChange}
                />
              </FormField>
            </div>
          </fieldset>
        </div>

        <div className="text-center my-6">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 min-h-[44px]"
          >
            Submit
          </button>
        </div>

        {/* Status Announcement with WCAG AA compliant text-green-700 */}
        <div aria-live="polite" className="text-center min-h-[24px]">
          {success && (
            <p role="status" className="text-green-700 font-semibold">
              Form Submitted Successfully
            </p>
          )}
        </div>
      </form>

      {/* JSON Debug preview: labelled and accessible for keyboard scrolling */}
      <section aria-labelledby="payload-preview-heading">
        <h2 id="payload-preview-heading" className="text-sm font-semibold text-gray-600 mb-2">
          Payload Preview
        </h2>
        <pre
          tabIndex={0}
          aria-label="Transaction payload preview"
          className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-xs whitespace-pre-wrap focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <code>{JSON.stringify(output, null, 2)}</code>
        </pre>
      </section>
    </main>
  );
}
