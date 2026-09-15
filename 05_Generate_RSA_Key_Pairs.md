# Generate RSA Key Pairs

This guide explains how to generate and configure the RSA key pairs and mTLS credentials required for the xstAuth Light Server (AAS) and Confidential Client System (CCS).

## Generate your own mTLS credentials and JWT signing key for production

For production deployments, generate your own mTLS credentials and JWT signing key according to your security requirements.

A guide for generating your own keys and certificates is provided on the **How to Setup** page, available under the **Help** menu in the **xstAuth Light Server**.

Follow the in-application guide to generate the required files for your production deployment.

---

## Sample mTLS credentials for quick testing

Sample mTLS credentials and a JWT public key are provided for quick testing and demonstration purposes. These files are not suitable for production use.


### 1. Move the Sample PEM Files — CCS Web Server

Create the directory on the CCS Web Server. Open PowerShell on the CCS Web Server and run:

```powershell
mkdir C:\xstAuth\CCS_mTLS
```

Move the following downloaded test files into the `C:\xstAuth\CCS_mTLS` directory on the CCS Web Server:

```text
mtlsKey.pem
mtlsCert.pem
mtlsRootCA.pem
publicKeyJWT.pem
```

The directory should contain:

```text
C:/xstAuth/CCS_mTLS/mtlsKey.pem
C:/xstAuth/CCS_mTLS/mtlsCert.pem
C:/xstAuth/CCS_mTLS/mtlsRootCA.pem
C:/xstAuth/CCS_mTLS/publicKeyJWT.pem
```

---

### 2. Move the Sample JWT Private Key — xstAuth Light Server

Create the directory on the xstAuth Light Server. Open PowerShell on the xstAuth Light Server and run:

```powershell
mkdir C:\xstAuth\AAS_JWT
```

Move the downloaded test file `privateKeyJWT.pem` into the `C:\xstAuth\AAS_JWT` directory on the xstAuth Light Server.

The directory should contain:

```text
C:/xstAuth/AAS_JWT/privateKeyJWT.pem
```

> ### Configure the mTLS credentials
>
> The mTLS credentials configured in the CCS Web Server must exactly match the corresponding mTLS configuration on the **xstAuth Light Server**.
> 
> The CCS Web Server accesses the mTLS credentials using file paths. The xstAuth Light Server accesses its mTLS credentials directly as encrypted credentials.
>

> ### Important Security
>
> The sample mTLS credentials and JWT signing key are provided for testing and demonstration purposes only. For production use, generate and configure your own mTLS credentials and JWT signing key according to your security requirements.
>
> Never publish private keys, signing keys, or other sensitive credentials.
>
> For production key generation instructions, refer to the **How to Setup** page under the **Help** menu in the **xstAuth Light Server**.

## Step 2 Complete

After completing **Step 2**, you should have successfully prepared RSA key pairs.

You can now proceed to configure xstAuth Light Server. See [`06_Config_AAS_Auth_Server.md`](06_Config_AAS_Auth_Server.md).

---
