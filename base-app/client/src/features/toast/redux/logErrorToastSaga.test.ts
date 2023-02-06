import { expectSaga } from "redux-saga-test-plan";

import { ToastOptions } from "../types";
import { logErrorToast, logErrorToasts } from "./LogErrorToastSaga";
import { showToast } from "./toastSlice";

const errorToastOptions: ToastOptions = {
  title: `It 's time to panic`,
  status: "error",
};

const infoToastOptions: ToastOptions = {
  title: `It 's not time to panic`,
  status: "info",
};
const errorToastAction = {
  payload: errorToastOptions,
  type: "test",
};

const infoToastAction = {
  payload: infoToastOptions,
  type: "test",
};
test("saga calls analytics when it receives error toast", () => {
  return expectSaga(logErrorToasts, errorToastAction)
    .call(logErrorToast, `It 's time to panic`)
    .run();
});

test("saga not calls analystics when it receives info toast", () => {
  return expectSaga(logErrorToasts, infoToastAction).not.call(
    logErrorToast,
    `It 's not time to panic`
  ).run();
});
