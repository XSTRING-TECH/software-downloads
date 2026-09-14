# AAS Server Preparation Guide

This document provides the **basic preparation requirements** for deploying the **xstAuth Light Server** on Microsoft Windows Server.

> **Important:**
> This guide covers the basic server preparation required for a standard deployment. Actual production requirements may vary depending on your network architecture, firewall configuration, security controls, cloud or hosting provider, operating environment, and intended use.

---

# 1. xstAuth Light Server

## 1.1 Server Requirements

Create a Windows Server instance with a minimum of **2 GB RAM** and **2 vCPUs**. For recommended performance, use **4 GB RAM** and **2 vCPUs**.

The server should also have **one public static IP address** and **one private static IP address** for network connectivity.

Supported operating systems:

* Windows Server 2016
* Windows Server 2019
* Windows Server 2022
* Windows 11 Pro
* Windows 10

For production deployments, use the latest supported Windows Server version available in your environment.

However, the Windows Server must not use IIS, NGINX, Apache HTTP Server, or any other web-server package. The **xstAuth Light Server** provides HTTPS directly and accepts HTTPS connections directly.

---

## 1.2 Assign Static IP Addresses

If the server provider dynamically assigns the instance's public IP address:

1. Assign/attach a **static public IP address** to the instance.
2. Ensure the instance has at least one **private/internal IP address** available for internal network communication.
3. Record the public and private IP addresses for later configuration.

A static public IP address is recommended because the authentication server's DNS record should remain associated with a consistent address.

If inbound traffic on TCP port 80 (HTTP) and TCP port 443 (HTTPS) is not already allowed by the **network firewall** rules, enable access to these ports. Port 80 may be disabled at a later stage once HTTP-01 certificate validation is complete.

---

## 1.3 Install Microsoft Edge

If Microsoft Edge is not already included with the Windows Server image, download and install it.

Microsoft Edge can be used to download the additional software required during server preparation.

**Microsoft Edge:**

https://explore.microsoft.com/en-us/edge/download

---

## 1.4 Download Required Software

Using Microsoft Edge, download the following software.

### Windows ACMEv2 Client — win-acme (WACS)

**win-acme (WACS)** is a Windows ACMEv2 client that can be used to obtain and manage TLS/SSL certificates from certificate authorities supporting the ACME protocol, including Let's Encrypt.

Download **win-acme** from the official website:

https://www.win-acme.com/

The ACME server used by Let's Encrypt is:

https://acme-v02.api.letsencrypt.org/

> **Note:** This URL is provided for information only. There is no need to download anything from this URL.

---

## 1.5 Install the Required Software

Install or prepare the following software:

* **Microsoft Edge** — Install if it is not already installed.
* **win-acme (WACS)** — Download and extract the files only; no installation is required.

The xstAuth Light Server does not require Node.js or Visual Studio Code as part of its basic server preparation unless they are required for a particular deployment or troubleshooting workflow.

---

## 1.6 Configure Network Firewall Access

Allow **HTTP (TCP port 80)** from the network firewall/security group associated with the server.

This is required when using HTTP-based ACME validation, such as the Let's Encrypt HTTP-01 challenge.

> **Important:**
> Port 80 is primarily required for certificate validation in this preparation procedure. The authentication service itself is expected to use HTTPS rather than unencrypted HTTP.
> If your deployment uses a different ACME validation method, such as DNS-01, the firewall requirements may differ. Refer to the applicable ACME validation method for the required Windows Firewall and network firewall rules.

---

## 1.7 Configure Windows Firewall

Allow inbound HTTP traffic on the Windows Server firewall.

For example, TCP port **80** should be permitted for the required network scope.

Run PowerShell as **Administrator**:

```powershell
New-NetFirewallRule -DisplayName "Allow HTTP 80" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
```

Ensure that inbound **TCP port 443 (HTTPS)** is also allowed. 

```powershell
New-NetFirewallRule -DisplayName "Allow HTTPS 443" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

For production deployments, restrict firewall rules to the required source addresses whenever practical.

---

## 1.8 Configure DNS for xstAuth Light Server

In your DNS Hosted Zone, create or update the DNS record for the xstAuth Light Server.

Example:

```text
auth.yourdomain.com
        |
        v
