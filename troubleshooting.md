# xstAuth Light Server — Troubleshooting Guide

This guide provides solutions to common problems encountered when installing, configuring, starting, and connecting the **xstAuth Light Server**.

If you encounter a problem, first identify the symptom that most closely matches your situation and then follow the recommended resolution.

---

## 1. Before Troubleshooting

Before troubleshooting, confirm the following:

* Windows Server is running and accessible.
* The xstAuth Light Server is installed correctly.
* The required configuration values have been entered.
* The required TLS certificate and private key files exist.
* The Windows Firewall allows the required inbound connections.
* DNS records resolve to the correct server.
* The xstAuth Light Server is running.
* The Confidential Client System (CCS) is configured with the correct xstAuth Light Server address and port.
* If mTLS is being used, the required certificates and trust configuration are correct.

Where possible, troubleshoot from the **xstAuth Light Server first**, then verify connectivity from the CCS.

---

# 2. xstAuth Light Server Will Not Start

### Symptoms

The xstAuth Light Server does not start, closes immediately, or reports an error when starting.

### Possible Causes

* Incomplete configuration.
* Invalid or missing licence certificate
* Missing configuration values.
* Incorrect file paths.
* Certificate or private key files cannot be found.
* The certificate and private key do not match.
* Another application is already using the required port.
* Insufficient permissions.

### Resolution

1. Open the xstAuth Light Server.
2. Check all configuration values.
3. Confirm that every configured file path points to an existing file.
4. Confirm that the certificate and private key are valid.
5. Confirm that the required port is not already in use.
6. Run the application again.

If the application provides an error message, record the exact message before making further changes.

---

# 3. Port 443 Is Already in Use

### Symptoms

The xstAuth Light Server cannot start because port `443` is already being used.

### Cause

Another application or service is already listening on TCP port 443.

### Resolution

Open PowerShell as Administrator and run:

```powershell
Get-NetTCPConnection -LocalPort 443 -State Listen
```

This shows which process is listening on port 443.

You can then identify the process using:

```powershell
Get-Process -Id <PID>
```

Replace `<PID>` with the process ID shown by the previous command.

Alternatively:

```powershell
netstat -ano | findstr :443
```

Do not stop another service unless you are certain that it is safe to do so.

If another HTTPS server is intentionally using port 443, configure the xstAuth Light Server to use an appropriate alternative port if supported by your deployment.

---

# 4. Cannot Connect to the xstAuth Light Server

### Symptoms

The CCS cannot connect to the xstAuth Light Server.

### Possible Causes

* Incorrect server address.
* Incorrect port.
* DNS does not resolve correctly.
* Windows Firewall is blocking the connection.
* AWS/Lightsail firewall rules are blocking the connection.
* The xstAuth Light Server is not running.
* The server is listening only on localhost.
* Network routing is incorrect.

### Resolution

Verify the following:

1. Confirm that the xstAuth Light Server is running.
2. Confirm the configured hostname.
3. Confirm the configured port.
4. Confirm DNS resolution.
5. Confirm Windows Firewall rules.
6. Confirm any cloud-provider firewall rules.
7. Confirm that the server is listening on the expected network interface.

For example, if the server is expected to listen on port 443:

```powershell
Get-NetTCPConnection -LocalPort 443 -State Listen
```

The server should be listening on the expected port.

---

# 5. DNS Name Does Not Resolve

### Symptoms

The CCS cannot resolve the xstAuth Light Server hostname.

For example:

```text
aas.private.io
```

does not resolve to the expected server.

### Resolution

From the CCS, run:

```powershell
nslookup aas.private.io
```

Verify that the returned IP address is the expected address.

If the hostname does not resolve:

* Check the DNS record.
* Check the DNS server being used by the CCS.
* Confirm that the record was created in the correct DNS zone.
* Confirm that the hostname is spelled correctly.
* Allow time for DNS changes to propagate where applicable.

For internal/private DNS, ensure that the CCS can access the DNS server containing the internal record.

---

# 6. Windows Firewall Is Blocking Port 443

### Symptoms

The xstAuth Light Server is running and listening on port 443, but remote systems cannot connect.

### Resolution

Check existing firewall rules:

```powershell
Get-NetFirewallRule -Enabled True | Where-Object {$_.Direction -eq "Inbound"}
```

If required, create an inbound rule for TCP port 443:

```powershell
New-NetFirewallRule -DisplayName "Allow HTTPS 443" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

If the server is hosted in AWS Lightsail or another cloud environment, also verify the provider's network firewall/security rules.

**Important:** Opening a Windows Firewall port does not automatically open the corresponding port in the cloud provider's firewall.

---

# 7. Certificate Error

### Symptoms

The xstAuth Light Server reports a certificate-related error, or clients receive a TLS/certificate warning.

### Possible Causes

* Certificate has expired.
* Certificate is not valid for the hostname.
* Incorrect certificate file.
* Missing intermediate certificate.
* Incorrect certificate chain.
* Certificate/private key mismatch.
* Certificate is not trusted by the connecting system.

### Resolution

Check the certificate details and confirm:

* The certificate is currently valid.
* The hostname matches the certificate.
* The correct certificate is being used.
* The required intermediate certificate/chain is configured.
* The certificate is trusted by the connecting system.

For a hostname such as:

```text
aas.example.com
```

the certificate should contain the appropriate hostname in its Subject Alternative Name (SAN).

---

# 8. Certificate and Private Key Do Not Match

### Symptoms

The server reports an error when loading the certificate and private key.

### Cause

The private key does not correspond to the certificate.

### Resolution

If OpenSSL is available, compare the public key information from both files.

For example:

```powershell
openssl x509 -in certificate.cer -pubkey -noout > cert-public-key.txt
openssl pkey -in private.key -pubout > key-public-key.txt
```

Compare the resulting files.

The public keys must match.

If they do not match, obtain the correct private key for the certificate or issue a new certificate.

**Never share or upload a private key when requesting technical support.**

---

# 9. Private Key Cannot Be Loaded

### Symptoms

The xstAuth Light Server reports that the private key cannot be loaded.

### Possible Causes

* Incorrect private key path.
* File does not exist.
* Incorrect file format.
* Private key is encrypted with a password that has not been supplied.
* The application does not have permission to access the file.
* The private key is corrupted.

### Resolution

Verify:

1. The configured path is correct.
2. The file exists.
3. The file is a valid private key.
4. The application has permission to read the file.
5. Any required private-key password is correct.

Avoid storing private keys in publicly accessible directories.

---

# 10. Certificate File Path Is Incorrect

### Symptoms

The application reports that a certificate file cannot be found.

### Resolution

Check the configured path carefully.

For example:

```text
C:\xstAuthLightServer\certificates\certificate.cer
```

Confirm that:

* The directory exists.
* The file exists.
* The filename is correct.
* The file extension is correct.
* The application account has permission to read the file.

A simple PowerShell check is:

```powershell
Test-Path "C:\xstAuthLightServer\certificates\certificate.cer"
```

A result of:

```text
True
```

means the file exists at that path.

---

# 11. HTTPS Connection Fails Immediately

### Symptoms

The connection fails immediately during TLS negotiation.

### Possible Causes

* Invalid certificate.
* Incorrect certificate chain.
* Certificate hostname mismatch.
* TLS configuration problem.
* mTLS configuration problem.
* Client does not trust the server certificate.
* Server requires a client certificate that the client does not provide.

### Resolution

Determine whether the deployment uses:

* Standard HTTPS/TLS only; or
* HTTPS/TLS with mutual TLS (mTLS).

If mTLS is enabled, verify both sides of the connection:

**xstAuth Light Server**

* Server certificate is valid.
* Server private key matches the certificate.
* Client certificate validation is configured correctly.
* Required CA/trust certificate is available.

**CCS**

* xstAuth Light Server certificate is trusted.
* Required client certificate is available.
* Client private key matches the client certificate.
* The correct CA/trust configuration is being used.

Before considering the setup complete, verify:

-   [ ] The domain has the correct DNS record.
-   [ ] TCP port 80 is accessible from the Internet.
-   [ ] TCP port 443 is allowed for HTTPS.
-   [ ] `C:\xstAuth\public` exists.
-   [ ] `C:\xstAuth\certs` exists.
-   [ ] HTTP-01 validation succeeds.
-   [ ] The certificate is issued successfully.
-   [ ] PEM files are present in the certificate directory.
-   [ ] The private key is not publicly accessible.
-   [ ] The Node.js HTTPS server uses the correct certificate paths.
-   [ ] The win-acme renewal task exists.
-   [ ] Renewal processing has been tested.
-   [ ] The Node.js application is restarted after certificate renewal
    if it does not dynamically reload certificates.

---

# 12. mTLS Connection Fails

### Symptoms

The CCS cannot establish an mTLS connection with the xstAuth Light Server.

### Possible Causes

* Client certificate is missing.
* Client certificate is invalid or expired.
* Client certificate is not trusted by the xstAuth Light Server.
* Client private key does not match the client certificate.
* Incorrect CA certificate is configured.
* Certificate chain is incomplete.
* The client is not presenting a certificate.

### Resolution

Verify the complete certificate chain and trust relationship.

The basic relationship should be:

```text
CCS
 │
 │ Client Certificate
 │
 ▼
xstAuth Light Server
 │
 │ Validates client certificate
 │
 ▼
