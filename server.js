// Terminology: "AAS" is used throughout this server.js to refer specifically
// to xstAuth Light Server in this implementation.
//
// Terminology: "CCS" is used throughout this server.js to refer to the
// Confidential Client System (CCS) represented by this web server.
// In this example, server.js provides the web-server implementation of the CCS.

const fs = require("fs");
const https = require("https");
const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const cookieSecret = process.env.COOKIE_SECRET;
const clientId = process.env.CCS_CLIENT_ID; // Issued by xString Tech's AAS.
const clientSecret = process.env.CCS_CLIENT_SECRET; // Issued by xString Tech's AAS.
const key = fs.readFileSync(process.env.mTLSKEY);
const cert = fs.readFileSync(process.env.mTLSCERT);
const ca = fs.readFileSync(process.env.mTLSCA);
const jwtpublickey = fs.readFileSync(process.env.JWT_PUBLIC_KEY);
// To help prevent accidentally committing secrets to version control, add
// ".env" to your .gitignore file.
//
// Environment variables stored in .env are protected only by the security of
// the operating system and filesystem. They are not encrypted by default.
//
// For production environments, consider using a dedicated secrets-management
// service such as AWS Secrets Manager, Azure Key Vault, or Google Cloud
// Secret Manager for centralised and auditable management of sensitive data.
//
// Alternatively, sensitive data such as secrets and private keys may be stored
// in a secure operating-system file path with tightly controlled filesystem
// permissions.

// Front-channel authentication — CCS and AAS endpoints setup
const CCS = express();
CCS.use(express.json());
CCS.use(express.urlencoded({ extended: true }));
CCS.use(express.static(path.join(__dirname)));
CCS.use(cookieParser(cookieSecret));

const CCS_LANDING_PG_URL = "https://www.ccs.com";
// This is the CCS home page containing the passwordless sign-up/sign-in button.
// This is an example URL; your actual site may use a URL such as
// https://www.itmarket.com.
// It is the page where the user initially arrives to sign up/sign in and
// where the user is redirected after multiple unsuccessful authentication attempts.

const AAS_BASE_URL = "https://auth.ccs.com/authenticate";
// The AAS endpoint is accessible to the external browser/UI only when the
// request originates from or is redirected by the CCS.
// This is an example URL; your AAS URL may be
// https://auth.itmarket.com/authenticate.

const CCS_BASE_URL = "https://www.ccs.com/code-exchange";
// After authentication, the AAS redirects the user's browser to this CCS
// endpoint and includes the state and authorisation code.
// This is an example URL; your CCS URL may be
// https://www.itmarket.com/code-exchange.

const AAS_PRIVATE_URI = "aas.private.io";
// This is back-channel authorisation — CCS communicates with the AAS over HTTPS
// using a subdomain, mutual TLS (mTLS), a private URI, Client ID and
// Client Secret, with JWT verification.
// This is not accessible to the external browser/UI.
// It is used only for Authentication Notice of Intent (ANoI) and Token Exchange.

const authHeader =
  "auth " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
const agent = new https.Agent({ keepAlive: false, maxCachedSessions: 0 });
// The back-channel mTLS connection uses a new connection for each request.
// keepAlive is disabled and TLS session caching is disabled to require a
// fresh TCP/TLS connection and handshake each time.


