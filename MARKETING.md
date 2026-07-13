# Prism — Marketing

Two posts, personal voice, posted manually to X. No automation involved, these are not agent-generated or agent-scheduled.

---

## Post 1: Concept

**When to post:** once the prompt is finalised and tested, before the full ten-blob demo is recorded.

```
most memory agents keep one big pile of everything they've learned about you

no way to tell what you actually said from what it guessed

built prism for the walrus memory prompt jam, one prompt that splits everything into three namespaces on walrus mainnet: facts, beliefs, questions

so you can actually see how sure it is before you trust it
```

---

## Post 2: Proof

**When to post:** after the console is deployed and the ten-plus blob threshold is cleared, ideally alongside or shortly after the demo video upload.

```
watched prism write its first blobs to walrus mainnet tonight

facts in teal, beliefs in amber, questions in violet, each one a real blob you can click into

the interesting part isn't the storage, it's watching an agent admit what it's still unsure about instead of quietly assuming

full prompt is copy paste, link below
```

---

## Notes

Both posts stay lowercase with no periods and blank lines between thoughts, matching the established personal voice. Neither references how long the build took. Attach the demo video or a screen recording of the light-split animation to whichever post goes up second, that is the moment worth showing rather than describing.

---

## Submission Notes

**Project title:** Prism

**Tagline:** Facts, beliefs and questions, kept apart on purpose.

**Built with:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Motion
- Zustand
- Express
- Claude API
- Walrus Memory (`@mysten-incubation/memwal`), Mainnet

**Project description (under 200 words):**

Most memory-enabled agents keep one flat pile of everything they have learned, with no way to tell what a user actually said from what the agent inferred or what it never confirmed. Prism is a system prompt that fixes this by splitting an agent's memory into three Walrus Memory namespaces: facts for confirmed information, beliefs for working assumptions, questions for unresolved gaps. Every memory the agent writes gets classified by the prompt's own rules before it is stored, and every answer the agent gives cites which namespace it drew from, so confidence is visible rather than implied.

The console built around the prompt proves it works in real time. A conversation runs against Claude with the Prism prompt active, each classified memory writes to Walrus Mainnet as a real blob, and a live namespace panel shows the split happening as it happens, teal for facts, amber for beliefs, violet for questions, each card linking to its blob. The prompt itself is the submission, copy-pasteable in full from the panel. The console exists only to show a judge the mechanism working rather than describing it.

**Demo video flow:**
1. Open the Prism console, corner instrument at rest
2. Send a message stating something clearly, a hedge, and an open gap in one exchange
3. Show the light-split animation landing in the correct namespace column for each
4. Ask a follow-up that depends on something established earlier, show the agent citing the namespace it recalled from
5. Open the prompt panel, copy the full prompt text
6. Briefly state the blob count and agent address as mainnet proof

---

## Checklist

- [ ] Prompt tested in isolation against Claude directly before any app code exists
- [ ] MemWal account created and first blob confirmed on Mainnet
- [ ] Console deployed and reachable, backend and frontend both live
- [ ] Post 1 goes out once the prompt is finalised and tested
- [ ] Ten or more real blobs written across a real conversation before recording
- [ ] Post 2 goes out alongside or shortly after the demo video upload
- [ ] Demo video under three minutes, uploaded to Walrus
- [ ] DeepSurge registration, Walrus submission form and MemWal feedback form all completed
- [ ] Discord joined, demo posted on X with #Walrus
- [ ] Agent address and blob count captured for the submission form's proof fields
