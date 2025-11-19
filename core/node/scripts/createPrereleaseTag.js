import { execSync } from "child_process";

const PRERELEASE_TYPE = "beta";

// latest tag from git
const latestTag = execSync(
  "git describe --tags `git rev-list --tags --max-count=1`",
  { encoding: "utf-8" },
)
  .toString()
  .trim();

// parse the version from the tag
let version = latestTag.replace("eodash-v", "");

// Check if the latest tag is already a prerelease
const prereleaseMatch = version.match(/^(\d+\.\d+\.\d+)-(\w+)\.(\d+)$/);

let newVersion;

if (prereleaseMatch) {
  // Latest tag is a prerelease (e.g., 5.3.0-beta.1)
  const [, baseVersion, _, prereleaseNum] = prereleaseMatch;
  const nextNum = parseInt(prereleaseNum) + 1;
  newVersion = `${baseVersion}-${PRERELEASE_TYPE}.${nextNum}`;
} else {
  const splitVersion = version.split(".").map((v) => parseInt(v));
  newVersion = `${splitVersion[0]}.${splitVersion[1] + 1}.0-${PRERELEASE_TYPE}.0`;
}

const tag = `eodash-v${newVersion}`;
execSync(`echo ${tag}`, { stdio: "inherit" });
