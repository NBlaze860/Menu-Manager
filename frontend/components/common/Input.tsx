
import React, { InputHTMLAttributes } from 'react';
import { UseFormRegister, FieldValues, Path, FieldError } from 'react-hook-form';

type InputProps<T extends FieldValues> = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  containerClassName?: string;
};

const Input = <T extends FieldValues,>({
  label,
  name,
  register,
  error,
  type = 'text',
  containerClassName,
  ...props
}: InputProps<T>) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        type={type}
        {...register(name)}
        {...props}
        className={`w-full px-3 py-2 text-neutral-900 bg-white border-2 rounded-lg transition duration-150 ease-in-out
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500'}
        `}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

export default Input;
