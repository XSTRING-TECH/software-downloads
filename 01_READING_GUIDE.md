# Documentation Reading Guide

This guide explains which documents to read and the recommended order for setting up and using the xstAuth Light Server.

## Recommended Reading Order

### 1. README.md

Start here for an overview of the xstAuth Light Server, its purpose, requirements, and the overall installation process.

### 2. 02_Prep_AAS_Win_Server.md

Follow this guide to prepare the Windows Server instance hosting the xstAuth Light Server (AAS), including the required system configuration and dependencies.

### 3. 03_Prep_CCS_Win_Server.md

Follow this guide to prepare the Windows Server instance hosting your Confidential Client System (CCS), including the required system configuration and dependencies.

### 4. 04_Config_Internal_DNS.md

Follow this guide to configure the internal DNS records required for communication between the xstAuth Light Server (AAS) and your Confidential Client System (CCS).

### 5. 05_Generate_RSA_Key_Pairs.md

Follow this guide to generate the RSA key pairs and certificates required for mTLS and JWT authentication.

### 6. 06_Config_AAS_Auth_Server.md

Follow this guide to configure the xstAuth Light Server (AAS), including the required authentication server settings and connections with your Confidential Client System (CCS).

### 7. 07_Config_CCS_Web_Server.md

Follow this guide to configure your Confidential Client System (CCS), including the required server settings, mTLS, JWT verification, and connection with the xstAuth Light Server (AAS).

### 9. 08_Test_Run.md

Follow this guide to perform an end-to-end test of the xstAuth Light Server (AAS) and your Confidential Client System (CCS).

The test uses **myAge** or **iRC Auth** to authenticate as a user and verify that the complete authentication flow is working correctly.

You will use the authenticator's **Confirm it's you** feature to test the authentication process from the user's perspective.

---

## Server Example Files

The following files contain example server implementations and supporting configuration files:

* **`env-example.txt`** — Example environment configuration.
* **`HTTP-01.js`** — Example HTTP server for HTTP-01 validation.
* **`HTTPS-01.js`** — Example HTTPS server for HTTPS-01 verification.
* **`server.js`** — Example CCS Web Server implementation.

### RSA Key Pair Example Files

The following example files are provided for testing only:

* **`mtlsKey.pem`** — Example mTLS private key.
* **`mtlsCert.pem`** — Example mTLS certificate.
* **`mtlsRootCA.pem`** — Example mTLS root CA certificate.
* **`privateKeyJWT.pem`** — Example JWT private key.
* **`publicKeyJWT.pem`** — Example JWT public key.

---

## Release Contents

This release contains the following assets:

1. **`certkey-production-xstAuthLightSrv.cer`**

   Production certificate required by the xstAuth Light Server.

2. **`xstAuthLightServer.Setup.1.0.0.exe`**

   xstAuth Light Server installation package.

3. **Source code (`.zip`)**

   Source code archive in ZIP format.

4. **Source code (`.tar.gz`)**

   Source code archive in TAR.GZ format.

---

Troubleshooting — Help > How to Setup

Use the **Help > How to Setup** guide in xstAuth Light Server for configuration examples, required values, and setup-related troubleshooting.

Troubleshooting.md

Refer to Troubleshooting.md for troubleshooting steps covering installation, configuration, connectivity, testing, and operational issues.

---