CCS.get("/", (req, res) => {
// Front-channel — CCS-facing external browser/UI over HTTPS.
// This example simulates a simple welcome page with a sign-up/sign-in button.
// It is provided as a working example and does not include reCAPTCHA or other
// production security/filtering mechanisms that may be required by your CCS.
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Confidential Client User Interface</title>
    </head>
    <body>
      Passwordless Authentication
      <br></br>
      <form action="/request" method="POST"><button type="submit">Sign up / sign in</button></form>
    </body>
    </html>
      `);
  });
  
CCS.post("/request", async (req, res) => {
    const scope = "openid";
    let state = randomUUID(); // Generate a unique state value for the stateful integration with the AAS.
    const anoiPayload = JSON.stringify({
        state: state,
        canonical_username: "abc123_john_smith", // The canonical username is the CCS's authoritative internal account identifier used to uniquely identify the user's account. It may be a conventional username or another unique internal identifier maintained by the CCS.
        scope: scope,
        response_type: "code",
        redirect_uri: CCS_BASE_URL,
        landing_pg_uri: CCS_LANDING_PG_URL,
    });
  
    const anoi = {
        hostname: AAS_PRIVATE_URI,
        port: 8443,
        path: "/register-anoi",
        method: "POST",
        key: key,
        cert: cert,
        ca: ca,
        rejectUnauthorized: true, // Require and verify a valid server certificate presented by the AAS; reject the connection if verification fails.
        agent,

        headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(anoiPayload),
        },
    };
  
    // Attempt to initiate a back-channel mTLS connection with xString Tech's AAS 
    // over HTTPS using the private URI, Client ID, and Client Secret.
    try {
        const anoiReq = https.request(anoi, (anoiRes) => {
        const serverCert = anoiRes.socket.getPeerCertificate();

        // Enforce verification of the expected server certificate.
        if (!anoiRes.socket.authorized) {
            console.error(
            "Server certificate not authorized.",
            anoiRes.socket.authorizationError,
            );
            return anoiRes.end("Server certificate rejected.");
        }

        // Optional (checkServerIdentity): Verify that the server certificate contains 
        // the expected Common Name (CN) or Subject Alternative Name (SAN).
        const expectedCN = AAS_PRIVATE_URI;
        const actualCN = serverCert.subject.CN;
        anoiRes.on("error", (err) => {
            console.error("Request failed:", err.message);
        });
        if (expectedCN !== actualCN) {
            console.error(
            `Server identity mismatch. Expected CN=${expectedCN}, got CN=${actualCN}`,
            );
            return;
        }
  
        let data = "";
        anoiRes.on("data", (chunk) => (data += chunk));
        anoiRes.on("end", () => {
          if (anoiRes.statusCode !== 200 || anoiRes.statusCode === 401) {
            // If the AAS cannot generate the required token(s), redirect the browser 
            // to an appropriate page, such as a "Try again later" page.
            res.redirect(`${CCS_LANDING_PG_URL}`); // Redirect to your main website, sign-up/sign-in page, or another appropriate page.
          }
  
          // The ANoI has been successfully received and recorded by the AAS.
          try {
            const response = JSON.parse(data);
            console.log("Server responded to ANOI:", response.msg);
            console.log("Server responded to ANOI:", response);
            // Redirect the browser/UI to the AAS with the 'state' value only.
            // Sensitive information such as scope, client_id, and other authentication 
            // parameters remain on the back channel and are therefore not exposed to the browser/UI.
            res.cookie("state", `${response.state}`, {
              domain: "ccs.com", // Replace with your own parent domain (e.g., itmarket.com). If you see error code "IS 900090" in the browser, this means the domain is incorrect.
              secure: true,
              httpOnly: true,
              sameSite: "Lax",
            });
            res.redirect(`${AAS_BASE_URL}?state=${response.state}`);
          } catch (err) {
            console.error('JSON parse failed:', err.message);
            //console.error("AAS response:", data);
          }
        });
        anoiReq.end();
      });
  
      anoiReq.on("error", (err) => {
        console.error("Request failed:", err.message);
      });
  
      // Send the ANoI request payload to the AAS.
      anoiReq.write(anoiPayload);
      anoiReq.end();
    } catch (err) {
      console.error("Error during backchannel:", err.message);
      res.status(500).send("Backchannel request failed.");
    }
  });
  
CCS.post("/code-exchange", (req, res) => {
    // Front-channel — CCS-facing browser/UI over HTTPS.
    // Receive the state and authorisation code returned following authentication.
    const { state, authCode } = req.body;
    const authPayload = JSON.stringify({
        state: state,
        authcode: authCode,
        redirect_uri: CCS_BASE_URL,
    });
    const authCodeExchange = {
        hostname: AAS_PRIVATE_URI,
        port: 8443,
        path: "/token-exchange",
        method: "POST",
        key: key,
        cert: cert,
        ca: ca,
        rejectUnauthorized: true, // Require and verify a valid server certificate presented by the AAS; reject the connection if verification fails.
        agent,

        headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(authPayload),
        },
    };
  
    // Back-channel — initiate a new mTLS connection to xString Tech's AAS 
    // over HTTPS using the Client ID and Client Secret.
    try {
        const authReq = https.request(authCodeExchange, (authRes) => {
        const authServerCert = authRes.socket.getPeerCertificate();

        if (!authRes.socket.authorized) {
            console.error(
            "Server certificate not authorized.",
            authRes.socket.authorizationError,
            );
            return authRes.end("Server certificate rejected.");
        }

        // Optional (checkServerIdentity): Verify that the server certificate 
        // contains the expected Common Name (CN) or Subject Alternative Name (SAN).
        const expectedCN = AAS_PRIVATE_URI;
        const actualCN = authServerCert.subject.CN;
        authRes.on("error", (err) => {
            console.error("Request failed:", err.message);
        });
        if (expectedCN !== actualCN) {
            console.error(
            `Server identity mismatch. Expected CN=${expectedCN}, got CN=${actualCN}`,
            );
            return;
        }

        let data = "";
        authRes.on("data", (chunk) => (data += chunk));
        authRes.on("end", () => {
            if (authRes.statusCode !== 200 || authRes.statusCode === 401) {
            // If the AAS cannot generate the required token(s), redirect the browser 
            // to an appropriate "Try again later" page or your main website.
            res.redirect(`${CCS_LANDING_PG_URL}`);
            }
  
            try {
            const result = JSON.parse(data);
            console.log("Server responded result:", result);
            console.log("State:", result.response.state);
            const idToken = result.response.id_token;
            let idToken_value;
            try {
                jwt.verify(idToken, jwtpublickey, { algorithms: ["RS256"] });
                console.log("✅ ID token JWT signature verified");
                idToken_value = jwt.decode(idToken, { complete: true });
                console.log(idToken_value);
            } catch (err) {
                // If even one character of the JWT payload or other signed content is altered, signature verification will fail.
                console.log("❌ ID token JWT signature invalid");
                console.log(err.message);
            }

            const username = idToken_value.payload.canonical_username;
            const issuer = idToken_value.payload.iss;
            const npk = idToken_value.payload["aas:npk"];
  
            // The CCS owns and manages its own application-level session and access
            // information. xstAuth Light Server, powered by XSTRING TECH, provides the
            // passwordless authentication service used by the CCS.
            //
            // If your CCS requires additional capabilities such as user directories,
            // access tokens, refresh tokens, MFA, age assurance, or other advanced
            // authentication and security features, visit https://www.xstring.tech
            // for information about available XSTRING TECH solutions.

            const poolname = "User Directory";
            const usertype = "Member";
            const accessToken = "*****";
            const refreshToken = "*****";
  
            tracktrskey(
              npk,
              issuer,
              idToken,
              accessToken,
              refreshToken,
              true,
              true,
            );
  
            // Set a signed session cookie.
            // The signed cookie allows the CCS to detect whether the cookie has been 
            // modified after it was issued by the server.
            res.cookie(
              "longTTLSession",
              JSON.stringify({ npk, poolname, usertype }),
              {
                signed: true, // Cryptographically sign the cookie using the CCS cookie secret.
                httpOnly: true, // Prevent client-side JavaScript from accessing the cookie.
                secure: true, // Send the cookie only over HTTPS connections.
                sameSite: "Lax",
                maxAge: 24 * 60 * 60 * 1000, // 1 day
              },
            );
            res.redirect("/portal");
          } catch (err) {
            console.error("JSON parse failed:", err.message);
            console.error("Raw response:", data);
            res
              .status(500)
              .send(
                "Validation Failed: Unsuccessful!",
              );
          }
        });
        authReq.end();
      });
      authReq.on("error", (err) => {
        console.error("Request failed:", err.message);
      });
      // Send the POST request body to the AAS.
      authReq.write(authPayload);
      authReq.end();
    } catch (err) {
      console.error("Error during backchannel:", err.message);
      res.status(500).send("Backchannel request failed.");
    }
  });

// Protected route
CCS.get("/portal", (req, res) => {
    const sessionCookie = req.signedCookies.longTTLSession;
    const parsed = JSON.parse(sessionCookie);
    const randomNum = Math.floor(Math.random() * 100);
    const npk = parsed.npk;
    const [prefix, digits] = npk.split(".");
    // Format the NPK into groups of four digits to make it easier for the user to read and recognise.
    const groupedDigits = digits.replace(/(.{4})/g, "$1 ").trim(); 
    const NPK = `${prefix.toUpperCase()}.${groupedDigits}`;
    // Prevent the protected page from being cached by the browser or intermediate caching systems.
    res.setHeader("Cache-Control", "no-store");
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Confidential Client User Interface</title>
    </head>
    <body>
    <h1>${parsed.usertype} Web Portal</h1><h4>Welcome, ${NPK}. You have successfully signed in or signed up (if you are a new user).</h4>
    <h3> Random Number: ${randomNum.toString()} </h3>
    <p id="normalSite">This site has no age restrictions.</p>
      <form action="/logout" method="POST">
        <input type="hidden" name="npk" value=${parsed.npk}>
        <button type="submit">Logout</buton>
      </form>
    </body>
    </html>
    `);
  });

