import { useFormikContext } from "formik";
import { useEffect } from "react";

const LoadSettings = (): null => {
  const { setFieldValue } = useFormikContext();

  // On page render, update values using settings data from storage
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const settings = await window.electronAPI.getData("settings");
      if (isMounted) {
        setFieldValue("unitCostAutoFill", settings.unitCostAutoFill);
        setFieldValue("gstPercent", settings.gstPercent);
        setFieldValue("brokerageAutoFill", settings.brokerageAutoFill);
      }
    })();
    // Clean up
    return () => {
      isMounted = false;
    };
  }, []);

  return null;
};

export default LoadSettings;
