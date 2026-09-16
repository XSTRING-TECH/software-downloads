# AAS — xstAuth Light Server Configuration

This document provides a quick reference for the configuration values required
to connect the xstAuth Light Server (AAS) with your Confidential Client System
(CCS).

For complete installation and configuration instructions, see:
xstAuth Light Server > Help > How to Setup
---

## **IMPORTANT — Password Required**

Assumption: You have completed the `First-Run Server Admin Password Setup`. If not, refer to [`02_Prep_AAS_Win_Server.md`](02_Prep_AAS_Win_Server.md) for detailed instructions.

---

## Add Licence Certificate

Open the **xstAuth Light Server** and add the downloaded licence certificate to activate the 12-month no-cost production licence for testing and production deployments during the applicable licence term, subject to the licence terms and eligibility requirements.

The default brand name is Passwordless Community. If you prefer to use your own brand name instead of the default name, email us at [**info@xstring.tech**](mailto:info@xstring.tech) with the name (maximum 25 characters) you would like to use and the website or platform URL.

We will provide you with a dedicated **12-month licence certificate at no cost**. The 12-month licence is **renewable at no cost**, subject to eligibility and the applicable licence terms. Refer to [`README.md`](README.md) in the **Licence Renewal** section.

The licence is provided at no cost and **no donation is required**. However, if you would like to support the continued development and maintenance of the project, you can make an optional donation:

