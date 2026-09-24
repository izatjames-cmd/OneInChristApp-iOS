# English, Danish, and Urdu language improvements

## Second language review before iPhone work

- Core and learned vocabulary now match complete Unicode words, preserving longer Urdu words and Danish letters. Longest phrases are processed first without cascading core replacements.
- Removed the ambiguous Urdu alias سن for sin; ordinary sentences containing this word remain intact.
- Divine-title normalization no longer inserts “our” or duplicates existing possession. Correct direct-address titles are preserved.
- English honorific correction handles they're/they've and curly apostrophes without producing He're/He've.
- Devotion and reflection generation guidance now covers sentence cohesion, natural prepositions, direct prayer, accepted synonyms, and distinctions among grace, mercy, redemption, atonement, resurrection, and judgment.
- Automated checks cover whole-word protection, every dictionary alias's stability under repeated normalization, title possession, learned vocabulary, and contractions. Live generated wording still needs human review.

Release this second update with a new Android build and Firebase Functions deployment. No deployment is performed automatically.

This update extends the v14 language system in the working project.

- Live Urdu sermons: source-supported life-surrender phrases now correct the divine recipient to English “Him” and Danish “ham”, including sentences containing a third-person subject. Other object pronouns are not changed by this phrase repair.
- Urdu diacritics are normalized for pronoun analysis. Biblical names match complete words, and two different named biblical men or women now count as distinct antecedents.
- English agreement uses explicit present-tense verb pairs instead of inventing inflections for unknown words, adverbs, or past-tense verbs.
- Shared speech vocabulary adds natural surrender, renewal, and Christian-life phrases in all three languages.
- Both backend generation prompts include shared instructions for pronoun reference, agreement, tense, negation, Danish reflexive possession, respectful Urdu, and consistent Christian vocabulary. Bible-source text and references are not edited.

## Validation and release

Run `node --experimental-vm-modules --test tests/*.test.mjs`, `node --check functions/index.js`, and `npm.cmd run build`. Copy the web build into Android with `npx.cmd cap sync android`.

The frontend must be released in a new Android build. The generation instructions also require deployment of Firebase Functions; rebuilding Android alone does not activate those backend changes. Existing saved devotions and reflections are not regenerated. No deployment or signed APK release was performed as part of this update.

These are targeted deterministic corrections and generation guidance, not a full linguistic parser or a guarantee of perfect translation. Unknown or competing antecedents still require human review. Validation uses text fixtures rather than live Azure speech or generated production content.
