# CCS Web Server and xstAuth Light Server

## Setup and Important Information

## What is CCS?

**Confidential Client System (CCS)** is a proprietary term used by **XSTRING TECH PTY LTD** to describe user-facing digital systems designed to protect user data, control access to information and services, and require user authentication and/or age assurance.

As you use XSTRING TECH technologies and solutions, the term **CCS** may be used throughout our documentation, technical specifications, examples, and implementation materials.

### CCS — Your System

CCS is effectively **your own user-facing system** that connects your end users to **xstAuth Light Server** for passwordless authentication.

Your CCS delegates the authentication service to the Advanced Authentication System (AAS), xstAuth Light Server, powered by XSTRING TECH. The xstAuth Light Server operates within **your own infrastructure or environment**.

---

## Programming Language Requirements

In this example, `HTTP-01.js`, `HTTPS-01.js`, and `server.js` are provided as **Node.js/JavaScript examples** for a CCS Web Server.

If your CCS Web Server is developed using another programming language, such as **Python, C#, Go, or PHP**, implement the equivalent functionality in that language.

The interface between your CCS Web Server and the **xstAuth Light Server** is **language-agnostic**, provided that the implementation supports the required **HTTPS/mTLS communication** and **HTTP request/response handling**.

---

## User App Requirements

End users of your CCS require a compatible **Authenticator App** to perform passwordless authentication.

Supported Authenticator Apps include:

* **myAge**
* **iRC Auth**

When a user signs up or signs in to your CCS website, the user is delegated to **xstAuth Light Server** for passwordless authentication.

The user then uses the **"Confirm it's you"** feature in one of the supported Authenticator Apps to approve the authentication request.

> **IMPORTANT:** End users must have a compatible Authenticator App installed on their device to complete passwordless authentication.

### Get the Authenticator App

Users can obtain the supported Authenticator Apps from the official app stores:

### myAge Authenticator

**[Download on the App Store](https://apps.apple.com/us/app/myage/id6763018516)**

**[Get it on Google Play](https://play.google.com/store/apps/details?id=com.xstring.poadc&pcampaignid=web_share)**

### xString Advanced Authenticator (iRC Auth)

**Download on the App Store — Coming Soon**

**[Get it on Google Play](https://play.google.com/store/apps/details?id=com.xstring.ircauth&pcampaignid=web_share)**

---

## Server Requirements

### Windows Server

The **xstAuth Light Server** must be installed on a new Windows Server instance configured with **two network interfaces/IP addresses**.

Create a Windows Server instance with a minimum of 2 GB RAM and 2 vCPUs. For recommended performance, use 4 GB RAM with 2 vCPUs.

The software has been tested on the following Windows operating systems:

* Windows Server 2016
* Windows Server 2019
* Windows Server 2022
* Windows Server 2025
* Windows 11 Pro
* Windows 10

Actual deployment requirements may vary depending on your network configuration, available RAM, security controls, operating environment, and intended use.

---

## No-Cost Licence Requirements

**xstAuth Light Server is a passwordless authentication solution** designed to support the transition away from password-based authentication (`pwd-auth`).

xstAuth Light Server must be configured with the provided licence certificate to activate the applicable licence.

Add the licence certificate to activate the **12-month no-cost production licence**:

```text
Licensed To: Passwordless Community
```

This licence may be used for **both testing and production deployments during the applicable licence term**, subject to the licence terms and eligibility requirements.

### Licence Renewal

The 12-month licence is **renewable at no cost**, subject to eligibility and the applicable licence terms.

The no-cost renewal programme is intended to **encourage and support the adoption and continued use of passwordless authentication**.

Eligibility requires that you have either:

* never employed a password-based authentication (`pwd-auth`) method;
* recently decommissioned a legacy password-based authentication method; or
* are actively decommissioning an existing password-based authentication method.

Renewal is subject to the eligibility requirements and licence terms applicable at the time of renewal. A no-cost licence is not an entitlement to perpetual use and does not remove any other conditions applicable to the software.

The licence is provided at no cost and **no donation is required**. However, if you would like to support the continued development and maintenance of the project, you can make an optional donation:

[**Support the project with an optional donation**](https://donate.stripe.com/9B628r2rc2x3fHy4nb43S02)

---

## Terms of Use and Privacy Statement

When installing **xstAuth Light Server**, you will be presented with the applicable licence agreement and related terms.

> **IMPORTANT:** If you do not agree to the applicable licence terms, do not install or use xstAuth Light Server.

After installation, please read the **Terms of Use** and **Privacy Statement**, available under the **Help** menu.

If you do not agree with the Terms of Use or Privacy Statement, you must **stop using xstAuth Light Server** and discontinue its operation.

Your continued use of the software constitutes your acceptance of the applicable terms to the extent permitted by applicable law.

---

## Important Security Note — Example Credentials

The **xstAuth Light Server** includes a **How to Setup** page under the **Help** menu containing sample mTLS credentials and token-signing and verification credentials. The same credentials are also provided as PEM files.

### Example mTLS Credentials — Learning and Testing Only

The mTLS certificates and private keys provided with this example are **public demonstration credentials**. They are provided solely to help learners and developers quickly configure and test mTLS in their own private or isolated environments.

> **WARNING:** These credentials are intentionally public and must never be used for production, sensitive, or security-critical environments.

Because the corresponding private keys are publicly available, these credentials provide **no meaningful security for a real deployment** and must be considered permanently compromised from a security perspective.

For any production deployment, real-world service, or security-sensitive environment, you must generate and use your **own private keys and certificates** and apply appropriate security controls. A guide for generating your own keys and certificates is provided in the **How to Setup** page under the **Help** menu.

The example credentials are provided for **educational and testing purposes only**.

> **IMPORTANT:** Never reuse the example private keys or certificates for production or for protecting sensitive information.

---

# Disclaimer

**xstAuth Light Server and the accompanying example materials are provided subject to the applicable licence and terms of use.**

To the maximum extent permitted by applicable law, **XSTRING TECH PTY LTD**, its officers, employees, contractors, affiliates, and contributors disclaim liability for any loss, damage, interruption, security incident, data loss, unauthorised access, system failure, business interruption, or other direct, indirect, incidental, special, consequential, or other loss arising from or relating to the installation, configuration, operation, modification, or use of xstAuth Light Server or the accompanying example materials.

You are responsible for determining whether the software is suitable for your environment and for implementing appropriate security, network, access-control, backup, monitoring, maintenance, and operational measures.

In particular, **public example credentials must not be relied upon for production or security-sensitive deployments**. You are responsible for generating and securely managing your own cryptographic keys, certificates, credentials, secrets, and other security materials where required.

The availability of the software at no cost does **not** mean that the software is provided without licence conditions. The no-cost licence grants permission to use the software **subject to the applicable licence terms, duration, eligibility requirements, and other conditions**. It does not transfer ownership of the software or grant unrestricted rights to use, modify, distribute, or commercially exploit the software.

Nothing in this README excludes, restricts, or modifies any rights, warranties, guarantees, remedies, or liabilities that cannot lawfully be excluded or limited under applicable law.

**Always refer to the applicable XSTRING TECH Licence Agreement, Terms of Use, Privacy Statement, and other applicable documentation for the complete terms governing your use of the software.**
