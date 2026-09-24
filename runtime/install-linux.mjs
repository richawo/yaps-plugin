// `yaps-agent install-linux [--dry-run] [--upgrade]`
//
// Installs the Yaps desktop package on a Linux computer an agent owns (Grok
// Bot's cloud computer), so the plugin's MCP tools can run there. It only ever
// installs the official package from the latest richawo/yaps-releases release,
// and only after its size and SHA-256 match that release's
// desktop-release-manifest.json. It never pipes a download into a shell, and
// asks for root through `sudo -n`, which fails instead of prompting.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createWriteStream, existsSync, readFileSync } from "node:fs";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const RELEASES_API = "https://api.github.com/repos/richawo/yaps-releases/releases/latest";
const MANIFEST_ASSET = "desktop-release-manifest.json";
const CLI_PATH = "/usr/bin/yaps_cli";
const HEADERS = { "User-Agent": "yaps-agent", Accept: "application/vnd.github+json" };

export class InstallError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

/** Which package format this distribution takes, from /etc/os-release. */
export function packageKind(osRelease) {
  const field = (name) => (osRelease.match(new RegExp(`^${name}=["']?([^"'\\n]*)`, "m")) || [])[1] || "";
  const ids = `${field("ID")} ${field("ID_LIKE")}`.toLowerCase().split(/\s+/);
  if (ids.some((id) => ["debian", "ubuntu"].includes(id))) return "deb";
  if (ids.some((id) => ["fedora", "rhel", "centos", "rocky", "almalinux"].includes(id))) return "rpm";
  return null;
}

/** The package asset plus its pinned size and hash from the release manifest. */
export function pickPackage(release, manifest, kind) {
  const pattern = kind === "deb" ? /^Yaps_[\d.]+_amd64\.deb$/ : /^Yaps-[\d.]+-\d+\.x86_64\.rpm$/;
  const asset = (release.assets || []).find((candidate) => pattern.test(candidate.name));
  if (!asset) throw new InstallError("package_missing", `The latest Yaps release has no ${kind} package.`);
  const pinned = (manifest?.platforms?.["linux-x86_64"]?.files || []).find((file) => file.name === asset.name);
  if (!pinned || !/^[0-9a-f]{64}$/.test(pinned.sha256 || "") || !Number.isInteger(pinned.size)) {
    throw new InstallError("manifest_missing", `The release manifest does not pin ${asset.name}.`);
  }
  if (asset.size !== pinned.size) {
    throw new InstallError("manifest_mismatch", `${asset.name} does not match the size its manifest pins.`);
  }
  return { name: asset.name, url: asset.browser_download_url, sha256: pinned.sha256, size: pinned.size, version: release.tag_name };
}

async function getJson(url, fetchImpl) {
  const response = await fetchImpl(url, { headers: HEADERS });
  if (!response.ok) throw new InstallError("download_failed", `Could not read ${url} (HTTP ${response.status}).`);
  return response.json();
}

/** Stream a download to disk, hashing as it goes; delete it unless it matches. */
export async function downloadVerified(pkg, directory, fetchImpl = fetch) {
  const path = join(directory, pkg.name);
  const response = await fetchImpl(pkg.url, { headers: { "User-Agent": HEADERS["User-Agent"] } });
  if (!response.ok || !response.body) throw new InstallError("download_failed", `Could not download ${pkg.name} (HTTP ${response.status}).`);
  const hash = createHash("sha256");
  const body = Readable.fromWeb(response.body);
  body.on("data", (chunk) => hash.update(chunk));
  await pipeline(body, createWriteStream(path, { mode: 0o600 }));
  const size = (await stat(path)).size;
  const digest = hash.digest("hex");
  if (size !== pkg.size || digest !== pkg.sha256) {
    await rm(path, { force: true });
    throw new InstallError("checksum_mismatch", `${pkg.name} failed verification; nothing was installed.`);
  }
  return path;
}

function installCommand(kind, path, isRoot) {
  const tool = kind === "deb" ? ["apt-get", "install", "-y", path] : ["dnf", "install", "-y", path];
  return isRoot ? tool : ["sudo", "-n", ...tool];
}

export async function installLinux(options = {}) {
  const platform = options.platform || process.platform;
  const arch = options.arch || process.arch;
  const fetchImpl = options.fetch || fetch;
  const run = options.run || ((command) => spawnSync(command[0], command.slice(1), { stdio: "inherit", env: { ...process.env, DEBIAN_FRONTEND: "noninteractive" } }));
  if (platform !== "linux" || arch !== "x64") {
    throw new InstallError("unsupported_platform", "This installs Yaps on a 64-bit Intel/AMD Linux computer only. On macOS or Windows, download Yaps from https://yaps.ai/download.");
  }
  const cliExists = options.cliExists || (() => existsSync(CLI_PATH));
  if (cliExists() && !options.upgrade) {
    return { installed: true, already_installed: true, cli: CLI_PATH };
  }
  const osRelease = options.osRelease ?? (existsSync("/etc/os-release") ? readFileSync("/etc/os-release", "utf8") : "");
  const kind = packageKind(osRelease);
  if (!kind) throw new InstallError("unsupported_distribution", "Yaps packages are published for Debian/Ubuntu (.deb) and Fedora/RHEL (.rpm).");

  const release = await getJson(RELEASES_API, fetchImpl);
  const manifestAsset = (release.assets || []).find((asset) => asset.name === MANIFEST_ASSET);
  if (!manifestAsset) throw new InstallError("manifest_missing", "The latest Yaps release has no checksum manifest.");
  const manifest = await getJson(manifestAsset.browser_download_url, fetchImpl);
  const pkg = pickPackage(release, manifest, kind);
  const isRoot = (options.uid ?? process.getuid?.()) === 0;
  const command = installCommand(kind, "<verified package>", isRoot);
  if (options.dryRun) {
    return { installed: false, dry_run: true, version: pkg.version, package: pkg.name, size: pkg.size, sha256: pkg.sha256, install_command: command.join(" ") };
  }

  const directory = await mkdtemp(join(options.tmpdir || tmpdir(), "yaps-install-"));
  try {
    const path = await downloadVerified(pkg, directory, fetchImpl);
    const result = run(installCommand(kind, path, isRoot));
    if (result.status !== 0) {
      throw new InstallError(isRoot ? "install_failed" : "needs_root",
        isRoot ? `The package manager could not install ${pkg.name}.`
          : `Installing needs root. Run as root, or allow passwordless sudo for the package manager, then retry.`);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
  if (!cliExists()) throw new InstallError("install_incomplete", `${pkg.name} installed, but ${CLI_PATH} is missing.`);
  return { installed: true, version: pkg.version, package: pkg.name, cli: CLI_PATH };
}

export async function main(argv) {
  const known = new Set(["--dry-run", "--upgrade"]);
  const unknown = argv.filter((arg) => !known.has(arg));
  try {
    if (unknown.length) throw new InstallError("usage", "Usage: yaps-agent install-linux [--dry-run] [--upgrade]");
    const result = await installLinux({ dryRun: argv.includes("--dry-run"), upgrade: argv.includes("--upgrade") });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    const known = error instanceof InstallError;
    process.stdout.write(`${JSON.stringify({ error_code: known ? error.code : "install_failed", error: known ? error.message : String(error?.message || error) })}\n`);
    process.exitCode = known && error.code === "usage" ? 2 : 1;
  }
}
