# Launch day checklist (Saturday, 24 October 2026)

Use this list on the morning of launch. Do the steps in order and tick each one off.

Note: Steps 2 to 4 only apply if the coming-soon redirect was added to the site. If you chose to block the site on Vercel instead, do step 1 only.

## Before you start

1. Confirm the live site on Vercel is the final version.
2. Open `js/store-config.js` and check that the bank account number and IBAN are the real ones. The current values are placeholders marked TODO.

## Take the site live

3. Remove the coming-soon redirect from the top of `index.html`. It's one block in the `<head>`, marked as the coming-soon redirect. You can also restore the backup copy of `index.html` if one was saved before the change.
4. Delete `coming-soon.html` and the coming-soon image from `images/`, or leave them. They don't affect the store once the redirect is gone.
5. If the site was blocked with Vercel's password or deployment protection, turn that off in the project settings on Vercel.
6. Deploy the updated version to Vercel, or roll back to the final version if that is simpler.

## Check the live site

7. Open the main address in a private browser window. Check that the store loads, not the coming-soon page.
8. Add one product to the basket and go through checkout. Check the bank details and delivery charge on the order screen. Cancel the test order if you can't complete it.
9. Check that the Volume 2 tablecloths and home accessories show their tags and prices.
10. Check the site on a phone.

## Search and sharing

11. Open Google Search Console and ask Google to re-check the homepage, so the new title and description appear.
12. Post the launch on Instagram with the feed post or story.

## After launch

13. Keep a copy of the final files in a safe place.
14. Tell the team which orders came in on the first day and check each one.