Trusted CA
```

Confirm that the CA used to issue the client certificate is trusted by the xstAuth Light Server.

Also confirm that the CCS is actually presenting the client certificate during the TLS connection.

---

# 13. HTTP-01 Certificate Validation Fails

### Symptoms

Let's Encrypt or another ACME certificate authority cannot complete HTTP-01 validation.

### Possible Causes

* Port 80 is blocked.
* DNS points to the wrong server.
* HTTP-01 server is not running.
* The validation file/path cannot be accessed.
* Another web server is responding on port 80.
* A firewall or cloud security rule is blocking the request.
* The hostname resolves to a different server.

### Resolution

Confirm that:

1. The domain resolves to the correct public IP address.
2. TCP port 80 is accessible from the Internet.
3. The HTTP-01 validation server is running.
4. The required validation URL is reachable.
5. No other application is intercepting requests on port 80.

Test the hostname from an external network where possible.

---

# 14. HTTP-01 Server Will Not Start

### Symptoms

The HTTP-01 example server cannot start.

### Possible Causes

* Node.js is not installed.
* The required port is already in use.
* Incorrect configuration.
* The validation directory does not exist.
* Insufficient permissions.

### Resolution

Check that Node.js is installed:

```powershell
node --version
```

If Node.js is installed, verify the port:

```powershell
Get-NetTCPConnection -LocalPort 80 -State Listen
```

If another application is using port 80, identify it before stopping or reconfiguring the service.

---

# 15. Node.js Is Not Recognised

### Symptoms

PowerShell reports:

```text
node : The term 'node' is not recognized...
```

### Cause

Node.js is not installed or is not available in the system PATH.

### Resolution

Install the required Node.js version and then restart PowerShell.

Verify:

```powershell
node --version
npm --version
```

Both commands should return version numbers.

---

# 16. The Server Is Listening on 127.0.0.1 Instead of 0.0.0.0

### Symptoms

The server works locally but cannot be accessed from another machine.

### Cause

The server is bound only to the local loopback interface.

### Resolution

The server should listen on an appropriate network interface.

For a server that must accept connections on all network interfaces, the application may use:

```text
0.0.0.0
```

For example:

```javascript
server.listen(443, '0.0.0.0');
```

The exact configuration depends on the application.

**Note:** Binding to `0.0.0.0` does not itself make a service accessible from the Internet. Firewall and network rules must also allow the connection.

---

# 17. CCS Cannot Establish an mTLS Connection Because of Certificate Trust

### Symptoms

The connection fails with an error indicating that the certificate is not trusted or cannot be verified.

### Resolution

Check the CA trust configuration on both systems.

Confirm:

* The server certificate chains to a trusted CA.
* The client certificate chains to a CA trusted by the server.
* The correct CA certificate is installed/configured.
* The certificate chain is complete.
* The certificate has not expired.
* The certificate hostname is correct.

Do not disable certificate verification as a workaround in a production environment.

---

# 18. "Connection Refused"

### Symptoms

The CCS reports:

```text
ECONNREFUSED
```

or a similar connection-refused error.

### Possible Causes

* xstAuth Light Server is not running.
* Wrong IP address or hostname.
* Wrong port.
* Windows Firewall is blocking the port.
* Cloud firewall/security rules are blocking the port.
* The server is listening on another interface or port.

### Resolution

On the xstAuth Light Server, verify:

```powershell
Get-NetTCPConnection -State Listen
```

Confirm that the expected port is listed.

Then check the firewall and network configuration.

---

# 19. "Connection Timed Out"

### Symptoms

The CCS waits for a response and eventually reports a timeout.

### Possible Causes

A timeout generally indicates that network traffic is being blocked or cannot reach the destination.

### Resolution

Check:

* DNS resolution.
* Server IP address.
* Windows Firewall.
* Cloud firewall/security rules.
* Network routing.
* VPN/private network connectivity.
* Whether the server is running and listening on the expected port.

A timeout is different from `ECONNREFUSED`:

```text
Connection refused → destination was reached, but the connection was rejected.

