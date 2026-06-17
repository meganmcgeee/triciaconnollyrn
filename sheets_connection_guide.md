# Google Sheets Lead Integration Guide

This guide explains how to connect your landing page lead capture forms to a Google Sheet using a free, serverless Google Apps Script Web App.

---

## Step 1: Create Your Google Sheet
1. Open [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. In the first row, define your header columns exactly as follows:
   * **Column A**: Timestamp
   * **Column B**: Full Name
   * **Column C**: Phone Number
   * **Column D**: Email Address
   * **Column E**: Service Needed
   * **Column F**: Message
   * **Column G**: UTM Source (Ad Network/Source)
   * **Column H**: UTM Medium
   * **Column I**: UTM Campaign
3. Name the sheet (tab) at the bottom `Sheet1` (this is the default).
4. Give your spreadsheet a title, e.g., `Tricia Connolly RN - Leads`.

---

## Step 2: Open and Configure Apps Script
1. In the Google Sheets top menu, go to **Extensions** > **Apps Script**.
2. Delete any default code in the editor (the empty `myFunction`).
3. Copy and paste the following script into the editor:

```javascript
function doPost(e) {
  try {
    // Open the default active sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse input parameters (handles JSON or standard form-urlencoded POSTs)
    var data;
    if (e.postData && e.postData.type === "application/json") {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    // Extract data fields
    var timestamp = new Date();
    var name = data.name || "";
    var phone = data.phone || "";
    var email = data.email || "";
    var service = data.service || "";
    var message = data.message || "";
    var utmSource = data.utm_source || "direct";
    var utmMedium = data.utm_medium || "";
    var utmCampaign = data.utm_campaign || "";
    
    // 1. Append new row to Google Sheet
    sheet.appendRow([
      timestamp, 
      name, 
      phone, 
      email, 
      service, 
      message, 
      utmSource, 
      utmMedium, 
      utmCampaign
    ]);
    
    // 2. Configure Notifications
    // Change this to your preferred notification email
    var emailRecipient = "pcm688@yahoo.com"; 
    
    // To send a direct text message for free, enter your mobile carrier's Email-to-SMS gateway:
    // Verizon: "3108894846@vtext.com" | AT&T: "3108894846@txt.att.net" | T-Mobile: "3108894846@tmomail.net"
    var smsRecipient = ""; 

    // 3. Send Email Alert
    var emailSubject = "🚨 NEW LEAD: " + name + " (" + service + ")";
    var emailBody = "You have received a new lead from your concierge nursing website:\n\n" +
                    "Name: " + name + "\n" +
                    "Phone: " + phone + "\n" +
                    "Email: " + email + "\n" +
                    "Service: " + service + "\n" +
                    "Message: " + message + "\n\n" +
                    "UTM Campaign Details:\n" +
                    "Source: " + utmSource + "\n" +
                    "Medium: " + utmMedium + "\n" +
                    "Campaign: " + utmCampaign + "\n\n" +
                    "Spreadsheet Link: " + SpreadsheetApp.getActiveSpreadsheet().getUrl();
    
    MailApp.sendEmail(emailRecipient, emailSubject, emailBody);

    // 4. Send SMS Alert (if recipient is provided)
    if (smsRecipient && smsRecipient.trim() !== "") {
      var smsBody = "New Lead Alert: " + name + " (" + phone + "). Service: " + service;
      MailApp.sendEmail(smsRecipient, "", smsBody);
    }
    
    // Return JSON success
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "message": "Lead captured successfully"
    })).setMimeType(ContentService.MimeType.JSON);
       
  } catch (error) {
    // Return error details
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle CORS Preflight requests
// (No longer needed: Google Apps Script web apps automatically redirect cross-origin requests)
```

4. Click the **Save** icon (floppy disk) at the top of the editor.

---

## Step 3: Deploy the Script as a Web App
1. Click the **Deploy** button in the top-right corner of the Apps Script page and select **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill out the deployment details:
   * **Description**: `Capture landing page leads`
   * **Execute as**: Select **Me (your-email@gmail.com)**
   * **Who has access**: Select **Anyone** *(Important: This allows the contact form on your landing pages to send data without requiring users to log in to Google)*.
4. Click **Deploy**.
5. Google will ask you to authorize access. Click **Authorize access**, choose your Google account, click **Advanced** (at the bottom), click **Go to Untitled project (unsafe)**, and select **Allow**.
6. Once deployed, copy the **Web app URL** (it ends in `/exec`).
7. Paste this URL into your project's `leads.js` file at the top:
   ```javascript
   const GOOGLE_SHEET_URL = "YOUR_WEB_APP_URL_HERE";
   ```

---

## Step 4: Test Your Form
Open any of your landing pages in a browser, fill out the form, click submit, and verify that the lead instantly appends as a new row in your Google Sheet!