Public Static IP Address
        |
        v
xstAuth Light Server
```

### Verify DNS Resolution

Verify that DNS resolution is working correctly before proceeding with TLS certificate configuration.

See the section below for instructions.

---

## 1.9 Download the xstAuth Light Server Software

Download the official XSTRING TECH release from the XSTRING TECH software downloads repository.

The release may include:

* Production `licence certificate`
* `xstAuth Light Server` installer
* Source code (ZIP) — optional download
* Source code (tar.gz) — optional download

For example:

```text
certkey-production-xstAuthLightSrv.cer
xstAuthLightServer.Setup.1.0.0.exe
Source code (ZIP)
Source code (tar.gz)
```

Official release:

https://github.com/XSTRING-TECH/software-downloads/releases/tag/v1.0.0

> **Security recommendation:** Obtain production software only from the official XSTRING TECH software release repository. Verify the release version and any published checksums before installation where applicable.
>
> Windows may display an **“Unknown publisher”** warning during download. This is expected for this release — you may choose **Keep** instead of **Delete**.
>
> If the installer and licence certificate were downloaded from the official XSTRING TECH software release repository, and the installer checksum matches the published checksum, the installer **may be considered safe to install, and the certificate safe to use.**
> 
> If you select **Delete**, Windows will remove the installer, and you will need to download and keep it again before you can install the xstAuth Light Server.

Open the xstAuth Light Server Licence Agreement and install the software if you agree to its terms.

---

## First-Run Server Admin Password Setup

After the server has been freshly installed, you **must create a new password the first time you start the xstAuth Light Server**.

**Do not lose or forget this password.** The password cannot be recovered if it is lost or forgotten.

### Verify Your Password

After creating your password, verify that you have entered and recorded it correctly:

1. Close the server by entering `exit` or `EXIT`, then select **Confirm**.
2. Open the xstAuth Light Server again.
3. Enter the password you created during the first launch.
4. Confirm that the server accepts the password and starts normally. 
> If the password is not accepted, uninstall and reinstall the server,
> then create a new password. **Do not forget or lose this password.**

### IMPORTANT — Password Required

You will need this password every time you need to:

* Add a new licence.
* View the current settings.
* Reconfigure the server.
* Run the server.

If you forget or lose the password, **the password cannot be recovered or reset**. You will need to **uninstall the xstAuth Light Server and configure it again from the beginning**.

### Updating the Server

If you update the xstAuth Light Server to a newer release, **you can continue using the same password**. You do not need to create a new password when updating the server.

---

## 1.10 Set Up HTTP Server

Open the **xstAuth Light Server** and go to:

```text
Help > ACME HTTP-01

Enter your auth domain

Public DNS Name: auth.yourdomain.com