Connection timed out → the connection could not be completed within the allowed time.
```

---

# 20. Incorrect Private Key Causes an Error or Application Failure

### Symptoms

The application displays an error after an incorrect private key is entered.

### Resolution

Confirm that the private key:

* Belongs to the configured certificate.
* Is in a supported format.
* Is not corrupted.
* Is accessible by the application.
* Has the correct password if encrypted.

Do not repeatedly attempt to use an unknown or unrelated private key.

If the correct private key is unavailable, a new certificate/key pair may need to be issued.

---

# 21. Browser Displays a Certificate Warning

### Symptoms

A browser reports that the connection is not private, the certificate is not trusted, or the certificate is invalid.

### Possible Causes

* Self-signed certificate.
* Private/internal CA is not trusted by the computer.
* Certificate hostname does not match the URL.
* Certificate has expired.
* Incorrect certificate chain.

### Resolution

For production deployments, use a certificate issued by an appropriate trusted certificate authority.

For internal/testing deployments using a private CA, ensure that the required root CA certificate is trusted by the systems that need to connect to the server.

Do not bypass certificate warnings in production.

---

# 22. Configuration Changes Do Not Take Effect

### Symptoms

A configuration value has been changed, but the xstAuth Light Server continues to behave as though the old value is being used.

### Resolution

1. Save the configuration.
2. Close the xstAuth Light Server if required.
3. Restart the xstAuth Light Server.
4. Confirm the configuration value again.
5. Test the connection.

Some configuration changes may only take effect after the application or service has been restarted.

---

# 23. File or Directory Access Denied

### Symptoms

The application reports:

```text
Access denied
```

or cannot read a certificate/configuration file.

### Possible Causes

* Windows permissions.
* File ownership.
* File is being used by another process.
* Application is running under a different user account.

### Resolution

Confirm that the account running the xstAuth Light Server has read access to the required files and directories.

Avoid giving unnecessary write or full-control permissions.

For sensitive files such as private keys, grant only the permissions required by the application.

---

# 24. Server Works Locally but Not Remotely

### Symptoms

The xstAuth Light Server works when tested directly on the server but not from the CCS.

### Likely Causes

This usually indicates a network, firewall, DNS, or certificate trust problem rather than an application problem.

### Resolution

Check in this order:

1. Confirm the server is running.
2. Confirm the server is listening on the expected port.
3. Confirm the hostname resolves correctly from the CCS.
4. Confirm Windows Firewall.
5. Confirm cloud firewall/security rules.
6. Confirm network routing.
7. Confirm TLS certificate trust.
8. If using mTLS, confirm client certificate configuration.

---

# 25. Server Works by IP Address but Not by Hostname

### Symptoms

The CCS can connect using an IP address but cannot connect using the hostname.

### Cause

The problem is likely DNS-related.

### Resolution

Run:

```powershell
nslookup <hostname>
```

Confirm that the hostname resolves to the expected IP address.

Also verify that the TLS certificate contains the hostname being used.

**Important:** A certificate valid for:

```text
aas.example.com
```

is not necessarily valid when the client connects using:

```text
192.0.2.10
```

---

# 26. Certificate Has Expired

### Symptoms

The server or client reports that the certificate is expired.

### Resolution

Obtain or renew a valid certificate and replace the expired certificate according to the xstAuth Light Server configuration.

After replacing the certificate:

1. Confirm the new certificate dates.
2. Confirm the hostname.
3. Confirm the private key matches the certificate.
4. Confirm the certificate chain.
5. Restart the xstAuth Light Server.
6. Test the connection again.

---

# 27. Let's Encrypt Certificate Renewal Fails

### Symptoms

Certificate renewal fails even though the previous certificate was successfully issued.

### Possible Causes

* Port 80 is no longer accessible.
* DNS changed.
* The public IP address changed.
* HTTP-01 validation server is not running.
* Firewall rules changed.
* The domain no longer points to the correct server.

### Resolution

Repeat the HTTP-01 connectivity checks:

```text
DNS → Public IP → Port 80 → HTTP-01 validation server
```

Verify each stage independently.

---

# 28. AWS Lightsail Connectivity Problems

### Symptoms

The server works locally but cannot be reached externally when hosted on AWS Lightsail.

### Resolution

Check both:

**Windows Server Firewall**

and

**Lightsail Networking / Firewall**

The required port must be permitted at both levels.

For example, for HTTPS:

```text
Internet
   │
   ▼
Lightsail Firewall
   │
   ▼
Windows Firewall
   │
   ▼
xstAuth Light Server
   │
   ▼
TCP 443
```

If either firewall blocks the connection, the service may be unreachable.

---

# 29. Private Network, DNS and Port 8443 Connectivity

The xstAuth Light Server and the **Confidential Client System (CCS) Web Server** may communicate over a private network using HTTPS/mTLS on TCP port `8443`.

For example:

```text
xstAuth Light Server
Private IP: 10.0.1.20
        │
        │ HTTPS / mTLS
        │ TCP 8443
        ▼
CCS Web Server
Private IP: 10.0.1.30
```

The CCS Web Server must be able to resolve the xstAuth Light Server hostname to the **correct private IP address**, and TCP port `8443` must be permitted between the two servers.

A problem with any of the following can prevent the connection:

* Internal DNS.
* Windows `hosts` file.
* Incorrect private IP address.
* Incorrect hostname.
* TCP port `8443`.
* Windows Firewall.
* Cloud/network firewall.
* Network routing.
* TLS certificate hostname.
* mTLS certificate or trust configuration.

---

## 29.1 Confirm the xstAuth Light Server Private IP Address

On the xstAuth Light Server, run:

```powershell
ipconfig
```

or:

```powershell
ipconfig /all
```

Identify the server's **private IPv4 address**.

For example:

```text
IPv4 Address. . . . . . . . . . . : 10.0.1.20
```

Make sure this is the address that the CCS Web Server should use to communicate with the xstAuth Light Server.

Do not assume that the public IP address is the correct address for private server-to-server communication.

---

## 29.2 Confirm the CCS Web Server Private IP Address

On the CCS Web Server, run:

```powershell
ipconfig
```

Identify the CCS Web Server's private IPv4 address.

For example:

```text
IPv4 Address. . . . . . . . . . . : 10.0.1.30
```

This address should be used as the `<CCS Web Server private IP address>` in the Windows Firewall rule where appropriate.

---

## 29.3 Check Internal DNS Resolution

From the CCS Web Server, resolve the xstAuth Light Server hostname:

```powershell
nslookup <xstAuth Light Server hostname>
```

For example:

```powershell
nslookup aas.private.io
```

The result should contain the **private IP address of the xstAuth Light Server**.

For example:

```text
Name:    aas.private.io
Address: 10.0.1.20
```

If DNS returns a different address, the CCS Web Server may attempt to connect to the wrong server.

### Common DNS problems

* DNS record does not exist.
* DNS record points to the wrong IP address.
* The CCS Web Server is using the wrong DNS server.
* An old DNS record is being returned.
* The hostname is misspelled.
* The xstAuth Light Server private IP address has changed.
* Internal DNS is not accessible from the CCS network.

---

## 29.4 Check the Windows Hosts File

If internal DNS is not being used, or if a temporary local DNS override is required, Windows can resolve the hostname using the `hosts` file.

The file is located at:

```text
C:\Windows\System32\drivers\etc\hosts
```

For example:

```text
10.0.1.20    aas.private.io
```

After making a change, verify the result from PowerShell:

```powershell
nslookup aas.private.io
```

You can also test Windows name resolution with:

```powershell
ping aas.private.io
```

**Note:** `ping` is primarily a name-resolution test in this situation. A failed ping does not necessarily mean that TCP port `8443` is unavailable because ICMP may be blocked by the firewall.

---

## 29.5 Flush the DNS Cache

If the correct DNS record has been created but the server continues to resolve the old address, flush the Windows DNS cache:

```powershell
ipconfig /flushdns
```

Then test again:

```powershell
nslookup aas.private.io
```

---

## 29.6 Confirm the Hostname Resolves to the Correct IP Address

Before troubleshooting certificates or mTLS, first confirm:

```text
CCS Web Server
       │
       │ Resolve hostname
       ▼
