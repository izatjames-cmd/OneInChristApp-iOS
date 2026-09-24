# App-only member menu

1. In TYPO3, each page has its own header. Update every individual page in each language, not just the language's home page.
2. Paste `member-menu-english.html`, `member-menu-danish.html`, or `member-menu-urdu.html` AFTER that language's existing navbar code. These files are additions, not replacements.
3. Publish all three language menu changes before installing the updated Android app. The updated app removes the floating buttons, so the website additions are required for member access.
4. For the English menu supplied in this conversation, `english-navbar-complete.html` contains the original code plus the addition and can replace the whole supplied block.
5. For the supplied Danish menu, `danish-navbar-complete.html` contains the original Danish header plus the addition. Replace the existing header block on each Danish page with this complete file; do not also append the separate Danish addition.

6. For the supplied Urdu menu, `urdu-navbar-complete.html` contains the original Urdu header plus the addition, preserving its font and right-to-left layout. Replace the existing header block on each Urdu page with this complete file; do not also append the separate Urdu addition.

The add-on expects the menu container to have class `mobile-dropdown`, confirmed in all three supplied language menus.

Public website visitors see no member links. Inside the app, Member Login appears at the end of the hamburger menu; Member Area appears after an approved member signs in. Existing app permissions still apply. No credentials or member details are sent to TYPO3.

Verify each language in the updated Android app: login, member-area opening, signing out, navigating to another language, and returning to the starting page. Also visit the published pages in an ordinary browser to confirm the links stay hidden.

The TYPO3 changes have been prepared locally, not published by Codex.
