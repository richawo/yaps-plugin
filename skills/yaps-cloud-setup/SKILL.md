---
name: yaps-cloud-setup
description: "Set up Yaps on Grok Bot's own Linux computer so the Bot can transcribe, caption, and edit files it holds. Needs the user's Yaps account and a sign-in code."
---

# Set up Yaps on the Bot's computer

Read [the runtime guide](references/runtime.md) first. It defines `<adapter>` and `<yaps>`.

Use this skill only when the user asks for Yaps on the Bot's own cloud computer, for example to process files they uploaded to the Bot, or accepts your offer to set it up. For files on the user's own computer, use local-computer execution instead and do not install anything here.

## Before you start

Tell the user, and get a clear yes:

- Yaps (about 170 MB, plus system libraries) will be installed on the Bot's cloud computer, and models download on first use of each feature.
- That computer will be signed in to their Yaps account as one of their devices. Work done there runs on that computer, not on theirs.
- They will need to read you a 6-digit code from a Yaps email. Never ask for a password; Yaps does not use one here.

## Steps

Run these on the Bot's own computer with normal command execution, not local-computer execution.

1. Preview, then install the official package. The installer checks the package's size and SHA-256 against the release manifest before installing, and uses `sudo -n`, so it never waits on a password prompt:

   ```text
   <adapter> install-linux --dry-run
   <adapter> install-linux
   ```

   `needs_root` means the Bot's computer does not allow passwordless root; explain that and stop. `unsupported_platform` or `unsupported_distribution` means this computer cannot run the Linux package.

2. Check the installed version supports a sign-in without the app window: `<yaps> auth --help` must list `login` and `verify`. If it does not, say that this needs a newer Yaps than 2.4.0 and stop.

3. Ask the user for the email address of their Yaps account, then send the code. Pass the address in a JSON request, never spliced into the command:

   ```text
   <adapter> --args-file - <<'YAPS_REQUEST'
   ["auth", "login", "--email", "their address exactly as given"]
   YAPS_REQUEST
   ```

   `already_sent: true` means a code emailed moments ago is still valid. A `Sign-in conflict` means this computer is already signed in; show which account and ask before running `<yaps> auth logout`.

4. Ask the user for the code from the email, then finish signing in:

   ```text
   <adapter> --args-file - <<'YAPS_REQUEST'
   ["auth", "verify", "--email", "their address", "--code", "123456"]
   YAPS_REQUEST
   ```

   Use the code once. Do not repeat it back, save it, or write it to any file.

5. Run `<yaps> auth status --pretty` and `<yaps> features list --pretty`. If the status is not `active`, the account needs an active trial or Yaps Pro; send the user to Yaps to check. Then carry on with the task that needed Yaps.

## Afterwards

- If `auth status` later reports an expired or incomplete plan cache, run `<yaps> auth refresh` before telling the user their access lapsed.
- To remove Yaps from the Bot's computer, run `<yaps> auth logout`. That signs the computer out and revokes its session.

## Boundaries

- Do not install Yaps on the user's own computer from here; they download it from https://yaps.ai/download.
- Do not copy the user's private files to the Bot's computer to use Yaps there.
- Never start a trial, checkout, or payment for the user.