aas.private.io
       │
       ▼
10.0.1.20
       │
       ▼
xstAuth Light Server
```

If the hostname resolves to the wrong IP address, fix DNS or the `hosts` file before continuing.

---

# 29.7 Confirm the xstAuth Light Server Is Listening on Port 8443

On the xstAuth Light Server, run:

```powershell
Get-NetTCPConnection -LocalPort 8443 -State Listen
```

A listening connection should be displayed.

You can also use:

```powershell
netstat -ano | findstr :8443
```

If nothing is returned, the xstAuth Light Server is not listening on port `8443`.

Check the xstAuth Light Server configuration and confirm that the HTTPS/mTLS server is running on the expected port.

---

# 29.8 Confirm the Server Is Listening on the Correct Network Interface

The xstAuth Light Server must listen on an interface that is reachable by the CCS Web Server.

If the application is listening only on:

```text
127.0.0.1
```

the service may work locally but not from the CCS Web Server.

For a server that needs to accept connections through its network interfaces, the application may listen on:

```text
0.0.0.0
```

For example:

```text
0.0.0.0:8443
```

This allows the application to listen on the available IPv4 network interfaces.

---

# 29.9 Test Port 8443 from the CCS Web Server

You can test TCP connectivity to the xstAuth Light Server. The server must be running before performing this test.

From the CCS Web Server, run:

```powershell
Test-NetConnection <xstAuth Light Server hostname> -Port 8443
```

For example:

```powershell
Test-NetConnection aas.private.io -Port 8443
```

Look for:

```text
TcpTestSucceeded : True
```

If:

```text
TcpTestSucceeded : False
```

the problem is likely related to one or more of:

* Incorrect IP address.
* DNS resolution.
* Routing.
* xstAuth Light Server not running.
* xstAuth Light Server not listening on port 8443.
* Windows Firewall.
* Cloud/network firewall.
* Network security rules.

Do not troubleshoot mTLS certificates until basic TCP connectivity has been confirmed.

---

# 29.10 Configure Windows Firewall on the CCS Web Server

If the CCS Web Server is initiating the outbound connection to the xstAuth Light Server, the normal Windows Firewall requirement is to permit the appropriate outbound traffic.

In some deployments, a more restrictive inbound rule may also be required depending on the network architecture.

For example, the following rule allows inbound TCP `8443` traffic addressed to the CCS Web Server's private IP from the xstAuth Light Server's private IP:

```powershell
New-NetFirewallRule `
    -DisplayName "Allow Private mTLS/HTTPS Inbound from xstAuth Server" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 8443 `
    -LocalAddress "<CCS Web Server private IP address>" `
    -RemoteAddress "<xstAuth Light Server private IP address>" `
    -Profile Any `
    -Action Allow
```

Replace:

```text
<CCS Web Server private IP address>
```

with the actual private IP address of the CCS Web Server.

Replace:

```text
<xstAuth Light Server private IP address>
```

with the actual private IP address of the xstAuth Light Server.

For example:

```powershell
New-NetFirewallRule `
    -DisplayName "Allow Private mTLS/HTTPS Inbound from xstAuth Server" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 8443 `
    -LocalAddress "10.0.1.30" `
    -RemoteAddress "10.0.1.20" `
    -Profile Any `
    -Action Allow
```

### Important

The IP addresses in this rule must be the **actual private IP addresses used for the server-to-server connection**.

Do not replace them with public IP addresses unless your network architecture specifically requires public-IP communication.

---

# 29.11 Verify the Windows Firewall Rule

After creating the rule, check it with:

```powershell
Get-NetFirewallRule -DisplayName "Allow Private mTLS/HTTPS Inbound from xstAuth Server"
```

To display the associated address and port configuration:

```powershell
Get-NetFirewallRule -DisplayName "Allow Private mTLS/HTTPS Inbound from xstAuth Server" |
    Get-NetFirewallPortFilter
