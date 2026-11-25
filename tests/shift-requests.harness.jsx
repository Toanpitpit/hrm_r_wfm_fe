import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { AdminThemeProvider } from "../src/shared/context/ThemeContext";
import { ToastProvider } from "../src/shared/components/ui/ToastProvider";
import useShiftRequests from "../src/modules/schedule/hooks/useShiftRequests";
import ShiftRequestsWorkspace from "../src/modules/schedule/components/ShiftRequestsWorkspace";
import ShiftSwapModal from "../src/modules/schedule/components/ShiftSwapModal";
import MySwapRequestsModal from "../src/modules/schedule/components/MySwapRequestsModal";
import ShiftSwapReviewModal from "../src/modules/schedule/components/ShiftSwapReviewModal";
import { readRequestUser } from "../src/modules/schedule/utils/shiftRequest.utils";

export function HookProbe({ options }) {
  const model = useShiftRequests(options);
  useEffect(() => {
    window.requestModel = model;
  });
  return <div>Hook ready</div>;
}

export function Harness() {
  const [options, setOptions] = useState(window.testOptions || {});
  const [open, setOpen] = useState(true);
  useEffect(() => {
    window.setTestOptions = setOptions;
  }, []);
  const scenario = new URLSearchParams(location.search).get("scenario");
  const onChanged = () => {
    window.changeCount = (window.changeCount || 0) + 1;
  };
  if (scenario === "workspace")
    return <ShiftRequestsWorkspace user={readRequestUser()} />;
  if (scenario === "create-modal")
    return (
      <ShiftSwapModal
        isOpen={open}
        onClose={() => setOpen(false)}
        shift={options.shift}
        onSuccess={onChanged}
      />
    );
  if (scenario === "history-modal")
    return <MySwapRequestsModal isOpen={open} onClose={() => setOpen(false)} />;
  if (scenario === "review-modal")
    return (
      <ShiftSwapReviewModal
        isOpen={open}
        onClose={() => setOpen(false)}
        storeId={3}
        onReviewed={onChanged}
      />
    );
  return <HookProbe options={options} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MemoryRouter>
      <AdminThemeProvider>
        <ToastProvider>
          <Harness />
        </ToastProvider>
      </AdminThemeProvider>
    </MemoryRouter>
  </StrictMode>,
);
