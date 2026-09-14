# Configure Internal DNS and Windows Firewall

This guide explains how to configure internal hostname resolution and Windows Firewall rules for communication between the xstAuth Light Server (AAS) and your Confidential Client System (CCS).

# 1. Configure the Private/Internal DNS

The CCS Web Server and xstAuth Light Server must be able to resolve each other using their private/internal DNS names.

For example, assume the following configuration:

| Server               | Internal hostname | Example private IP |
| -------------------- | ----------------- | ------------------ |
| CCS Web Server       | `ccs.private.io`  | `10.14.2.18`       |
| xstAuth Light Server | `aas.private.io`  | `10.14.2.19`       |

> **Important:** The IP addresses above are examples only. Replace them with the actual private IP addresses assigned to your servers.

## 1.1 Configure Internal DNS

If you have an internal/private DNS Hosted Zone, ensure that the following DNS records exist:

```text
ccs.private.io  →  <CCS Web Server private IP address>

aas.private.io  →  <xstAuth Light Server private IP address>
```

Both servers should be able to resolve both hostnames.

For example, from the CCS Web Server, run:

```powershell
nslookup ccs.private.io
nslookup aas.private.io
```

And from the xstAuth Light Server:

```powershell
nslookup ccs.private.io
nslookup aas.private.io
```

The returned addresses should correspond to the private IP addresses of the appropriate servers.

---

## 1.2 Hostname Resolution Using the Windows Hosts File

For a small, controlled environment, the Windows hosts file can be used for internal hostname resolution in production, provided the operator understands its limitations.

For larger environments, an internal/private DNS Hosted Zone is recommended to provide centralised hostname management and easier administration. The hosts file method can also be used for quick testing where an internal/private DNS Hosted Zone is not yet available.

The `hosts` file is located at:

```text
C:\Windows\System32\drivers\etc\hosts
```

Add the following entries to the `hosts` file on both the **CCS Web Server** and the **xstAuth Light Server**:

```text
# localhost name resolution is handled within DNS itself.
# 127.0.0.1       localhost
# ::1             localhost

# CCS Web Server
      10.14.2.18    ccs.private.io

# xstAuth Light Server
      10.14.2.19    aas.private.io
```

Replace the example IP addresses with the actual private IP addresses of your servers.

**Important:** The `hosts` file must be edited and saved with Administrator privileges.

### How to edit the hosts file

1. Search for **Notepad**.
2. Right-click **Notepad** and select **Run as administrator**.
3. In Notepad, select **File > Open**.
4. Navigate to:

   ```text
   C:\Windows\System32\drivers\etc\hosts
   ```
5. Change the file type from **Text Documents (*.txt)** to **All Files**.
6. Select **hosts** and click **Open**.
7. Update the hosts file as required and **Save**.

The corresponding entries must be configured on both servers:

* CCS Web Server
* xstAuth Light Server

---

# 2. Configure Windows Firewall

The CCS Web Server and xstAuth Light Server communicate with each other over the private network using HTTPS/mTLS on **TCP port 8443**.

The Windows Firewall should allow inbound TCP port `8443` only from the private IP address of the other server. This limits the service to the required server-to-server communication rather than unnecessarily exposing the port to the wider network.

> **Network firewall:** If your servers are hosted in a cloud environment or behind a network firewall, you may also need to allow TCP port 8443 in the applicable network-level firewall rules or security group.

## 2.1 CCS Web Server Firewall Rule

On the **CCS Web Server**, allow inbound TCP connections on port `8443` from the private IP address of the xstAuth Light Server.

Run PowerShell as **Administrator**:

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
<xstAuth Light Server private IP address>
```

with the actual private IP addresses.

### One-line alternative

If the multi-line PowerShell command does not work correctly in your environment, use:

```powershell
New-NetFirewallRule -DisplayName "Allow Private mTLS/HTTPS Inbound from xstAuth Server" -Direction Inbound -Protocol TCP -LocalPort 8443 -LocalAddress "<CCS Web Server private IP address>" -RemoteAddress "<xstAuth Light Server private IP address>" -Profile Any -Action Allow
```

After creating the firewall rules, verify that the rules exist:

```powershell
Get-NetFirewallRule -DisplayName "Allow Private mTLS/HTTPS Inbound from xstAuth Server"
```

---

## 2.2 xstAuth Light Server Firewall Rule

On the **xstAuth Light Server**, allow inbound TCP connections on port `8443` from the private IP address of the CCS Web Server.

Run PowerShell as **Administrator**:

```powershell
New-NetFirewallRule `
    -DisplayName "Allow Private mTLS/HTTPS Inbound from CCS Web Server" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 8443 `
    -LocalAddress "<xstAuth Light Server private IP address>" `
    -RemoteAddress "<CCS Web Server private IP address>" `
    -Profile Any `
    -Action Allow
```

Replace:

```text
<xstAuth Light Server private IP address>
<CCS Web Server private IP address>
```

with the actual private IP addresses.

### One-line alternative

```powershell
New-NetFirewallRule -DisplayName "Allow Private mTLS/HTTPS Inbound from CCS Web Server" -Direction Inbound -Protocol TCP -LocalPort 8443 -LocalAddress "<xstAuth Light Server private IP address>" -RemoteAddress "<CCS Web Server private IP address>" -Profile Any -Action Allow
```

After creating the firewall rules, verify that the rules exist:

```powershell
Get-NetFirewallRule -DisplayName "Allow Private mTLS/HTTPS Inbound from CCS Web Server"
```

## Step 2 Complete

After completing **Step 2**, you should have successfully configured Internal DNS and Windows Firewall.

Assumption: You have added the required entries to the `hosts` file on both the **CCS Web Server** and the **xstAuth Light Server**.

You can now proceed to generate RSA key pairs. See [`05_Generate_RSA_Key_Pairs.md`](05_Generate_RSA_Key_Pairs.md).

---
