// App-wide toast notifications. Backed by useState so any component can fire a
// message and the single <AppSnackbar> (mounted in the layouts) renders it.
type SnackbarColor = "success" | "error" | "info" | "warning";

interface SnackbarState {
  show: boolean;
  message: string;
  color: SnackbarColor;
}

export function useSnackbar() {
  const state = useState<SnackbarState>("app-snackbar", () => ({
    show: false,
    message: "",
    color: "info",
  }));

  function notify(message: string, color: SnackbarColor = "info") {
    state.value = { show: true, message, color };
  }

  return {
    state,
    notify,
    success: (m: string) => notify(m, "success"),
    error: (m: string) => notify(m, "error"),
    info: (m: string) => notify(m, "info"),
  };
}
