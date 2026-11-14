const { execFileSync } = require("node:child_process");

module.exports = ({ config }) => {
  let branch = "dev";
  try {
    branch = execFileSync("git", ["branch", "--show-current"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    /* EAS uses the explicit environment from its profile. */
  }
  const environment =
    process.env.EXPO_PUBLIC_APP_ENV ||
    (["main", "staging"].includes(branch) ? branch : "dev");
  process.env.EXPO_PUBLIC_APP_ENV = environment;
  if (!["dev", "staging", "main"].includes(environment))
    throw new Error("Invalid Olive environment.");
  if (environment !== "dev") {
    const url = new URL(
      process.env.EXPO_PUBLIC_API_URL || "https://missing.invalid"
    );
    if (
      url.protocol !== "https:" ||
      url.hostname === "missing.invalid" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new Error(
        `Set EXPO_PUBLIC_API_URL to the ${environment} agent HTTPS URL before running or building.`
      );
    }
  }
  return {
    ...config,
    name: environment === "staging" ? "Olive Staging" : config.name,
    android: {
      ...config.android,
      package:
        environment === "staging"
          ? "com.olive.voice.staging"
          : config.android.package,
    },
    extra: { ...config.extra, appEnvironment: environment },
  };
};
