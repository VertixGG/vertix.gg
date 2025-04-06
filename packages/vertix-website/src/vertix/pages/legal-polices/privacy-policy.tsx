import ReactMarkdown from 'react-markdown'

const markdown = `
#  Privacy Policy
This privacy policy explains how the creators of Vertix collect, use, and protect your personal information when you use Vertix.

1. Collection of Personal Information
When you use Vertix, the bot may collect certain personal information that you provide, such as your Discord user ID, server ID, and messages you send to the bot.
This information is necessary for the bot to provide its services.

2. Use of Personal Information
The personal information collected by Vertix is used to provide its services and to improve the bot's performance.
The creators of Vertix do not share your personal information with third parties, except as required by law or as necessary to provide the bot's services.

3. Protection of Personal Information
The creators of Vertix take reasonable measures to protect your personal information from unauthorized access, disclosure, or destruction.
However, no method of transmission over the Internet or method of electronic storage is completely secure, and the creators of Vertix cannot guarantee absolute security.

4. Cookies
Vertix may use cookies or similar technologies to improve the user experience and to provide its services.
You can disable cookies in your browser settings, but this may affect the functionality of the bot.

5. Third-party Services
Vertix may integrate with third-party services or websites, and the use of such services may be subject to additional privacy policies.
The creators of Vertix are not responsible for any content or services provided by third-party websites or services.

6. Changes to the Privacy Policy
The creators of Vertix may modify this privacy policy at any time, without
By continuing to use the bot after modifications are made to this policy, you agree to be bound by the revised policy.

If you have any questions or concerns about this privacy policy or your personal information, please contact the bot's creators at [Vertix Support](https://discord.gg/dEwKeQefUU).
`;

export default function PrivacyPolicy() {
    return (
        <div className="container box-1">
            <ReactMarkdown children={ markdown }/>
        </div>
    );
}
