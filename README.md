# Yaps for Grok Bot and Cursor

**Supercharge Grok Bot and Cursor with powerful local AI tools.** This plugin lets your agent use the [Yaps](https://yaps.ai) desktop app on your own computer. Your recordings, videos, and notes are processed there, not uploaded to a hosted AI service.

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

Every export goes to a new file. Your originals are never overwritten.

## Setup

1. [Download Yaps](https://yaps.ai/download) for macOS or Windows, open it, and sign in. New accounts start with a free trial; some features need Yaps Pro.
2. Install [Node.js](https://nodejs.org) 22 or newer on the same computer.
3. Install the plugin. In Cursor, run `/add-plugin yaps`. In Grok Bot, open **Plugins** in the sidebar and search for Yaps.
4. **Grok Bot only:** allow commands on your computer in **Settings > General > Bot > Execution on Local Computer**. Keep the default, **Ask every time**, if you want to approve each command. Yaps is on your computer, not Grok Bot's cloud computer, so the plugin cannot work without this.
5. Ask your agent to check that Yaps is ready. When a feature needs a model download, the agent tells you the size and asks first.

No API key or separate account is needed.

## How it works

Each skill tells the agent to run one command on your computer:

```text
npx --yes --package https://codeload.github.com/richawo/yaps-plugin/tar.gz/3919104633affd35d45dd0d29cb9c62a6c218eb4 yaps-agent -- <Yaps arguments>
```

That fetches this repository's own adapter (`runtime/`) from one pinned commit.

**Why it downloads anything.** Grok Bot keeps installed plugin files on its cloud computer, but Yaps runs on your computer, so the command that runs there has to bring the adapter with it. The pin is an immutable commit of this repository, so what runs is exactly the `runtime/` code you can read here, and changing it needs a new plugin release that goes through review again. The adapter has no dependencies and no install scripts. It finds the Yaps command-line tool that ships with the desktop app, checks its version, and runs it with the arguments the skill chose. It launches that tool directly, never through a shell, and the skills pass your text as JSON on stdin rather than splicing it into a command.

## Privacy and permissions

- **Credentials:** none requested. The adapter reuses your signed-in Yaps app. Its account check reports only whether you have access, never your email or tokens.
- **Network:** `npx` downloads the adapter from `codeload.github.com` on first use. The Yaps app itself can contact `yaps-api.richardawoyemi.workers.dev` to refresh your account and, only after you agree, to download feature models. See the [Yaps privacy policy](https://yaps.ai/privacy).
- **Your data:** files stay on your computer. Results you ask for, such as a transcript or note, are shown to your agent and follow its own data handling. The plugin adds no telemetry.
- **Notes vault:** the memory skill reads or changes notes only when you ask, and never works around a Yaps permission that says no.

## Support and source

Made by Yaps AI. Questions: [support@yaps.ai](mailto:support@yaps.ai). MIT licensed; Yaps models keep their own licenses. The skills are generated from the Yaps application source and published here; please open issues in this repository.

[Yaps](https://yaps.ai) · [Privacy](https://yaps.ai/privacy) · [Terms](https://yaps.ai/terms)