Click "Run HTTP Server"
```

Keep the HTTP server running while performing the following test.

### Quick Test

Open a web browser and enter:

```text
http://auth.yourdomain.com/
```

You should see:

```text
Hello from auth.yourdomain.com.
This page is being served over HTTP on port 80.
The HTTP server is working. You can proceed with requesting your TLS certificate.
```

If the page does not load, troubleshoot the following:

* Confirm that the **DNS record** for your domain is correct.
* Confirm that **inbound TCP port 80** is allowed through the cloud/network firewall.
* Confirm that **inbound TCP port 80** is allowed through the Windows Server firewall.
* Confirm that `HTTP-01.js` is running in xstAuth Light Server.
* Test the URL again.

Do not proceed with the TLS certificate request until the HTTP test is successful.

If the test page loads successfully, keep the HTTP server running and proceed to use **win-acme (WACS)** to obtain the TLS certificate required by the **xstAuth Light Server**.

---

# 2. win-acme Certificate Guide

## Overview

This guide explains how to use **win-acme (WACS)** to obtain and
automatically renew a free TLS certificate from **Let's Encrypt**.

For simplicity, run the certificate setup separately on each server:

1.  **xstAuth Light Server** --- one certificate for the xstAuth Light
    Server host.

The examples below use:

-   xstAuth Light Server: `auth.yourdomain.com`

Replace these host names with the appropriate domains for your
environment.

> **Important:** The HTTP-01 validation requires the domain to resolve
> to the server running win-acme and port **80/TCP** to be reachable
> from the Internet during certificate issuance and renewal.

------------------------------------------------------------------------

## 1. Prerequisites

Before starting, confirm that:

-   win-acme is downloaded and extracted on the Windows server.
-   The domain has a DNS `A` record pointing to the server's public IP
    address.
-   The server is reachable from the Internet.
-   TCP port **80** is allowed through the Windows Firewall and any
    cloud/network firewall.
-   The HTTP validation directory exists.
-   The account running win-acme has permission to write to the
    validation and certificate directories.

Example directories:

``` text
C:\xstAuth\public
C:\xstAuth\certs
```

If a directory does not exist, create it before starting win-acme. Run the commands below on both servers, or create the folders manually.

``` powershell
New-Item -ItemType Directory -Force -Path C:\xstAuth\public
```

``` powershell
New-Item -ItemType Directory -Force -Path C:\xstAuth\certs
```

Ensure HTTP traffic is allowed through the Windows Firewall:

For HTTP-01 validation, port 80 must also be reachable. If it has not
already been configured, create an HTTP rule:

``` powershell
New-NetFirewallRule -DisplayName "Allow HTTP 80" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
```

> **Cloud firewall:** If the server is hosted in AWS Lightsail or
> another cloud environment, also allow TCP ports **80** in
> the cloud/network firewall or firewall rules.

------------------------------------------------------------------------

## 2. Start win-acme to Request xstAuth Light Server Certificate

## 2.1 Start win-acme

Open **PowerShell as Administrator** and change to the win-acme
directory.

Example:

``` powershell
cd C:\Users\Administrator\Downloads\win-acme.v2.2.9.1701.x64.pluggable
```

``` powershell
.\wacs.exe
```

You should see a menu similar to:

``` text
N: Create certificate (default settings)
M: Create certificate (full options)
R: Run renewals (0 currently due)
A: Manage renewals (0 total)
O: More options...
Q: Quit
```

Select:

``` text
M
```

This opens the full-options certificate creation workflow.

------------------------------------------------------------------------

## 2.2 Select Manual Input

When asked how to determine the domain(s), select:

``` text
 1: Read bindings from IIS
 2: Manual input
 3: CSR created by another program
 C: Abort
```

``` text
2: Manual input
```

Enter the AAS host name.

Example:

``` text
auth.yourdomain.com
```

For a different organisation/domain, replace it accordingly, for
example:

``` text
auth.itmarket.com
```

------------------------------------------------------------------------

## 2.3 Create a Single Certificate

When asked:

``` text
Would you like to split this source into multiple certificates?
```
``` text
 1: Separate certificate for each domain (e.g. *.example.com)
 2: Separate certificate for each host (e.g. sub.example.com)
 3: Separate certificate for each IIS site
 4: Single certificate
 C: Abort