[**Support the project with an optional donation**](https://donate.stripe.com/9B628r2rc2x3fHy4nb43S02)

---

## TLS Certificates

### Customer Branding 

These values are displayed on the authentication/login page.

**Organisation Name:** `Passwordless Community`

The name **“Passwordless Community”** is automatically associated with your licence certificate.

**Service Name:** `any text`
**Example:** `Student Portal`

**Function Name:** `any text`
**Example:** `Authenticate, Sign-up/Sign-in`

---

### TLS Public CA Config

These certificates are used for the public HTTPS connection.

Specify the file paths for the private key, certificate, and certificate chain obtained earlier from a publicly trusted Certificate Authority (CA).

**Private Key Path:** `'C:/xstAuth/certs/auth.yourdomain.com-key.pem'`

**Leaf Certificate Path:** `'C:/xstAuth/certs/ccs.yourdomain.com-crt.pem'`

**Intermediate Chain Path:** `[Optional — enter path if required]`

**Full Chain Path:** `[Optional — enter path if required]`

---

### JWT Signing Config

Assumption: In the previous steps, you moved the downloaded test PEM file `privateKeyJWT.pem` into `C:/xstAuth/AAS_JWT`.

Enter the following path in the **Signing Private Key Path** field:

**Signing Private Key Path:** `C:/xstAuth/AAS_JWT/privateKeyJWT.pem`

> **IMPORTANT:**
> For production use, you **MUST** generate and use your own JWT signing keys.
> 
> For instructions, see **Help > How to Setup**, under the heading **“How to generate mTLS client/server certificates and private keys”**.
>
> **Never use the sample key in a production environment.**

---

## MUTUAL TLS (mTLS)

The **xstAuth Light Server** includes a **How to Setup** page under the **Help** menu containing sample mTLS credentials and token-signing and verification credentials. The same credentials are also provided as PEM files.

**IMPORTANT:**
For production use, you **MUST** generate your own mTLS credentials.

### Auth Server mTLS Credentials Setting

The following values must correspond to the mTLS configuration used by your
CCS.

> To use the sample mTLS credentials, go to **Help > How to Setup** and find the relevant keys and certificates. You can copy and paste the provided private key and certificates into the required configuration fields.

**mTLS Server Private Key:**

```text
-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
```

Must contain the same key configured as `mTLSKEY` on the CCS.

The CCS may use a file path instead:

```text
mTLSKEY = 'C:/xstAuth/CCS_mTLS/mtlsKey.pem'
```

**mTLS Server Certificate:**

```text
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
```

Must contain the same certificate configured as `mTLSCERT` on the CCS.

The CCS may use a file path instead:

```text
mTLSCERT = 'C:/xstAuth/CCS_mTLS/mtlsCert.pem'
```

**mTLS Root CA:**

```text
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
```

Must contain the same CA configured as `mTLSCA` on the CCS.

The CCS may use a file path instead:

```text
mTLSCA = 'C:/xstAuth/CCS_mTLS/mtlsRootCA.pem'
```

---

## CONNECTIONS

### AAS Public Connection Config

These settings define the public endpoint through which end-user browsers connect 
to the xstAuth Light Server.

**Authenticator Domain:** `auth.yourdomain.com`
**Example:** `auth.itmarket.com`

**Public IP Address:** `0.0.0.0`
**Example:** `204.100.100.222`

```text
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
// The TLS certificates configured for the xstAuth Light Server are used
// to secure this public HTTPS connection.
```

**Public Port:** `443`

**Request Rate Limiter:** `10` — Adjust to your own threshold limit.

---

### CCS Private Connection Config

These settings define the private connection between the CCS and the
xstAuth Light Server.

**Authenticator Private URI:** `aas.private.io`

**Example:** `aas.itmarket-internal.net`

> **Note:** If you change `aas.private.io` to your own internal domain, you will need to generate new mTLS credentials using the corresponding hostname.

**Authenticator Private IP Address:** `10.11.12.200` *(replace with the actual private IP address)*

The CCS must be able to reach this private static IP address. See:
[`04_Config_Internal_DNS.md`](04_Config_Internal_DNS.md) 

**Authenticator Private Port:** `8443`

Ensure that HTTPS traffic is allowed through the Windows Firewall. See:
2.2 xstAuth Light Server Firewall Rule in the [`04_Config_Internal_DNS.md`](04_Config_Internal_DNS.md) 

---

## CCS CREDENTIALS

### Confidential Client System (CCS) Credentials

Generate these credentials on the xstAuth Light Server.

**Client ID:** `9ug2zyj6or7qp71dsxxu5nvpmz`
**Example only.**

**Client Secret:** `vaNp...d7wA`

**IMPORTANT:** New credentials (Client ID and Client Secret) are generated each time. You must update the corresponding credentials in your CCS `.env` file every time you generate new credentials. If the credentials are out of sync, verification will fail.

You can now copy and paste the **Client ID** and **Client Secret** into the provided `env-example` file on your CCS Web Server.

---

Enter the `AUTH_CODE_REDIRECT_URI` and `MAIN_LANDING_PAGE` values from the
CCS Web Server.

### MAIN_LANDING_PAGE

```text
MAIN_LANDING_PAGE : https://www.yourdomain.com
```

```text
// This is the CCS home page containing the passwordless sign-up/sign-in button.
// This is an example URL; your actual site may use a URL such as
// https://www.itmarket.com.
// It is the page where the user initially arrives to sign up/sign in and
// where the user is redirected after multiple unsuccessful authentication attempts.
```

### AUTH_CODE_REDIRECT_URI

```text
AUTH_CODE_REDIRECT_URI : https://www.yourdomain.com/code-exchange
```

```text
// After authentication, the AAS redirects the user's browser to this CCS
// endpoint and includes the state and authorisation code.
// This is an example URL; your CCS URL may be
// https://www.itmarket.com/code-exchange.
```
---

## Start xstAuth Light Server

Your **xstAuth Light Server** configuration is now complete.

Close the server using **Confirm Exit**, then reopen the server to load all configuration changes.

Start the server:

```text
Run > Start Server
```

If the server starts successfully, keep it running and proceed with the **CCS Web Server** configuration.

Refer to [`07_Config_CCS_Web_Server.md`](07_Config_CCS_Web_Server.md).

---

## PRODUCTION SECURITY CHECKLIST

Before deploying to production, confirm that:

* [ ] Production TLS certificates are installed.
* [ ] Development/self-signed certificates have been replaced where required.
* [ ] A unique JWT signing key pair has been generated.
* [ ] Production mTLS credentials have been generated.
* [ ] The CCS and AAS mTLS configuration values match.
* [ ] A unique Client ID and Client Secret have been generated.
* [ ] The CCS Client ID and Client Secret match the AAS configuration.
* [ ] The CCS public-facing Redirect URI is correctly configured.
* [ ] The CCS Landing Page URL is correctly configured.
* [ ] Private keys and secrets are protected and are not committed to source
  control or publicly distributed.
* [ ] Sample/test credentials have been removed from production configuration.
* [ ] The CCS can reach the AAS through its private IP/URI.
* [ ] The public AAS endpoint is reachable through the configured HTTPS port.
* [ ] Firewall rules permit only the required network traffic.

---
