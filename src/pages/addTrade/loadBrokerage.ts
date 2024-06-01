import { useFormikContext } from "formik";
import { useEffect } from "react";

const LoadBrokerage = (): null => {
  const { setFieldValue } = useFormikContext();

  // On page render, pre-fill brokerage input with auto fill value from settings
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const settings = await window.electronAPI.getData("settings");
      if (isMounted) {
        setFieldValue("brokerage", settings.brokerageAutoFill);
      }
    })();
    // Clean up
    return () => {
      isMounted = false;
    };
  }, []);

  return null;
};

export default LoadBrokerage;
