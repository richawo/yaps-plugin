# Yaps for Grok Bot and Cursor

**Supercharge Grok Bot and Cursor with powerful AI tools from Yaps.** By default, this plugin uses the [Yaps](https://yaps.ai) desktop app on your own computer. Your recordings, videos, and notes are processed there. Optional Bot computer setup processes files you give the Bot on its cloud computer.

## What you can ask for

| Ask your agent to | Skill |
| --- | --- |
| Transcribe an interview, podcast, or voice memo | `yaps-transcription` |
| Turn a meeting recording into speaker-labelled notes | `yaps-meeting-transcription` |
| Add styled, word-highlighted captions to a video | `yaps-auto-captions` |
| Make a timed `.srt` subtitle file | `yaps-srt-generator` |
| Cut dead air out of a talking-head video | `yaps-video-clipping` |
| Translate text, Markdown, or subtitles | `yaps-translation` |
| Turn a script into a voice-over | `yaps-text-to-speech` |
| Remove noise and hiss from a recording | `yaps-audio-cleaner` |
| Remove an image background | `yaps-background-removal` |
| Generate an image from a prompt | `yaps-image-generate` |
| Save a video's sound as MP3, WAV, or M4A | `yaps-video-to-audio` |
| Find or save notes in your private Yaps vault | `yaps-memory` |
| Set up or fix voice dictation | `yaps-dictation` |
| Anything else Yaps can do | `yaps` |
| Set up Yaps on Grok Bot's own computer | `yaps-cloud-setup` |

Every export goes to a new file. Your originals are never overwritten.

## Setup

1. [Download Yaps](https://yaps.ai/download) for macOS or Windows, open it, and sign in. New accounts start with a free trial; some features need Yaps Pro.
2. On Yaps 2.4.0 or older only, install [Node.js](https://nodejs.org) 22 or newer on the same computer (or update Yaps instead).
3. Install the plugin. In Cursor, run `/add-plugin yaps`. In Grok Bot, open **Plugins** in the sidebar and search for Yaps.
4. **Grok Bot with Yaps on your computer:** allow commands on your computer in **Settings > General > Agent > Execution on Local Computer**. Keep the default, **Ask every time**, if you want to approve each command. This setting is not needed if you choose the optional Bot computer setup below.
5. Ask your agent to check that Yaps is ready. When a feature needs a model download, the agent tells you the size and asks first.

No API key or separate account is needed.

### Yaps on Grok Bot's own computer (optional)

Grok Bot also has its own Linux cloud computer. Ask it to "set up Yaps on your computer" and the `yaps-cloud-setup` skill checks the official package's size and SHA-256 before installing it there. Headless sign-in requires a Yaps release that advertises `auth login` and `auth verify`; the current v2.4.0 release does not. The skill stops before asking for your email or code if those commands are unavailable. Once supported, use this path for files you give the Bot. It counts as one of your devices, and work runs on that computer, not yours. Ask the Bot to run `auth logout` to remove it.

## How it works

The skills run the Yaps command-line tool that ships inside the app (`yaps_cli`). With a current Yaps, nothing else is needed: the agent passes your text to it as JSON on stdin, never splicing it into a command line.

On Yaps 2.4.0 and older, the skills fall back to this repository's adapter, run with Node.js 22 or newer:

```text
npx --yes --package https://codeload.github.com/richawo/yaps-plugin/tar.gz/c2f69d86c2bbbe0c8bda901f77cf26671f8ad051 yaps-agent <Yaps arguments>
```

It accepts the same commands, checks the installed Yaps version, and launches `yaps_cli` directly, never through a shell. It has no dependencies and no install scripts.

**Why it downloads anything.** Grok Bot keeps installed plugin files on its cloud computer. To run Yaps on your computer, a command there has to bring the adapter with it. The pin is an immutable commit of this repository, so what runs is exactly the `runtime/` code you can read here, and changing it needs a new plugin release that goes through review again.

### MCP tools

The plugin also declares two MCP servers, `yaps` (transcription, meetings, captions, subtitles, translation, speech, audio cleanup, background removal, Auto Cut, video to audio, dictation) and `yaps-memory` (your notes vault). They start with `npx` from one pinned commit of [richawo/yaps-plugins](https://github.com/richawo/yaps-plugins) and run on whichever computer hosts the plugin: yours in Cursor, the Bot's in Grok Bot. They use `@modelcontextprotocol/sdk` from npm, run no install scripts, and call the same installed Yaps tools. Memory connects as a generic local MCP client and only works after you allow that in Yaps.

## Privacy and permissions

- **Credentials:** none requested. The adapter reuses your signed-in Yaps app. Its account check reports only whether you have access, never your email or tokens.
- **Network:** `npx` downloads the adapter and MCP servers from `codeload.github.com` (and the MCP SDK from `registry.npmjs.org`) on first use. Setting Yaps up on Grok Bot's computer downloads the package from `github.com/richawo/yaps-releases`. The Yaps app itself can contact `yaps-api.richardawoyemi.workers.dev` to refresh your account and, only after you agree, to download feature models. See the [Yaps privacy policy](https://yaps.ai/privacy).
- **Your data:** files stay on the computer running Yaps. With optional cloud setup, files you give the Bot are processed on its computer. Results you ask for, such as a transcript or note, are shown to your agent and follow its own data handling. The plugin adds no telemetry.
- **Notes vault:** the memory skill reads or changes notes only when you ask, and never works around a Yaps permission that says no.

## Support and source

Made by Yaps AI. Questions: [support@yaps.ai](mailto:support@yaps.ai). MIT licensed; Yaps models keep their own licenses. The skills are generated from the Yaps application source and published here; please open issues in this repository.

[Yaps](https://yaps.ai) · [Privacy](https://yaps.ai/privacy) · [Terms](https://yaps.ai/terms)