```

and:

```powershell
Get-NetFirewallRule -DisplayName "Allow Private mTLS/HTTPS Inbound from xstAuth Server" |
    Get-NetFirewallAddressFilter
```

Confirm that the rule contains:

```text
Protocol: TCP
Local Port: 8443
Remote Address: xstAuth Light Server private IP
```

---

# 29.12 Check for Conflicting Firewall Rules

A newly created Allow rule does not always mean that the connection will work as expected. Other firewall policies or network security controls may also affect the connection.

Check the active firewall profile:

```powershell
Get-NetFirewallProfile
```

Also review existing firewall rules if the connection continues to fail.

If your organisation uses centrally managed Windows Firewall policies, local changes may also be overridden by Group Policy.

---

# 29.13 Check Cloud or Network Firewall Rules

If either server is hosted in a cloud environment, there may be another firewall between the two servers.

For example:

```text
CCS Web Server
     │
     ▼
Cloud / Network Firewall
     │
     ▼
Windows Firewall
     │
     ▼
xstAuth Light Server
```

Check the applicable cloud security rules and network ACLs.

The required private traffic must be permitted between:

```text
CCS Web Server private IP
            │
            │ TCP 8443
            ▼
xstAuth Light Server private IP
```

---

# 29.14 Verify That the Correct IP Address Is Being Used

A particularly common problem is that the hostname resolves successfully, but it resolves to the **wrong IP address**.

For example:

```text
Expected:
aas.private.io → 10.0.1.20

Actual:
aas.private.io → 10.0.2.20
```

In this situation, DNS is technically working, but the configuration is incorrect.

Always compare the DNS result with the actual private IP address of the xstAuth Light Server.

---

# 29.15 Verify the TLS Certificate Hostname

Once TCP port `8443` is confirmed to be reachable, verify the TLS certificate.

If the CCS connects using:

```text
https://aas.private.io:8443
```

the server certificate should be valid for:

```text
aas.private.io
```

The certificate hostname and the hostname used by the CCS should correspond.

Do not resolve the hostname to one server while presenting a certificate issued for a different hostname.

---

# 29.16 Do Not Use the IP Address as a Certificate Workaround

If the certificate is issued for:

```text
aas.private.io
```

do not change the CCS configuration to:

```text
https://10.0.1.20:8443
```

simply to bypass a DNS problem.

This can create a TLS certificate hostname mismatch.

Instead:

1. Fix DNS or the `hosts` file.
2. Ensure the hostname resolves to the correct private IP.
3. Use the hostname covered by the certificate.

---

# 29.17 Diagnostic Sequence for Port 8443

When the CCS Web Server cannot connect to the xstAuth Light Server, troubleshoot in this order:

### Step 1 — Check the xstAuth Light Server IP

```powershell
ipconfig
```

Confirm the private IP address.

### Step 2 — Check DNS

From the CCS Web Server:

```powershell
nslookup aas.private.io
```

Confirm that it returns the correct private IP.

### Step 3 — Check the xstAuth Light Server Listener

On the xstAuth Light Server:

```powershell
Get-NetTCPConnection -LocalPort 8443 -State Listen
```

### Step 4 — Test TCP 8443

From the CCS Web Server:

```powershell
Test-NetConnection aas.private.io -Port 8443
```

Confirm:

```text
TcpTestSucceeded : True
```

### Step 5 — Check Windows Firewall

Confirm that the required TCP `8443` traffic is permitted.

### Step 6 — Check Cloud/Network Firewall

Confirm that private traffic between the two servers is permitted.

### Step 7 — Check TLS

Confirm:

* Certificate is valid.
* Certificate hostname is correct.
* Certificate chain is trusted.
* Certificate has not expired.

### Step 8 — Check mTLS

Confirm:

* CCS presents the expected client certificate.
* xstAuth Light Server trusts the issuing CA.
* Client private key matches the client certificate.
* Required certificate chain is available.

---

# 29.18 Automatic Certificate Renewal

At the end of a successful certificate creation, win-acme creates a
Windows Task Scheduler entry.

Example:

``` text
Name:
win-acme renew (acme-v02.api.letsencrypt.org)

Path:
C:\Users\Administrator\Downloads\win-acme.v2.2.9.1701.x64.pluggable

Command:
wacs.exe --renew --baseuri "https://acme-v02.api.letsencrypt.org/"

Start at:
09:00:00

Random delay:
04:00:00

