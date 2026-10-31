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
  required
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id}>{title}
        {required && <span className="text-red-500 text-xs ms-2">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {helperText && <p className="text-xs text-gray-400">{helperText}</p>}
    </div>
  );
}
