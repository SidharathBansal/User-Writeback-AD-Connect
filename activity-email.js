const fs = require('fs');
const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // Office 365 SMTP server
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'your-email@domain.com', // Your email address
        pass: 'your-email-password',  // Your email password or an app-specific password if 2FA is enabled
    },
    pool: true, // Enable pooling
    maxConnections: 3, // Limit the number of concurrent connections to 3
});

// List of usernames to send the notification to
const userList = [
    'john.doe',
    'jane.smith',
    'alice.jones',
    // Add more usernames as needed
];

// Email template with placeholders
const emailTemplate = (userName, domain2) => `
    <p>Dear ${userName},</p>

    <p>We hope this message finds you well. We are writing to inform you about an important update to your user account that will take place soon.</p>

    <p><b>What's Happening:</b></p>
    <ul>
        <li>We are enhancing our system's security and functionality.</li>
        <li>As part of this update, your account at ${domain2} will undergo some changes, including a password reset.</li>
    </ul>

    <p><b>When Will This Happen:</b></p>
    <ul>
        <li>The update is scheduled for 3 PM on 12th June. During this time, you may experience brief interruptions in accessing your account.</li>
    </ul>

    <p><b>What You Need to Do:</b></p>
    <ul>
        <li>No action is required from you before the update.</li>
        <li>After the update, you will receive another email with instructions on how to log in with your new temporary password and how to reset it to a new password of your choice.</li>
    </ul>

    <p><b>Need Help?</b></p>
    <ul>
        <li>If you have any questions or concerns, please feel free to reach out to our support team at [Support Email] or [Support Phone Number].</li>
    </ul>

    <p>We appreciate your understanding and cooperation as we work to improve our systems. Thank you for your attention to this matter.</p>

    <p>Best regards,</p>
    <p>[Your Name]<br>[Your Job Title]<br>[Company Name]<br>[Contact Information]</p>
`;

// Follow-up email template with placeholders
const followUpEmailTemplate = (userName, userPrincipalName, newPassword) => `
    <p>Dear ${userName},</p>

    <p>We have successfully updated your user account. Please find your new login details below:</p>

    <p><b>Temporary Login Details:</b></p>
    <ul>
        <li>Domain\\user name: bfhl\\${userPrincipalName}</li>
        <li>Current password: ${newPassword}</li>
    </ul>

    <p>As this is a randomly generated password; you can reset the same by using the below link:</p>
    <p><a href="https://sspr.healthrx.co.in/RdWeb/Pages/en-US/password.aspx">Reset Password</a></p>

    <p><b>Fields in the Given Link:</b></p>
    <ul>
        <li>Domain\\user name: <Domain>\\${userPrincipalName}</li>
        <li>Current password: ${newPassword}</li>
        <li>New password: // Set your New Password</li>
        <li>Confirm new password: // Confirm your New Password</li>
    </ul>

    <p>If you have any questions or need assistance, please contact our support team.</p>

    <p>Best regards,</p>
    <p>[Your Name]<br>[Your Job Title]<br>[Company Name]<br>[Contact Information]</p>
`;

// Function to send an email
const sendEmail = async (userName, subject, htmlContent) => {
    const domain1 = 'domain1.com';
    const email = `${userName}@${domain1}`;

    // Customize the email content for each recipient
    const mailOptions = {
        from: 'your-email@domain.com', // Sender address
        to: email, // Recipient address
        subject: subject,
        html: htmlContent // Replace placeholders with actual values
    };

    try {
        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${email}`);

        // Log success to success.log file
        fs.appendFileSync('success.log', `Email sent to: ${email}\n`);
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);

        // Log error to error.log file
        fs.appendFileSync('error.log', `Error sending email to ${email}: ${error}\n`);
    }
};

// Function to send initial notification emails
const sendInitialEmails = async () => {
    for (const userName of userList) {
        const domain2 = 'domain2.com';
        const [firstName, lastName] = userName.split('.');
        const formattedName = `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)} ${lastName.charAt(0).toUpperCase()}${lastName.slice(1)}`;
        const initialEmailContent = emailTemplate(formattedName, domain2);
        await sendEmail(userName, 'Upcoming Account Update and Password Reset', initialEmailContent);
    }
};

// Function to send follow-up emails
const sendFollowUpEmails = async () => {
    for (const userName of userList) {
        const domain2 = 'domain2.com';
        const userPrincipalName = `${userName}@${domain2}`;
        const newPassword = '<Strong Password>'; // The same password used in PowerShell script
        const [firstName, lastName] = userName.split('.');
        const formattedName = `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)} ${lastName.charAt(0).toUpperCase()}${lastName.slice(1)}`;
        const followUpEmailContent = followUpEmailTemplate(formattedName, userPrincipalName, newPassword);
        await sendEmail(userName, 'Your New Account Details', followUpEmailContent);
    }
};

// Main function to orchestrate the email sending process
const main = async () => {
    await sendInitialEmails();
    console.log('Initial emails sent successfully.');

    // Simulate some delay or wait for an external event before sending follow-up emails
    setTimeout(() => {
        sendFollowUpEmails().then(() => {
            console.log('Follow-up emails sent successfully.');
        }).catch((error) => {
            console.error('Error in sending follow-up emails:', error);
        });
    }, 60000); // Delay of 1 minute
};

// Call the main function
main().then(() => {
    console.log('Process completed successfully.');
}).catch((error) => {
    console.error('Error in the process:', error);
});