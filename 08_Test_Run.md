# Test Run — User's Perspective

This section describes the complete user experience when testing passwordless sign-in and sign-up with the mobile authenticator applications.

## 1. Download a Mobile Authenticator Application

Use the official application stores to download and install an authenticator application.

### myAge Authenticator

**[Download on the App Store](https://apps.apple.com/us/app/myage/id6763018516)**

**[Get it on Google Play](https://play.google.com/store/apps/details?id=com.xstring.poadc&pcampaignid=web_share)**

### xString Advanced Authenticator (iRC Auth)

**Download on the App Store — Coming Soon**

**[Get it on Google Play](https://play.google.com/store/apps/details?id=com.xstring.ircauth&pcampaignid=web_share)**

## 2. Prepare the Authenticator

Follow the in-app setup guide to configure the authenticator.

The authenticator is ready to use when the **`Confirm it's you`** button is displayed.

## 3. Open the Test Website

Operate as a user, either as a returning user or a new user.

> Assumption: Both the **CCS Web Server** and the **xstAuth Light Server** are running.

Open a web browser and enter:

`https://www.yourdomain.com`

Follow the sign-in or sign-up process presented by the website.

---

### Troubleshooting: No Response After Sign Up / Sign In

If there is no response after clicking `Sign up / Sign in`, check the CCS Web Server terminal. You may see an error similar to:

```text
Server responded to ANOI: undefined
Server responded to ANOI: { Forbidden: 'Invalid CCS Credentials' }
```

#### A. Check xstAuth Light Server Configuration

Close and reopen the **xstAuth Light Server**, then go to **Data > Current Setup**.

Check the following two entries and make sure they are correct:

```text
MAIN_LANDING_PAGE : https://www.yourdomain.com
AUTH_CODE_REDIRECT_URI : https://www.yourdomain.com/code-exchange
```

#### B. Check CCS Web Server Configuration

Open `server.js` in the CCS Web Server project and verify the following configuration values:

```javascript
const CCS_LANDING_PG_URL = "https://www.ccs.com";
const AAS_BASE_URL = "https://auth.ccs.com/authenticate";
const CCS_BASE_URL = "https://www.ccs.com/code-exchange";

res.cookie("state", `${response.state}`, {
  domain: "ccs.com", // Replace with your own parent domain (e.g., itmarket.com)
```

Check the Authenticator Private URI:

```javascript
const AAS_PRIVATE_URI = "aas.private.io";
```

Replace the example domain `ccs.com` with the appropriate domain for your deployment. The private URI must match the hostname used by the mTLS configuration.

#### C. Cross-Check Configuration

Compare the configuration in **Data > Current Setup** on the xstAuth Light Server with the corresponding values in `.env` and `server.js` on the CCS Web Server.

Make sure the following are correct:

* Client ID and Client Secret.
* Main landing page and auth code redirect URI.
* CCS landing page and auth code exchange URLs.
* mTLS credentials and certificate paths.

#### D. Restart and Test

Restart both the **xstAuth Light Server** and the **CCS Web Server**.

Return to the website and try `Sign up / Sign in` again.

#### If the problem persists, check the CCS Web Server terminal for any new error messages and review the configuration values again.

---

## 4. Start Authentication

If there are no problems, select **`Confirm it's you`** in the authenticator app.

Enter the **WACC (Web Auth Challenge Code)** displayed on the sign-in or sign-up page of:

`https://auth.yourdomain.com`

## 5. Sign the WACC

Sign the WACC using the mobile authenticator.

### Same Device

If the authenticator and browser are on the same device:

1. Copy the generated signature from the authenticator.
2. Return to the browser.
3. Paste the signature into the login modal.
4. Submit the signature to complete authentication.

### Cross Device

If the authenticator and browser are on different devices:

1. Manually enter the WACC in your authenticator app.
2. Sign the WACC using the authenticator.
3. Use the browser's camera, which appears in the login modal, to scan the QR code displayed in the authenticator app.
4. **Done!**

## 6. Test Complete

Authentication is complete when the website successfully returns the user to the **Web Portal** and displays the **Welcome** message from the protected route:

```javascript
// Protected route
CCS.get("/portal", (req, res) => {
```

From the user's perspective, the process is simple:

**Open the website → confirm it's you → enter the WACC → sign it → complete authentication.**

That's it. The test is complete.

Now return to your **CCS Web Server** and inspect the **ID Token** and related user metadata returned from a successful `authCode` exchange.