```

Select:

``` text
4: Single certificate
```

This creates one certificate containing the specified host name.

------------------------------------------------------------------------

## 2.4 Select HTTP-01 File System Validation

When asked:

``` text
How would you like prove ownership for the domain(s)?
```

``` text
 1: [http] Save verification files on (network) path
 2: [http] Serve verification files from memory
 3: [http] Upload verification files via FTP(S)
 4: [http] Upload verification files via SSH-FTP
 5: [http] Upload verification files via WebDav
 6: [dns] Create verification records manually (auto-renew not possible)
 7: [dns] Create verification records with acme-dns (https://github.com/joohoi/acme-dns)
 8: [dns] Create verification records with your own script
 9: [tls-alpn] Answer TLS verification request from win-acme
 C: Abort
```

Select:

``` text
1: [http] Save verification files on (network) path
```

win-acme will use the HTTP-01 challenge mechanism.

For the **CCS Web Server**, the provided `HTTP-01.js` can be used to serve the validation files.

Let's Encrypt will temporarily request a validation file from:

```text
http://www.yourdomain.com/.well-known/acme-challenge/<challenge-file>
```

The file must be accessible through the web server.

------------------------------------------------------------------------

## 2.5 Specify the HTTP Validation Directory

When prompted for the root path, enter:

``` text
C:\xstAuth\public
```

> **Important:** The directory must already exist. If win-acme reports
> `Directory ... does not exist` or `Invalid input: invalid path`,
> create the directory first.

win-acme will place the temporary validation file in this directory.

------------------------------------------------------------------------

## 2.6 Do Not Copy the Default web.config

When asked:

``` text
Copy default web.config before validation? (y/n*)
```

Select:

``` text
n
```

For a non-IIS Node.js web server, a default IIS `web.config` is normally
unnecessary.

------------------------------------------------------------------------

## 2.7 Select RSA

When asked which type of private key should be used:

``` text
1: Elliptic Curve key
2: RSA key
```

Select:

``` text
2: RSA key
```

RSA is a broadly compatible choice for the certificate.

------------------------------------------------------------------------

## 2.8 Store the Certificate as PEM Files

When asked how to store the certificate, select:

``` text
 1: IIS Central Certificate Store (.pfx per host)
 2: PEM encoded files (Apache, nginx, etc.)
 3: PFX archive
 4: Windows Certificate Store (Local Computer)
 5: No (additional) store steps
```
Select:

``` text
2: PEM encoded files (Apache, nginx, etc.)
```
When asked for the PEM file path, enter:

``` text
C:\xstAuth\certs
```

------------------------------------------------------------------------

## 2.9 Private Key Password

When asked:

``` text
Password to set for the private key .pem file.
```

Select:

``` text
1: None
```

This creates an unencrypted PEM private key.

> **Security warning:** An unencrypted private key must be protected
> using Windows file-system permissions. Do not expose the private key
> through the web server or place it in a public directory.

------------------------------------------------------------------------

## 2.10 Do Not Install an IIS Binding

``` text
 1: IIS Central Certificate Store (.pfx per host)
 2: PEM encoded files (Apache, nginx, etc.)
 3: PFX archive
 4: Windows Certificate Store (Local Computer)
 5: No (additional) store steps
```

When asked how to store the certificate in another way, select:

``` text
5: No (additional) store steps
```

``` text
 1: Create or update bindings in IIS
 2: Start external script or program
 3: No (additional) installation steps
```

When asked which installation step should run first, select:

``` text
3: No (additional) installation steps
```

This is appropriate when the certificate is being used directly by a
Node.js/HTTPS application rather than IIS.

You may see:

``` text
Installation plugin IIS not available:
No supported version of IIS detected.
```

This is expected if IIS is not installed and is not required for this
setup.

------------------------------------------------------------------------

## 2.11 Accept the Let's Encrypt Terms

Review the displayed Let's Encrypt terms of service.

When asked:

``` text
Do you agree with the terms? (y*/n)
```

Select:

``` text
yes
```

Enter an email address for certificate-related notifications.

Example:

``` text
your email address
```

Use an address that is monitored and appropriate for certificate renewal
and abuse notifications.

------------------------------------------------------------------------

## 2.12 Certificate Validation

win-acme should create the HTTP-01 challenge and perform validation.

A successful process will contain messages similar to:

``` text
[auth.yourdomain.com] Authorizing...
[auth.yourdomain.com] Authorizing using http-01 validation (FileSystem)
Answer should now be browsable at:
http://auth.yourdomain.com/.well-known/acme-challenge/<challenge-file>

Preliminary validation looks good...
[auth.yourdomain.com] Authorization result: valid
```

The important result is:

``` text
Authorization result: valid
```

The certificate is then downloaded and exported as PEM files.

When prompted:

Do you want to specify the user the task will run as? (y/n*)?

Select:

``` text
n
```

The certificate has now been issued and exported.

You can quit win-acme:

``` text
 N: Create certificate (default settings)
 M: Create certificate (full options)
 R: Run renewals (0 currently due)
 A: Manage renewals (1 total)
 O: More options...
 Q: Quit
```
 Please choose from the menu: Q

The certificate request is now complete.

You should find the generated **certificate and private key PEM files** in:

```text
C:\xstAuth\certs
```

The exact filenames may vary depending on the win-acme configuration.

Typical certificate-related files may include:

``` text
On xstAuth Light Server

C:/xstAuth/certs/auth.yourdomain.com-key.pem
C:/xstAuth/certs/auth.yourdomain.com-crt.pem
C:/xstAuth/certs/auth.yourdomain.com-chain-only.pem
C:/xstAuth/certs/auth.yourdomain.com-chain.pem
```

Check the actual filenames generated by win-acme before configuring the
application.

> **Important:** The private key file must be kept confidential. Do not
> copy it into a public web directory, Git repository, or downloadable
> application directory.

---

## HTTPS Connection Test on CCS Web Server

After obtaining the TLS certificates, verify that HTTPS is working correctly on both the  and the 





## HTTPS Connection Test on xstAuth Light Server

1. Open **xstAuth Light Server**.

2. Go to **Help > Verify HTTPS**.

3. Enter the **Public DNS Name**:

   ```text
   auth.yourdomain.com
   ```

4. Enter the **Private Key Path**:

   ```text
   C:/xstAuth/certs/auth.yourdomain.com-key.pem
   ```

5. Enter the **Leaf Certificate Path**:

   ```text
   C:/xstAuth/certs/auth.yourdomain.com-crt.pem
   ```

6. Click **Run HTTPS Server**.

### Quick Test

Before testing HTTPS, ensure that HTTPS traffic is allowed through the **cloud/network firewall** and **Windows Firewall** for **xstAuth Light Server**.

Open a web browser and enter:

```text
https://auth.yourdomain.com/
```

You should see:

```text
Hello from auth.yourdomain.com.
This page is being served over HTTPS on port 443.
The HTTPS server is working and the TLS certificate has been successfully loaded.
```

If the page does not load, check that Windows Firewall allows TCP port **443** and that your network or cloud firewall also allows TCP port **443**.

Restart the **xstAuth Light Server** and confirm that the correct **DNS Name**, **key path**, and **certificate path(s)** have been entered.

Then run **HTTPS Server** again.

> **Cloud/network firewall:** If the server is hosted in AWS Lightsail or another cloud environment, allow inbound **TCP port 443 (HTTPS)** in the cloud or network firewall rules.

> **Windows Firewall:** Ensure that inbound **TCP port 443 (HTTPS)** is also allowed in Windows Firewall. For example, run the following PowerShell command as Administrator:

```powershell
New-NetFirewallRule -DisplayName "Allow HTTPS 443" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

Still Having Problems? Refer to [`troubleshooting.md`](troubleshooting.md) for troubleshooting guidance. Complete the HTTPS server configuration before continuing.

## Step 2 Complete

After completing **Step 2**, you should have successfully configured and verified the **HTTPS connection for xstAuth Auth Server**.

You can now proceed to configure the internal DNS records. See [`03_Prep_CCS_Win_Server.md`](03_Prep_CCS_Win_Server.md).

---

# 3. Important Security Considerations

This preparation guide is intended as a starting point and does not replace the security requirements of the deployment environment.

Before placing a server into production, consider:

* Use static IP addresses where required.
* Use HTTPS/TLS for production communications.
* Protect all private keys and certificate files.
* Do not place private keys in source-code repositories.
* Keep Windows Server and installed software up to date.
* Enable only the firewall ports required by the deployment.
* Restrict firewall source addresses where practical.
* Use strong administrator credentials and appropriate access controls.
* Avoid exposing administrative services directly to the public internet.
* Verify DNS records before obtaining production certificates.
* Verify downloaded software and release integrity where checksums are provided.
* Configure appropriate certificate renewal procedures.
* Back up required configuration and licence information securely.
* Apply the security controls required by your organisation and hosting provider.

---

