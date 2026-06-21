interface TextInputConfig {
  prefix?: string;
  label?: string;
  name: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
  type?: string;
  allowDecimal?: boolean;
}

export default function TextInput({
  prefix,
  name,
  label,
  placeholder,
  onChange,
  value,
  type = 'text',
  allowDecimal = false,
}: TextInputConfig) {
  function sanitizeCurrencyInput(inputValue: string) {
    const cleaned = inputValue.replace(/[^0-9.,]/g, '');

    if (allowDecimal) {
      const withoutCommas = cleaned.replace(/,/g, '');
      const [intPart = '', ...rest] = withoutCommas.split('.');
      const decimalPart = rest.join('');
      const hasTrailingDot = withoutCommas.endsWith('.') && rest.length === 0;
      return {
        normalized: `${intPart}${rest.length ? `.${decimalPart}` : ''}`,
        hasTrailingDot,
      };
    }

    return {
      normalized: cleaned.replace(/[^0-9]/g, ''),
      hasTrailingDot: false,
    };
  }

  function valueFormat(inputValue: string | number | undefined) {
    if (type !== 'currency') {
      return (inputValue ?? '') as string | number;
    }

    const raw =
      inputValue === undefined || inputValue === null ? '' : String(inputValue);
    const { normalized, hasTrailingDot } = sanitizeCurrencyInput(raw);

    if (!normalized) return '';

    if (!allowDecimal) {
      return Number(normalized).toLocaleString('en-US');
    }

    const [intPart = '', decimalPart] = normalized.split('.');
    const intFormatted = intPart
      ? Number(intPart).toLocaleString('en-US')
      : '0';

    if (hasTrailingDot) return `${intFormatted}.`;
    if (decimalPart !== undefined) return `${intFormatted}.${decimalPart}`;
    return intFormatted;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (type === 'currency') {
      e.target.value = sanitizeCurrencyInput(String(e.target.value)).normalized;
    }
    onChange(e);
  }

  return (
    <>
      <div>
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="mt-1 relative rounded shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm"> {prefix} </span>
          </div>
          <input
            type={type === 'currency' ? 'text' : type}
            name={name}
            id={name}
            inputMode={type === 'currency' ? 'decimal' : undefined}
            pattern={type === 'currency' ? '[0-9]*[.,]?[0-9]*' : undefined}
            className={
              type == 'currency'
                ? 'block w-full pl-8 pr-2 py-1 sm:text-sm border border-gray-300 rounded'
                : 'block w-full pl-4 pr-2 py-1 sm:text-sm border border-gray-300 rounded'
            }
            placeholder={placeholder}
            onChange={handleChange}
            value={valueFormat(value)}
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <label htmlFor="currency" className="sr-only">
              Currency
            </label>

            {/* <select
              id="currency"
              name="currency"
              className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded"
            >
              <option>USD</option>
              <option>CAD</option>
              <option>EUR</option>
            </select> */}
          </div>
        </div>
      </div>
    </>
  );
}
