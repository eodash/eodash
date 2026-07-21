import { describe, expect, test } from "vitest";
import ErrorAlert from "@/components/ErrorAlert.vue";
import { mockEodash } from "../support/eodash";
import { mountComponent } from "../support/mount";

const DEFAULT_MESSAGE = "something went wrong, please try again later";

describe("ErrorAlert", () => {
  test("renders nothing when there is no error", async () => {
    await mountComponent(ErrorAlert, { props: { modelValue: "" } });

    await expect.poll(() => document.querySelector(".v-alert")).toBeNull();
  });

  test("shows the default message and the raw error", async () => {
    const { screen } = await mountComponent(ErrorAlert, {
      props: { modelValue: "error: stack trace" },
    });

    await expect.element(screen.getByText(DEFAULT_MESSAGE)).toBeInTheDocument();
    await expect
      .element(screen.getByText("error: stack trace"))
      .toBeInTheDocument();
  });

  test("shows a custom brand.errorMessage", async () => {
    const { screen } = await mountComponent(ErrorAlert, {
      props: { modelValue: "boom" },
      eodash: mockEodash({ brand: { errorMessage: "Custom failure text" } }),
    });

    await expect
      .element(screen.getByText("Custom failure text"))
      .toBeInTheDocument();
  });

  test("clears the alert when closed", async () => {
    await mountComponent(ErrorAlert, { props: { modelValue: "boom" } });
    await expect.poll(() => document.querySelector(".v-alert")).toBeTruthy();

    /** @type {HTMLElement | null} */ (
      document.querySelector(".v-alert__close button") ??
        document.querySelector(".v-alert__close")
    )?.click();

    await expect.poll(() => document.querySelector(".v-alert")).toBeNull();
  });
});
