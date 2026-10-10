# PearPortOS v0.5.6 — first-run setup

This replaces the three public demo users with a single user-created browser-local account.

On first visit:
1. A Catalina-inspired PearPortOS welcome card appears.
2. Enter a display name (required).
3. Enter a password of at least 5 characters (required).
4. Press/click anywhere on the welcome card to finish and enter the desktop.

On later visits, select your single user and enter the password. Password checking happens as you type; Enter is not needed. There are no login-success notifications.

## Security and data scope

This is NOT real operating-system authentication and should not protect sensitive data. The site uses localStorage for an account record containing a random salt and a PBKDF2-SHA256 password verifier (160,000 iterations), not a plaintext password. The actual PearPortOS virtual files and settings are stored separately in your browser, so this account does not isolate files between people who have physical access to the browser. Anyone able to inspect or clear the browser's local data can bypass or reset this demonstration login. **Do not reuse a real device/account password.** No password is transmitted to a server by this feature. Cryptography requires HTTPS or another secure browser context.

To reset the local account if you forget the password, remove only the `pearport-user-v1` localStorage key using the browser developer tools, then reload the site. Clearing all site data also removes other PearPortOS virtual data.

The UI references user-provided Catalina-inspired setup artwork in `Welcome to mymacOS Catalina.pdf`, with PearPortOS branding.
