import { Dispatch, SetStateAction, useEffect} from "react";
import { useFormikContext } from "formik";

// Types
import { PortfolioData } from "../../../electron/types";
import { PortfolioFormValues } from "./index";

interface Props {
  setData: Dispatch<SetStateAction<PortfolioData>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

const UpdateData = (props: Props): null => {
  const { values } = useFormikContext<PortfolioFormValues>();
  const { setData, setLoading } = props;

  // Update portfolio data when values is changed
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await window.electronAPI.getPortfolioData(values);
        if (isMounted) {
          setData(data);
          setLoading(false);
        }
      } catch (error) {
        // Split message since Electron wraps the original error message with additional text.
        const splitMsg = error.message.split('Error: ');
        const msg = (splitMsg.length === 2) ? splitMsg[1] : error.message;
        console.error(msg);
      }
    })();
    // Clean up
    return () => { isMounted = false };
  }, [values]);

  return null;
}

export default UpdateData;
