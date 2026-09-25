# Changelog

## 1.0.2

- Run the adapter correctly when an agent installs it through a file or directory symlink.
- Include the same verified adapter fix as the portable skills.

## 1.0.1

- Clearer setup and account requirements for new users.
- Detect JSON requests and headless sign-in from the installed CLI's capabilities.
- Share the pinned MCP configuration source with the Hermes and OpenClaw integrations.

## 1.0.0

- First Marketplace release: 14 skills for transcription, meeting notes, captions, subtitles,
  Auto Cut, translation, text to speech, audio cleanup, background removal, image generation,
  video to audio, notes memory, and dictation, using the Yaps desktop app on the user's computer.
- Works in Cursor and in Grok Bot through local-computer execution.
- MCP servers for the full Yaps toolset, and `yaps-cloud-setup`, which installs a verified
  Yaps package on Grok Bot's own Linux computer when a compatible Yaps release is available.