Time limit:
02:00:00
```

When prompted:

``` text
Do you want to specify the user the task will run as? (y/n*)
```

Select:

``` text
n
```

The task will then run under its configured/default Windows task
account.

------------------------------------------------------------------------

# 8. Verify the Certificate Renewal Configuration

Start win-acme again:

``` powershell
.\wacs.exe
```

Select:

``` text
A: Manage renewals
```

The renewal should appear in the list.

You can also select:

``` text
R: Run renewals
```

to run renewal processing manually.

The renewal command is equivalent to:

``` powershell
.\wacs.exe --renew --baseuri "https://acme-v02.api.letsencrypt.org/"
```

> **Note:** win-acme does not necessarily renew the certificate every
> time the renewal command runs. It checks whether the certificate is
> due for renewal and renews it when appropriate.

------------------------------------------------------------------------

# 9. Important: Restart the Application After Renewal

The certificate files may be updated automatically when win-acme renews
the certificate.

However, a running Node.js HTTPS server may continue using the
certificate that was loaded when the process started.

Therefore, if the application does not dynamically reload certificates,
the Node.js server must be restarted after a successful certificate
renewal.

For example:

``` text
win-acme
   |
   +-- renews certificate
   |
   +-- updates PEM files
   |
   +-- Node.js application continues using old certificate
   |
   +-- restart Node.js application
   |
   +-- application loads the renewed certificate
```

If automatic restart is required, an appropriate post-renewal script can
be configured in win-acme.

------------------------------------------------------------------------

# 10. HTTP-01 Validation Troubleshooting

If validation fails, first verify that the challenge URL is reachable
from an external network.

Example:

``` text
http://www.yourdomain.com/.well-known/acme-challenge/test
```

or:

``` text
http://auth.yourdomain.com/.well-known/acme-challenge/test
```

The request must reach the server that contains:

``` text
C:\xstAuth\public
```

Check the following:

### DNS

Confirm that the domain resolves to the correct public IP address.

### Windows Firewall

Confirm that TCP port 80 is allowed:

``` powershell
Get-NetFirewallRule -DisplayName "Allow HTTP 80"
```

### Cloud Firewall

If using AWS Lightsail, AWS EC2, or another cloud provider, confirm that
TCP port 80 is allowed by the cloud firewall/security rules.

### Web Server

The web server must serve:

``` text
/.well-known/acme-challenge/
```

from the configured directory.

### Port 80

HTTP-01 validation uses **HTTP port 80**. Opening only port 443 is not
sufficient for HTTP-01 validation.

------------------------------------------------------------------------

# 11. Common win-acme Errors

## Directory does not exist

Example:

``` text
Directory C:\xstAuth\public does not exist
Invalid input: invalid path
```

Create the directory:

``` powershell
New-Item -ItemType Directory -Force -Path C:\xstAuth\public
```

Then enter the path again.

------------------------------------------------------------------------

## IIS plugin not available

Example:

``` text
Installation plugin IIS not available:
No supported version of IIS detected.
```

This is not an error for a Node.js-based server.

Select:

``` text
3: No (additional) installation steps
```

------------------------------------------------------------------------

## Authorization result: invalid

If you receive:

``` text
Authorization result: invalid
```

check:

1.  DNS points to the correct server.
2.  TCP port 80 is reachable from the Internet.
3.  The HTTP server is running.
4.  The HTTP validation directory is correct.
5.  `/.well-known/acme-challenge/` is not blocked or redirected
    incorrectly.
6.  A cloud firewall is not blocking port 80.

------------------------------------------------------------------------

# 12. Recommended Directory Structure

A simple arrangement is:

``` text
C:\
└── xstAuth\
    ├── public\
    │   └── .well-known\
    │       └── acme-challenge\
    │
    └── certs\
        ├── <certificate files generated by win-acme>
        └── <private key generated by win-acme>
```

Keep the `certs` directory separate from `public`.

The `public` directory is intended to contain files that the web server
may serve to the Internet. The `certs` directory contains sensitive
certificate material, including the private key, and must not be
publicly accessible.

------------------------------------------------------------------------

# 13. Quick Reference

## CCS Web Server

``` text
Domain:
www.yourdomain.com

Certificate:
Single certificate

Validation:
HTTP-01 / FileSystem

Validation root:
C:\xstAuth\public

Key type:
RSA

Certificate storage:
PEM

Certificate directory:
C:\xstAuth\certs

Private-key password:
None

Installation step:
No additional installation steps
```

## xstAuth Light Server

``` text
Domain:
auth.yourdomain.com

Certificate:
Single certificate

Validation:
HTTP-01 / FileSystem

Validation root:
C:\xstAuth\public

Key type:
RSA

Certificate storage:
PEM

Certificate directory:
C:\xstAuth\certs

Private-key password:
None

Installation step:
No additional installation steps
```

---

# 29.19 Quick Port 8443 Checklist

```text
[ ] xstAuth Light Server is running
[ ] xstAuth Light Server has the expected private IP
[ ] CCS Web Server has the expected private IP
[ ] Internal DNS record exists
[ ] DNS resolves the hostname to the correct private IP
[ ] Hosts file is correct, if used
[ ] DNS cache has been flushed after changes, if required
[ ] xstAuth Light Server is listening on TCP 8443
[ ] xstAuth Light Server is listening on a reachable interface
[ ] CCS can resolve the xstAuth Light Server hostname
[ ] Test-NetConnection to TCP 8443 succeeds
[ ] Windows Firewall permits the required traffic
[ ] Cloud/network firewall permits the required traffic
[ ] TLS certificate matches the hostname
[ ] TLS certificate is valid and trusted
[ ] mTLS client certificate is configured correctly
[ ] mTLS trust/CA configuration is correct
```

### Important Troubleshooting Principle

Troubleshoot connectivity from the bottom up:

```text
1. Private IP address
        ↓
