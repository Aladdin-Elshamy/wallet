"use client";

import React, { createContext, useContext, cloneElement, isValidElement } from "react";

interface FormFieldContextValue {
  id: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  errorId?: string;
  helperId?: string;
  describedBy?: string;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export function useFormField() {
  const context = useContext(FormFieldContext);
  return context;
}

interface FormFieldProps {
  title: string;
  id: string;
  error?: string;
  children: React.ReactNode;
  helperText?: string;
  required?: boolean;
}

export default function FormField({
  title,
  id,
  error,
  children,
  helperText,
  required = false,
}: FormFieldProps) {
  const errorId = error ? `error-${id}` : undefined;
  const helperId = helperText ? `helper-${id}` : undefined;

  // Merge IDs for aria-describedby: includes error and helper text
  const describedBy = helperId || undefined;

  const contextValue: FormFieldContextValue = {
    id,
    required,
    error,
    helperText,
    errorId,
    helperId,
    describedBy,
  };

  // If children is a single valid React element (like <input> or <select>),
  // automatically wire up accessibility attributes unless already provided.
  let renderedChild = children;
  if (isValidElement(children)) {
    const childProps = children.props as Record<string, unknown>;
    renderedChild = cloneElement(children, {
      id: (childProps.id as string) || id,
      "aria-required": childProps["aria-required"] ?? (required ? true : undefined),
      "aria-invalid": childProps["aria-invalid"] ?? Boolean(error),
      "aria-describedby":
        (childProps["aria-describedby"] as string) || describedBy,
      ...(errorId && !childProps["aria-errormessage"]
        ? { "aria-errormessage": errorId }
        : {}),
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <FormFieldContext.Provider value={contextValue}>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-800 dark:text-gray-200"
        >
          {title}
          {required && (
            <>
              <span aria-hidden="true" className="text-red-700 font-bold ms-1">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </label>

        {renderedChild}

        {/* Error message with role="alert" and WCAG AA contrast (text-red-700) */}
        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-xs font-semibold text-red-700"
          >
            {error}
          </p>
        )}

        {/* Helper text with WCAG AA contrast (text-gray-600 is 4.5:1+) */}
        {helperText && (
          <p id={helperId} className="text-xs text-gray-600 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    </FormFieldContext.Provider>
  );
}
