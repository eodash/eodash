import { afterEach, describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import ErrorAlert from "@/components/ErrorAlert.vue";
import { errorState } from "@/store/states";
import { mockEodash, mountComponent } from "../support/mount";

// What `errorState` holds is the axios interceptor's contract and is covered in
// tests/unit/plugins/axios.test.js. These pin only how the component renders it.

/** @param {Partial<typeof errorState.value>} [state] */
const setError = (state = {}) =>
  (errorState.value = {
    message: "something failed",
    details: "",
    severity: "error",
    ...state,
  });

const alert = () => document.querySelector(".v-alert");

afterEach(() => setError({ message: "" }));

describe("ErrorAlert", () => {
  test("renders nothing when there is no error", async () => {
    await mountComponent(ErrorAlert);

    await expect.poll(alert).toBeNull();
  });

  test("announces the message to screen readers", async () => {
    setError();
    const { screen } = await mountComponent(ErrorAlert);

    await expect.element(screen.getByRole("alert")).toBeInTheDocument();
    await expect
      .element(screen.getByText("something failed"))
      .toBeInTheDocument();
  });

  test("hides the details panel when there is nothing to show", async () => {
    setError();
    await mountComponent(ErrorAlert);

    await expect.poll(alert).toBeTruthy();
    expect(document.querySelector(".v-expansion-panel")).toBeNull();
  });

  test("reveals the details behind Further Details", async () => {
    setError({ details: "GET https://cat/style.json\nnot found" });
    const { screen } = await mountComponent(ErrorAlert);

    // collapsed by default, so the technical detail stays out of the way
    await userEvent.click(screen.getByText("Further Details"));

    await expect
      .element(screen.getByText(/GET https:\/\/cat\/style\.json/))
      .toBeInTheDocument();
  });

  test("titles a warning as a notice rather than a failure", async () => {
    setError({ severity: "warning" });
    const { screen } = await mountComponent(ErrorAlert, {
      eodash: mockEodash({ brand: { errorMessage: "Custom failure text" } }),
    });

    await expect.element(screen.getByText("Notice")).toBeInTheDocument();
  });

  test("titles an error with brand.errorMessage", async () => {
    setError();
    const { screen } = await mountComponent(ErrorAlert, {
      eodash: mockEodash({ brand: { errorMessage: "Custom failure text" } }),
    });

    await expect
      .element(screen.getByText("Custom failure text"))
      .toBeInTheDocument();
  });

  test("clears the alert when closed", async () => {
    setError();
    await mountComponent(ErrorAlert);
    await expect.poll(alert).toBeTruthy();

    /** @type {HTMLElement | null} */ (
      document.querySelector(".v-alert__close button") ??
        document.querySelector(".v-alert__close")
    )?.click();

    await expect.poll(alert).toBeNull();
    expect(errorState.value.message).toBe("");
  });
});
