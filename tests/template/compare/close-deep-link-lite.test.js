import { testCloseDeepLink } from "./close-deep-link-case";

// Lite disables the comparison picker, but must still allow exiting a deep link.
testCloseDeepLink("lite");