2. DNS / hosts file
        ↓
3. Network routing
        ↓
4. TCP port 8443
        ↓
5. Windows Firewall
        ↓
6. Cloud/network firewall
        ↓
7. TLS certificate
        ↓
8. mTLS authentication
        ↓
9. Application-level communication
```

Do not begin troubleshooting mTLS certificates if the CCS Web Server cannot establish a basic TCP connection to port `8443`.

---

# 30. How to Test a Port from Another Windows Server

From the CCS, use:

```powershell
Test-NetConnection <hostname> -Port 443
```

For example:

```powershell
Test-NetConnection aas.example.com -Port 443
```

Look for:

```text
TcpTestSucceeded : True
```

If it returns:

```text
TcpTestSucceeded : False
```

investigate DNS, firewall, routing, and server listening status.

---

# 31. How to Check the Windows Server IP Configuration

Run:

```powershell
ipconfig
```

For more detailed information:

```powershell
ipconfig /all
```

Check:

* IPv4 address.
* Default gateway.
* DNS servers.
* Network adapter status.

---

# 32. Application Error After Updating the Server

### Symptoms

The xstAuth Light Server worked previously but stops working after an update or configuration change.

### Resolution

Check the most recent changes first.

Verify:

* Application version.
* Configuration values.
* Certificate files.
* Private key files.
* File paths.
* Firewall rules.
* DNS records.
* Network configuration.

If the issue started immediately after replacing a certificate, first verify the certificate/private-key pair and certificate chain.

---

# 33. General Diagnostic Procedure

If the specific problem is not listed above, use the following order.

### Step 1 — Check the Application

Confirm that the xstAuth Light Server is running.

### Step 2 — Check the Listening Port

```powershell
Get-NetTCPConnection -LocalPort 443 -State Listen
```

### Step 3 — Check DNS

```powershell
nslookup <hostname>
```

### Step 4 — Check Network Connectivity

From the CCS:

```powershell
Test-NetConnection <hostname> -Port 443
```

### Step 5 — Check Windows Firewall

Confirm that the required inbound port is permitted.

### Step 6 — Check Cloud Firewall

If hosted in AWS Lightsail or another cloud environment, confirm that the required port is permitted by the cloud firewall/security configuration.

### Step 7 — Check TLS

Verify:

* Certificate validity.
* Hostname.
* Certificate chain.
* Private key.
* Certificate/private-key match.

### Step 8 — Check mTLS

If mTLS is enabled, verify:

* Client certificate.
* Client private key.
* Trusted CA.
* Certificate chain.
* Client certificate presentation.

### Step 9 — Restart and Retest

After correcting the configuration, restart the affected server/application and perform the connection test again.

---

# 34. Information to Collect When Requesting Support

If the problem cannot be resolved using this guide, collect the following information:

* xstAuth Light Server version.
* Windows Server version.
* Description of the problem.
* Exact error message.
* Date and time the problem occurred.
* Whether the problem occurs locally or remotely.
* Result of:

```powershell
Get-NetTCPConnection -LocalPort 443 -State Listen
```

* Result of:

```powershell
nslookup <hostname>
```

* Result of:

```powershell
Test-NetConnection <hostname> -Port 443
```

Do **not** send private keys, passwords, secret credentials, or other sensitive security material when requesting support.

When reporting a certificate problem, provide certificate details such as the hostname, issuer, validity dates, and error message rather than providing the private key.

---

# 35. Security Reminder

Do not disable security controls simply to make a connection work.

In particular:

* Do not disable TLS certificate verification in production.
* Do not use an unrelated private key.
* Do not share private keys.
* Do not expose private keys through a public web directory.
* Do not open unnecessary firewall ports.
* Do not permanently bypass certificate warnings.
* Do not disable mTLS when mTLS is required for the deployment.

A successful connection is not necessarily a secure connection. Always restore the intended security configuration after troubleshooting.

---

## Quick Diagnostic Checklist

Use this checklist for a fast first check:

```text
[ ] xstAuth Light Server is running
[ ] Correct hostname is configured
[ ] Correct port is configured
[ ] DNS resolves to the correct server
[ ] Server is listening on the expected port
[ ] Windows Firewall permits the required port
[ ] Cloud firewall permits the required port
[ ] TLS certificate is valid
[ ] TLS certificate matches the hostname
[ ] Certificate chain is correct
[ ] Private key is correct
[ ] Certificate and private key match
[ ] Required CA certificates are trusted
[ ] mTLS client certificate is configured, if required
[ ] mTLS client private key is correct, if required
[ ] CCS can reach the server
[ ] Configuration changes have been saved
[ ] xstAuth Light Server has been restarted after applicable changes
```

---

## Still Having Problems?

If the problem persists after completing the relevant checks, record the exact error message and the results of the diagnostic commands above.

Avoid changing multiple unrelated settings at the same time. Making one change at a time makes it easier to identify the cause of the problem.
