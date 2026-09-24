# Shared Church Vocabulary - Version 7

This folder is the single shared Christian terminology source for:

- Live Sermon Translation
- Daily Devotion
- AI Bible Reading

## Structure

Each language is split into small topic/chapter files. Do not merge them into one large file.

- `danish/` - Danish church vocabulary
- `english/` - English church vocabulary
- `urdu/` - Pakistani Urdu Christian church vocabulary
- `terminology/` - cross-language preferred terminology tables and common transliteration corrections
- `churchVocabulary.js` - small public API used by app features
- `terminologyNormalizer.js` - terminology normalization logic
- `vocabularySearch.js` - vocabulary search helper

## Scripture rule

Bible verse text and Bible references must never be rewritten by terminology normalization. The shared vocabulary may be used for search, explanations, reflections, prayers, applications, sermon translation, and questions, but Bible source text remains exactly as provided by the Bible source.