// Logout route.
// The CCS should invalidate the user's session and perform any other
// necessary logout processing before redirecting the user to the logout confirmation page.
CCS.post("/logout", (req, res) => {
    const npk = req.body.npk;
    const listingended = endlisting(npk);
    console.log(listingended);
    res.clearCookie("longTTLSession");
    res.redirect("/logout-confirm?ts=" + Date.now());
  });

// Logout confirmation.
// Display a confirmation page after the user's session has been terminated.
CCS.get("/logout-confirm", (req, res) => {
    // Prevent the logout confirmation page from being cached.
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
  
    res.send(`
    <h2>Sucessfully signed out</h2>
    <a href=/>Start Live Demo</a>
    `);
  });
  
  const keystore = new Map();
  async function tracktrskey(
    npkin,
    issin,
    idTokenin,
    accessTokenin,
    refreshTokenin,
    validityin,
    refreshvalidin,
  ) {
    const npk = String(npkin).trim();
    const iss = String(issin).trim();
    const idToken = String(idTokenin).trim();
    const accessToken = String(accessTokenin).trim();
    const refreshToken = String(refreshTokenin).trim();
    const validity = String(validityin).trim();
    const refreshvalid = String(refreshvalidin).trim();
    if (!keystore.has(npk)) {
      keystore.set(npk, {
        iss,
        idToken,
        accessToken,
        refreshToken,
        validity,
        refreshvalid,
      });
      return;
    }
  }

  async function endlisting(npk) {
    // Remove the user's active session or listing from the CCS when the user has signed out.
    if (keystore.has(npk)) {
      keystore.delete(npk);
      return true;
    }
    return false;
  }
  
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
  });
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
  });
  
  CCS.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
  });

// Listen on all network interfaces available to the server.
//
// In many cloud environments, the public IP address is managed by the
// cloud provider and is not directly assigned to the server's network
// interface. In such environments, binding Node.js to the public IP may
// fail. Using 0.0.0.0 allows the server to accept connections through
// the network interfaces available to the server.
//
// IMPORTANT: 0.0.0.0 does not automatically expose the server to the
// Internet. The cloud provider's firewall/security group, the server's
// firewall, and the application/network configuration determine whether
// external clients can reach the service, such as HTTPS on port 443.
const ipaddress = "0.0.0.0";

// HTTPS Server (Front-channel — CCS-facing user interface over HTTPS).
https
  .createServer(
    {
      key: fs.readFileSync(process.env.PRIVATE_KEY),
      cert: fs.readFileSync(process.env.CERTIFICATE),
    },
    CCS,
  )
  .listen(443, ipaddress, () => {
    console.log(
      `CCS (frontchannel) running on ${CCS_LANDING_PG_URL}:443`,
    );
  });

// Clear the console periodically to make transaction-related troubleshooting easier.
setInterval(() => { process.stdout.write('\x1Bc'); }, 5 * 60 * 1000,);
