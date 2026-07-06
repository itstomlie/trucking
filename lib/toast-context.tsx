import { useCallback, useContext, useState, createContext } from 'react';
import MyToast from '../components/toast';

const ToastContext = createContext<any>([]);

export default ToastContext;

export function ToastContextProvider({ children }: { children: JSX.Element }) {
  const [toasts, setToasts] = useState([] as string[]);

  const addToast = useCallback(
    function (toast: string) {
      setToasts((toasts) => [...toasts, toast]);
      setTimeout(() => setToasts((toasts) => toasts.slice(1)), 2000);
    },
    [setToasts]
  );

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-0 right-0 p-5" style={{ zIndex: 50 }}>
        <div className="grid gap-2 grid-cols-1"></div>
        {toasts.map((toast, i) => (
          <MyToast key={i} message={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  return useContext(ToastContext);
}
